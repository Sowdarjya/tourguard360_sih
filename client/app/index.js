import React, { useState, useEffect } from "react";
import { View, StyleSheet, ScrollView } from "react-native";
import { Card, Title, Text, Button, Divider, Avatar } from "react-native-paper";
import { logout, getKycStatus } from "../utils/auth";
import { useRouter } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8fafc",
  },
  gradientHeader: {
    paddingTop: 50,
    paddingBottom: 30,
    paddingHorizontal: 20,
  },
  headerContent: {
    alignItems: "center",
  },
  avatar: {
    backgroundColor: "#ffffff",
    marginBottom: 12,
  },
  userAvatar: {
    marginBottom: 12,
    borderWidth: 3,
    borderColor: "#ffffff",
  },
  welcomeText: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#ffffff",
    textAlign: "center",
    marginBottom: 4,
  },
  appName: {
    fontSize: 18,
    color: "#e2e8f0",
    textAlign: "center",
    fontWeight: "500",
  },
  userName: {
    fontSize: 22,
    color: "#ffffff",
    textAlign: "center",
    fontWeight: "600",
    marginBottom: 4,
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  featuresCard: {
    marginBottom: 20,
    borderRadius: 16,
    elevation: 3,
  },
  userInfoCard: {
    marginBottom: 20,
    borderRadius: 16,
    elevation: 3,
    backgroundColor: "#f0fdf4",
    borderWidth: 1,
    borderColor: "#bbf7d0",
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 16,
    color: "#1e293b",
  },
  userInfoTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 12,
    color: "#166534",
  },
  userInfoText: {
    fontSize: 14,
    color: "#166534",
    marginBottom: 6,
  },
  buttonGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    marginBottom: 20,
  },
  featureButton: {
    width: "48%",
    marginBottom: 12,
    borderRadius: 12,
    elevation: 2,
  },
  buttonContent: {
    paddingVertical: 12,
    paddingHorizontal: 8,
  },
  geofenceButton: {
    backgroundColor: "#3b82f6",
  },
  familyButton: {
    backgroundColor: "#10b981",
  },
  logoutCard: {
    borderRadius: 16,
    elevation: 2,
    backgroundColor: "#fef2f2",
    borderWidth: 1,
    borderColor: "#fecaca",
  },
  logoutButton: {
    borderRadius: 8,
    borderColor: "#dc2626",
  },
  statusCard: {
    marginBottom: 20,
    borderRadius: 16,
    elevation: 2,
    backgroundColor: "#f0fdf4",
    borderWidth: 1,
    borderColor: "#bbf7d0",
  },
  statusText: {
    fontSize: 16,
    color: "#166534",
    textAlign: "center",
    fontWeight: "500",
  },
  dividerStyle: {
    marginVertical: 12,
    backgroundColor: "#e2e8f0",
  },
  verifiedBadge: {
    backgroundColor: "#16a34a",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    alignSelf: "center",
    marginTop: 8,
  },
  verifiedText: {
    color: "#ffffff",
    fontSize: 12,
    fontWeight: "600",
  },
});

