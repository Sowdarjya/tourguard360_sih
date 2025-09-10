import { View, Text, Button } from "react-native";
import { logout } from "../utils/auth";
import { useRouter } from "expo-router";

export default function HomeScreen() {
  const router = useRouter();

  const handleLogout = async () => {
    await logout();
    router.replace("/login");
  };

  return (
    <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
      <Text>🏕️ Welcome to TourGuard360</Text>
      <Button title="Geofencing" onPress={() => router.push("/geofence")} />
      <Button title="Logout" onPress={handleLogout} />
    </View>
  );
}
