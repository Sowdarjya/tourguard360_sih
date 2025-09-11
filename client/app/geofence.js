// GeofenceScreen.js
import { useEffect, useRef, useState } from "react";
import {
  View,
  Text,
  Alert,
  StyleSheet,
  ActivityIndicator,
} from "react-native";
import { Card, Button, Title, Divider, FAB } from "react-native-paper";
import * as Location from "expo-location";
import * as ImagePicker from "expo-image-picker";
import MapView, { Marker, Circle, Polygon } from "react-native-maps";
import api from "../utils/api";

export default function GeofenceScreen() {
  const [location, setLocation] = useState(null);
  const [insideZone, setInsideZone] = useState(false);
  const [geofences, setGeofences] = useState([]);
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  const subscriptionRef = useRef(null);
  const mountedRef = useRef(true);

  useEffect(() => {
    mountedRef.current = true;

    const init = async () => {
      try {
        console.log("[Geofence] init");
        const { status } = await Location.requestForegroundPermissionsAsync();
        console.log("[Geofence] permission status:", status);

        if (status !== "granted") {
          setError("Location permission denied");
          Alert.alert(
            "Permission required",
            "Enable location access to use this feature."
          );
          setIsLoading(false);
          return;
        }

        // Start watching position immediately
        const sub = await Location.watchPositionAsync(
          {
            accuracy: Location.Accuracy.High,
            timeInterval: 5000,
            distanceInterval: 10,
          },
          (loc) => {
            if (!mountedRef.current) return;
            console.log("[Geofence] watch pos:", loc.coords);
            setLocation((prev) => {
              // Only set isLoading to false on first location
              if (isLoading) setIsLoading(false);
              return loc.coords;
            });
            checkLocationAndFetchGeofences(loc.coords).catch((e) =>
              console.error("[Geofence] watch check error:", e)
            );
          }
        );

        subscriptionRef.current = sub;
        console.log("[Geofence] watching started");
      } catch (err) {
        console.error("[Geofence] initialization error:", err);
        if (mountedRef.current) {
          setError("Failed to initialize location");
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
      console.log("[Geofence] cleanup");
    };
  }, []);

  const checkLocationAndFetchGeofences = async (coords) => {
    if (!coords) return;
    try {
      console.log("[Geofence] checking location", coords);
      const res = await api.post("/geofence/check-location", {
        latitude: coords.latitude,
        longitude: coords.longitude,
      });
      console.log("[Geofence] check-location response:", res.data);
      if (mountedRef.current) setInsideZone(Boolean(res.data.inside));
    } catch (err) {
      console.error(
        "[Geofence] check-location API error:",
        err?.response?.data || err.message || err
      );
      // don't throw — swallow and continue
    }

    try {
      const nearby = await api.get("/geofence/nearby", {
        params: { lat: coords.latitude, lon: coords.longitude, radius: 5000 },
      });
      console.log("[Geofence] nearby geofences:", nearby.data?.length ?? 0);
      if (mountedRef.current) setGeofences(nearby.data || []);
    } catch (err) {
      console.error(
        "[Geofence] nearby API error:",
        err?.response?.data || err.message || err
      );
      if (mountedRef.current) setGeofences([]);
    }
  };

  // Render polygons/circles returned by backend (GeoJSON in g.geometry)
  const renderGeofences = () => {
    return geofences.map((g) => {
      try {
        const geom = JSON.parse(g.geometry);
        if (geom.type === "Polygon") {
          // GeoJSON polygon coordinates: [ [ [lon, lat], ... ] ]
          return (
            <Polygon
              key={g.id}
              coordinates={geom.coordinates[0].map(([lon, lat]) => ({
                latitude: lat,
                longitude: lon,
              }))}
              strokeColor="rgba(255,0,0,0.9)"
              fillColor="rgba(255,0,0,0.25)"
              strokeWidth={2}
            />
          );
        } else if (geom.type === "Point") {
          // Treat point as a circle fence (radius 100m default)
          return (
            <Circle
              key={g.id}
              center={{
                latitude: geom.coordinates[1],
                longitude: geom.coordinates[0],
              }}
              radius={100}
              strokeColor="rgba(255,0,0,0.9)"
              fillColor="rgba(255,0,0,0.25)"
            />
          );
        } else {
          // unsupported geometry
          return null;
        }
      } catch (parseError) {
        console.error("Error parsing geofence geometry:", parseError);
        return null;
      }
    });
  };

  // Camera upload
  const handleUploadPhoto = async () => {
    try {
      const { status } = await ImagePicker.requestCameraPermissionsAsync();
      if (status !== "granted") {
        Alert.alert(
          "Permission required",
          "Camera access is needed to take photos."
        );
        return;
      }

      const result = await ImagePicker.launchCameraAsync({
        quality: 0.7,
        allowsEditing: true,
        aspect: [4, 3],
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        const uri = result.assets[0].uri;
        const formData = new FormData();
        formData.append("photo", {
          uri,
          name: "checkin.jpg",
          type: "image/jpeg",
        });

        // optional: include nearest geofence id if available
        if (geofences.length > 0)
          formData.append("geofenceId", String(geofences[0].id));

        await api.post("/photos/upload", formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });
        Alert.alert("Success", "Photo uploaded successfully!");
      }
    } catch (err) {
      console.error(
        "Photo upload error:",
        err?.response?.data || err.message || err
      );
      Alert.alert("Error", "Failed to upload photo. Please try again.");
    }
  };

  // Default region (center of India)
  const defaultRegion = {
    latitude: 22.9734,
    longitude: 78.6569,
    latitudeDelta: 10,
    longitudeDelta: 10,
  };

  return (
    <View style={styles.container}>
      <MapView
        style={styles.map}
        initialRegion={
          location
            ? {
                latitude: location.latitude,
                longitude: location.longitude,
                latitudeDelta: 0.01,
                longitudeDelta: 0.01,
              }
            : defaultRegion
        }
        region={
          location
            ? {
                latitude: location.latitude,
                longitude: location.longitude,
                latitudeDelta: 0.01,
                longitudeDelta: 0.01,
              }
            : undefined
        }
        showsUserLocation={true}
        showsMyLocationButton={true}
        loadingEnabled={true}
      >
        {location && (
          <Marker
            coordinate={{
              latitude: location.latitude,
              longitude: location.longitude,
            }}
            title="Your Location"
            description="Current position"
            pinColor="blue"
          />
        )}
        {renderGeofences()}
      </MapView>

      {isLoading && (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#0066cc" />
          <Text style={styles.loadingText}>
            {error ? `Error: ${error}` : "Fetching location..."}
          </Text>
        </View>
      )}
      {!isLoading && location && (
        <Card style={styles.infoPanel} elevation={6}>
          <Card.Content>
            <Title style={styles.panelTitle}>Geofence Status</Title>
            <Divider style={{ marginBottom: 8 }} />
            <Text style={styles.coordinatesText}>
              Lat: {location.latitude.toFixed(5)}, Lon: {location.longitude.toFixed(5)}
            </Text>
            <Text
              style={[styles.zoneStatusText, insideZone ? styles.inside : styles.outside]}
            >
              {insideZone ? "Inside Safe Zone" : "Outside Zone"}
            </Text>
            <Text style={styles.geofenceCount}>
              Nearby geofences: {geofences.length}
            </Text>
          </Card.Content>
        </Card>
      )}
      {!isLoading && location && insideZone && (
        <FAB
          style={styles.fab}
          icon="camera"
          label="Upload Photo"
          onPress={handleUploadPhoto}
        />
      )}
      {!isLoading && error && (
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Error: {error}</Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  map: { flex: 1 },
  infoPanel: {
    position: "absolute",
    bottom: 50,
    left: 20,
    right: 20,
    padding: 0,
    borderRadius: 12,
    elevation: 6,
  },
  panelTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 4,
    textAlign: "center",
  },
  coordinatesText: { fontSize: 12, color: "#666", marginBottom: 5, textAlign: "center" },
  zoneStatusText: { fontSize: 16, fontWeight: "bold", marginBottom: 5, textAlign: "center" },
  inside: { color: "#2e7d32" },
  outside: { color: "#c62828" },
  geofenceCount: { fontSize: 12, color: "#666", marginBottom: 10, textAlign: "center" },
  fab: {
    position: "absolute",
    right: 30,
    bottom: 120,
    backgroundColor: "#1976d2",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f5f5f5",
  },
  loadingText: { marginTop: 10, fontSize: 16, color: "#666" },
});
