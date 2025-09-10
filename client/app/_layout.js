import { Stack, useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { getUser } from "../utils/auth";

export default function Layout() {
  const [user, setUser] = useState(null);
  const router = useRouter();

  useEffect(() => {
    (async () => {
      const u = await getUser();
      if (!u) {
        router.replace("/login");
      } else {
        setUser(u);
      }
    })();
  }, []);

  return (
    <Stack screenOptions={{ headerShown: true }}>
      <Stack.Screen name="index" options={{ title: "Home" }} />
      <Stack.Screen name="login" options={{ title: "Login" }} />
      <Stack.Screen name="register" options={{ title: "Register" }} />
      <Stack.Screen name="geofence" options={{ title: "Geofence" }} />
    </Stack>
  );
}
