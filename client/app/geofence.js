import { useEffect, useRef, useState } from "react";
import { View, Text, Alert, StyleSheet, ActivityIndicator } from "react-native";
import { Card, Title, Divider, FAB, Chip, Button } from "react-native-paper";
import * as Location from "expo-location";
import * as ImagePicker from "expo-image-picker";
import MapView, { Marker, Circle, Polygon } from "react-native-maps";
import { LinearGradient } from "expo-linear-gradient";
import api from "../utils/api";

export default function GeofenceScreen() {
  const [location, setLocation] = useState(null);
  const [insideZone, setInsideZone] = useState(false);
  const [geofences, setGeofences] = useState([]);
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [photoUploading, setPhotoUploading] = useState(false);
  const [sosLoading, setSosLoading] = useState(false);

  const subscriptionRef = useRef(null);
  const mountedRef = useRef(true);

  useEffect(() => {
    mountedRef.current = true;

    const init = async () => {
      try {
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== "granted") {
          setError("Location permission denied");
          Alert.alert(
            "Permission Required",
            "Please enable location access in your device settings to use geofencing features.",
            [
              { text: "Cancel", style: "cancel" },
              {
                text: "Settings",
                onPress: () => Location.enableNetworkProviderAsync(),
              },
            ]
          );
          setIsLoading(false);
          return;
        }

        // Watch position with improved accuracy
        const sub = await Location.watchPositionAsync(
          {
            accuracy: Location.Accuracy.BestForNavigation,
            timeInterval: 3000,
            distanceInterval: 5,
          },
          (loc) => {
            if (!mountedRef.current) return;
            setLocation((prev) => {
              if (isLoading) setIsLoading(false);
              return loc.coords;
            });
            checkLocationAndFetchGeofences(loc.coords).catch((e) =>
              console.error("[Geofence] watch check error:", e)
            );
          }
        );

        subscriptionRef.current = sub;
      } catch (err) {
        console.error("[Geofence] initialization error:", err);
        if (mountedRef.current) {
          setError("Failed to initialize location services");
          setIsLoading(false);
        }
      }
    };

    init();

    return () => {
      mountedRef.current = false;
      if (subscriptionRef.current && subscriptionRef.current.remove) {
        subscriptionRef.current.remove();
        subscriptionRef.current = null;
      }
    };
  }, []);

  const checkLocationAndFetchGeofences = async (coords) => {
    if (!coords) return;
    try {
      const res = await api.post("/geofence/check-location", {
        latitude: coords.latitude,
        longitude: coords.longitude,
      });
      if (mountedRef.current) setInsideZone(Boolean(res.data.inside));
    } catch (err) {
      console.error("[Geofence] check-location API error:", err.message);
    }

    try {
      const nearby = await api.get("/geofence/nearby", {
        params: { lat: coords.latitude, lon: coords.longitude, radius: 5000 },
      });
      if (mountedRef.current) setGeofences(nearby.data || []);
    } catch (err) {
      console.error("[Geofence] nearby API error:", err.message);
      if (mountedRef.current) setGeofences([]);
    }
  };

  // Render geofences with enhanced styling
  const renderGeofences = () => {
    return geofences.map((g, index) => {
      try {
        const geom = JSON.parse(g.geometry);
        const colors = [
          {
            stroke: "rgba(59, 130, 246, 0.9)",
            fill: "rgba(59, 130, 246, 0.25)",
          },
          {
            stroke: "rgba(16, 185, 129, 0.9)",
            fill: "rgba(16, 185, 129, 0.25)",
          },
          {
            stroke: "rgba(245, 158, 11, 0.9)",
            fill: "rgba(245, 158, 11, 0.25)",
          },
          { stroke: "rgba(239, 68, 68, 0.9)", fill: "rgba(239, 68, 68, 0.25)" },
        ];
        const colorSet = colors[index % colors.length];

        if (geom.type === "Polygon") {
          return (
            <Polygon
              key={g.id}
              coordinates={geom.coordinates[0].map(([lon, lat]) => ({
                latitude: lat,
                longitude: lon,
              }))}
              strokeColor={colorSet.stroke}
              fillColor={colorSet.fill}
              strokeWidth={3}
            />
          );
        } else if (geom.type === "Point") {
          return (
            <Circle
              key={g.id}
              center={{
                latitude: geom.coordinates[1],
                longitude: geom.coordinates[0],
              }}
              radius={150}
              strokeColor={colorSet.stroke}
              fillColor={colorSet.fill}
              strokeWidth={3}
            />
          );
        }
      } catch (err) {
        console.error("Error parsing geofence geometry:", err);
      }
      return null;
    });
  };

  // Enhanced photo upload with better UX
  const handleUploadPhoto = async () => {
    try {
      setPhotoUploading(true);
      const { status } = await ImagePicker.requestCameraPermissionsAsync();
      if (status !== "granted") {
        Alert.alert(
          "Camera Permission Required",
          "Please allow camera access to take safety check-in photos."
        );
        return;
      }

      const result = await ImagePicker.launchCameraAsync({
        quality: 0.8,
        allowsEditing: true,
        aspect: [16, 9],
        exif: true,
      });

      if (!result.canceled && result.assets?.length > 0) {
        const uri = result.assets[0].uri;
        const formData = new FormData();
        formData.append("photo", {
          uri,
          name: `checkin_${Date.now()}.jpg`,
          type: "image/jpeg",
        });

        if (location) {
          formData.append("latitude", location.latitude.toString());
          formData.append("longitude", location.longitude.toString());
        }

        if (geofences.length > 0) {
          formData.append("geofenceId", String(geofences[0].id));
        }

        await api.post("/photos/upload", formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });

        Alert.alert(
          "Success",
          "Safety check-in photo uploaded successfully! Your family has been notified.",
          [{ text: "OK", style: "default" }]
        );
      }
    } catch (err) {
      console.error("Photo upload error:", err.message);
      Alert.alert(
        "Upload Failed",
        "Unable to upload photo. Please check your internet connection and try again."
      );
    } finally {
      setPhotoUploading(false);
    }
  };

  // Enhanced SOS with better alerts
  const handleSOS = async () => {
    if (!location) {
      Alert.alert(
        "Location Error",
        "Unable to get your current location for SOS."
      );
      return;
    }

    Alert.alert(
      "🚨 Emergency SOS",
      "This will immediately notify your family members and emergency services of your location. Are you sure you want to continue?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Send SOS",
          style: "destructive",
          onPress: async () => {
            try {
              setSosLoading(true);
              const res = await api.post("/sos/trigger", {
                latitude: location.latitude,
                longitude: location.longitude,
                message:
                  "🚨 EMERGENCY: I need immediate help! This is an automated SOS alert from TourGuard360.",
                timestamp: new Date().toISOString(),
              });

              Alert.alert(
                "SOS Alert Sent",
                "Emergency services and your family members have been notified of your location. Help is on the way.",
                [{ text: "OK", style: "default" }]
              );

              console.log("SOS Response:", res.data);
            } catch (err) {
              console.error("SOS error:", err.message);
              Alert.alert(
                "SOS Failed",
                "Unable to send emergency alert. Please call emergency services directly or try again."
              );
            } finally {
              setSosLoading(false);
            }
          },
        },
      ]
    );
  };

  const defaultRegion = {
    latitude: 22.9734,
    longitude: 78.6569,
    latitudeDelta: 10,
    longitudeDelta: 10,
  };

  const currentRegion = location
    ? {
        latitude: location.latitude,
        longitude: location.longitude,
        latitudeDelta: 0.008,
        longitudeDelta: 0.008,
      }
    : defaultRegion;

  return (
    <View style={styles.container}>
      <MapView
        style={styles.map}
        initialRegion={currentRegion}
        region={location ? currentRegion : undefined}
        showsUserLocation={true}
        showsMyLocationButton={false}
        showsCompass={true}
        showsScale={true}
        loadingEnabled={true}
        mapType="standard"
        customMapStyle={mapStyle}
      >
        {location && (
          <Marker
            coordinate={{
              latitude: location.latitude,
              longitude: location.longitude,
            }}
            title="Your Current Location"
            description="You are here"
            pinColor="#3b82f6"
          />
        )}
        {renderGeofences()}
      </MapView>

      {isLoading && (
        <LinearGradient
          colors={["rgba(248, 250, 252, 0.95)", "rgba(241, 245, 249, 0.95)"]}
          style={styles.loadingOverlay}
        >
          <ActivityIndicator size="large" color="#3b82f6" />
          <Text style={styles.loadingTitle}>
            {error ? "Location Error" : "Getting Your Location"}
          </Text>
          <Text style={styles.loadingSubtitle}>
            {error ? error : "Setting up geofencing protection..."}
          </Text>
          {error && (
            <Button
              mode="outlined"
              onPress={() => {
                setError(null);
                setIsLoading(true);
                // Retry initialization
              }}
              style={styles.retryButton}
            >
              Try Again
            </Button>
          )}
        </LinearGradient>
      )}

      {!isLoading && location && (
        <Card style={styles.statusCard} elevation={8}>
          <Card.Content style={styles.statusContent}>
            <View style={styles.statusHeader}>
              <Title style={styles.statusTitle}>Safety Status</Title>
              <Chip
                icon={insideZone ? "shield-check" : "shield-alert"}
                style={[
                  styles.statusChip,
                  insideZone ? styles.safeChip : styles.alertChip,
                ]}
                textStyle={[
                  styles.chipText,
                  insideZone ? styles.safeText : styles.alertText,
                ]}
              >
                {insideZone ? "SAFE ZONE" : "OUTSIDE ZONE"}
              </Chip>
            </View>

            <Divider style={styles.statusDivider} />

            <View style={styles.locationInfo}>
              <Text style={styles.coordinatesLabel}>Current Location:</Text>
              <Text style={styles.coordinatesText}>
                {location.latitude.toFixed(6)}, {location.longitude.toFixed(6)}
              </Text>
              <Text style={styles.geofenceCount}>
                🛡️ {geofences.length} safety zone
                {geofences.length !== 1 ? "s" : ""} nearby
              </Text>
            </View>
          </Card.Content>
        </Card>
      )}

      {/* Action Buttons */}
      {!isLoading && location && insideZone && (
        <FAB
          style={styles.photoFAB}
          icon="camera"
          label="Check-in"
          onPress={handleUploadPhoto}
          loading={photoUploading}
          disabled={photoUploading}
          color="#ffffff"
        />
      )}

      {!isLoading && location && (
        <FAB
          style={styles.sosFAB}
          icon="alert"
          label="SOS"
          onPress={handleSOS}
          loading={sosLoading}
          disabled={sosLoading}
          color="#ffffff"
        />
      )}
    </View>
  );
}