export default function HomeScreen() {
  const router = useRouter();
  const [userData, setUserData] = useState(null);
  const [kycVerifiedAt, setKycVerifiedAt] = useState(null);

  useEffect(() => {
    const loadUserData = async () => {
      try {
        const kycStatus = await getKycStatus();
        if (kycStatus.isVerified) {
          setUserData(kycStatus.userData);
          setKycVerifiedAt(kycStatus.verifiedAt);
        }
      } catch (error) {
        console.error("Error loading user data:", error);
      }
    };

    loadUserData();
  }, []);

  const handleLogout = async () => {
    await logout(); // This will also clear KYC data
    router.replace("/login");
  };

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={["#667eea", "#764ba2"]}
        style={styles.gradientHeader}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <View style={styles.headerContent}>
          {userData?.photo ? (
            <Avatar.Image
              size={60}
              source={{ uri: `data:image/jpeg;base64,${userData.photo}` }}
              style={styles.userAvatar}
            />
          ) : (
            <Avatar.Icon
              size={60}
              icon="shield-check"
              style={styles.avatar}
              color="#667eea"
            />
          )}
          <Text style={styles.welcomeText}>
            {userData ? `Welcome, ${userData.name.split(' ')[0]}!` : 'Welcome Back!'}
          </Text>
          <Text style={styles.appName}>TourGuard360</Text>
          {userData && (
            <View style={styles.verifiedBadge}>
              <Text style={styles.verifiedText}>
                ✓ KYC Verified {kycVerifiedAt && `on ${new Date(kycVerifiedAt).toLocaleDateString()}`}
              </Text>
            </View>
          )}
        </View>
      </LinearGradient>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <Card style={styles.statusCard} elevation={2}>
          <Card.Content>
            <Text style={styles.statusText}>
              🛡️ Your safety companion is active and ready
            </Text>
          </Card.Content>
        </Card>

        {userData && (
          <Card style={styles.userInfoCard} elevation={3}>
            <Card.Content>
              <Title style={styles.userInfoTitle}>Verified Profile</Title>
              <Divider style={[styles.dividerStyle, { backgroundColor: "#bbf7d0" }]} />
              <Text style={styles.userInfoText}>
                <Text style={{ fontWeight: "600" }}>Name:</Text> {userData.name}
              </Text>
              <Text style={styles.userInfoText}>
                <Text style={{ fontWeight: "600" }}>Date of Birth:</Text> {userData.dob}
              </Text>
              <Text style={styles.userInfoText}>
                <Text style={{ fontWeight: "600" }}>Gender:</Text> {userData.gender === 'M' ? 'Male' : userData.gender === 'F' ? 'Female' : userData.gender}
              </Text>
              <Text style={styles.userInfoText}>
                <Text style={{ fontWeight: "600" }}>Address:</Text> {userData.address}
              </Text>
            </Card.Content>
          </Card>
        )}

        <Card style={styles.featuresCard} elevation={3}>
          <Card.Content>
            <Title style={styles.sectionTitle}>Safety Features</Title>
            <Divider style={styles.dividerStyle} />

            <View style={styles.buttonGrid}>
              <Button
                mode="contained"
                icon="map-marker-radius"
                onPress={() => router.push("/geofence")}
                style={[styles.featureButton, styles.geofenceButton]}
                contentStyle={styles.buttonContent}
                labelStyle={{ fontSize: 16, fontWeight: "600" }}
              >
                Geofencing
              </Button>

              <Button
                mode="contained"
                icon="account-group"
                onPress={() => router.push("/family")}
                style={[styles.featureButton, styles.familyButton]}
                contentStyle={styles.buttonContent}
                labelStyle={{ fontSize: 16, fontWeight: "600" }}
              >
                Family
              </Button>
            </View>

            <Text
              style={{
                fontSize: 14,
                color: "#64748b",
                textAlign: "center",
                marginTop: 8,
                fontStyle: "italic",
              }}
            >
              Tap any feature to get started
            </Text>
          </Card.Content>
        </Card>

        <Card style={styles.logoutCard} elevation={2}>
          <Card.Content>
            <Title
              style={[
                styles.sectionTitle,
                { color: "#dc2626", textAlign: "center" },
              ]}
            >
              Account
            </Title>
            <Divider
              style={[styles.dividerStyle, { backgroundColor: "#fecaca" }]}
            />
            <Button
              mode="outlined"
              icon="logout"
              onPress={handleLogout}
              style={styles.logoutButton}
              contentStyle={{ paddingVertical: 8 }}
              labelStyle={{ color: "#dc2626", fontSize: 16, fontWeight: "600" }}
            >
              Sign Out
            </Button>
          </Card.Content>
        </Card>
      </ScrollView>
    </View>
  );
}
