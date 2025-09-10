
import React from "react";
import { View, StyleSheet } from "react-native";
import { Card, Title, Text, Button, Divider } from "react-native-paper";
import { logout } from "../utils/auth";
import { useRouter } from "expo-router";

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f4f6f8",
  },
  card: {
    width: "90%",
    paddingVertical: 10,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 8,
    textAlign: "center",
  },
  subtitle: {
    fontSize: 16,
    color: "#555",
    marginBottom: 16,
    textAlign: "center",
  },
  buttonRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 8,
  },
  button: {
    flex: 1,
    marginHorizontal: 4,
    borderRadius: 6,
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
      <Card style={styles.card} elevation={4}>
        <Card.Content>
          <Title style={styles.title}>Welcome to TourGuard360</Title>
          <Divider style={{ marginBottom: 16 }} />
          <Text style={styles.subtitle}>Your safety companion for travel</Text>
          <View style={styles.buttonRow}>
            <Button
              mode="contained"
              icon="map-marker-radius"
              onPress={() => router.push("/geofence")}
              style={styles.button}
              contentStyle={{ paddingVertical: 6 }}
            >
              Geofencing
            </Button>
            <Button
              mode="outlined"
              icon="logout"
              onPress={handleLogout}
              style={styles.button}
              contentStyle={{ paddingVertical: 6 }}
            >
              Logout
            </Button>
          </View>
        </Card.Content>
      </Card>
    </View>
  );
}