// Custom map style for better visibility
const mapStyle = [
  {
    featureType: "poi",
    elementType: "labels",
    stylers: [{ visibility: "off" }],
  },
  {
    featureType: "transit",
    elementType: "labels",
    stylers: [{ visibility: "off" }],
  },
];

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8fafc",
  },
  map: {
    flex: 1,
  },
  loadingOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 40,
  },
  loadingTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#1e293b",
    marginTop: 20,
    marginBottom: 8,
    textAlign: "center",
  },
  loadingSubtitle: {
    fontSize: 16,
    color: "#64748b",
    textAlign: "center",
    lineHeight: 22,
  },
  retryButton: {
    marginTop: 20,
    borderColor: "#3b82f6",
  },
  statusCard: {
    position: "absolute",
    bottom: 140,
    left: 16,
    right: 16,
    borderRadius: 16,
    backgroundColor: "#ffffff",
  },
  statusContent: {
    paddingVertical: 16,
    paddingHorizontal: 20,
  },
  statusHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  statusTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#1e293b",
    marginBottom: 0,
  },
  statusChip: {
    borderWidth: 1,
  },
  safeChip: {
    backgroundColor: "#f0fdf4",
    borderColor: "#bbf7d0",
  },
  alertChip: {
    backgroundColor: "#fef2f2",
    borderColor: "#fecaca",
  },
  chipText: {
    fontSize: 12,
    fontWeight: "bold",
  },
  safeText: {
    color: "#166534",
  },
  alertText: {
    color: "#dc2626",
  },
  statusDivider: {
    backgroundColor: "#e2e8f0",
    marginBottom: 12,
  },
  locationInfo: {
    alignItems: "center",
  },
  coordinatesLabel: {
    fontSize: 12,
    color: "#64748b",
    fontWeight: "500",
    marginBottom: 4,
  },
  coordinatesText: {
    fontSize: 14,
    color: "#374151",
    fontFamily: "monospace",
    marginBottom: 8,
  },
  geofenceCount: {
    fontSize: 14,
    color: "#64748b",
    textAlign: "center",
  },
  photoFAB: {
    position: "absolute",
    right: 20,
    bottom: 80,
    backgroundColor: "#3b82f6",
    borderRadius: 16,
  },
  sosFAB: {
    position: "absolute",
    right: 20,
    bottom: 20,
    backgroundColor: "#dc2626",
    borderRadius: 16,
  },
});
