import React from "react";
import { View, StyleSheet, ScrollView } from "react-native";
import { Card, Title, Text, Button, Divider, Avatar } from "react-native-paper";
import { logout } from "../utils/auth";
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
  sectionTitle: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 16,
    color: "#1e293b",
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
});

export default function HomeScreen() {
  const router = useRouter();

  const handleLogout = async () => {
    await logout();
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
          <Avatar.Icon
            size={60}
            icon="shield-check"
            style={styles.avatar}
            color="#667eea"
          />
          <Text style={styles.welcomeText}>Welcome Back!</Text>
          <Text style={styles.appName}>TourGuard360</Text>
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
