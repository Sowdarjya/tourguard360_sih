import { Stack, useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { getUser } from "../utils/auth";
import AsyncStorage from "@react-native-async-storage/async-storage";

export default function Layout() {
  const [user, setUser] = useState(null);
  const [kycVerified, setKycVerified] = useState(false);
  const router = useRouter();

  useEffect(() => {
    (async () => {
      const u = await getUser();
      const kycStatus = await AsyncStorage.getItem("kycVerified");
      
      if (!u) {
        router.replace("/login");
      } else {
        setUser(u);
        if (kycStatus === "true") {
          setKycVerified(true);
        } else {
          // User is logged in but KYC not verified, redirect to KYC
          router.replace("/kyc");
        }
      }
    })();
  }, []);

  return (
    <Stack screenOptions={{ headerShown: true }}>
      <Stack.Screen name="index" options={{ title: "Home" }} />
      <Stack.Screen name="login" options={{ title: "Login" }} />
      <Stack.Screen name="register" options={{ title: "Register" }} />
      <Stack.Screen name="kyc" options={{ title: "KYC Verification", headerBackVisible: false }} />
      <Stack.Screen name="geofence" options={{ title: "Geofence" }} />
      <Stack.Screen name="family" options={{ title: "Family" }} />
    </Stack>
  );
}
