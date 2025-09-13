import { Stack, useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { getUser } from "../utils/auth";
import AsyncStorage from "@react-native-async-storage/async-storage";

export default function Layout() {
  const [user, setUser] = useState(null);
  const [kycVerified, setKycVerified] = useState(null); // null = loading, true/false = status
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const initializeApp = async () => {
      try {
        // Check if user is logged in
        const u = await getUser();
        
        if (!u) {
          // User not logged in, redirect to login
          router.replace("/login");
          return;
        }
        
        setUser(u);
        
        // Check KYC verification status
        const kycStatus = await AsyncStorage.getItem("kycVerified");
        const isKycVerified = kycStatus === "true";
        setKycVerified(isKycVerified);
        
        if (!isKycVerified) {
          // User is logged in but KYC not completed, redirect to KYC (mandatory)
          router.replace("/kyc");
        } else {
          // User is logged in and KYC is verified, can access the app
          // This will allow navigation to the home screen
        }
      } catch (error) {
        console.error("Error initializing app:", error);
        router.replace("/login");
      } finally {
        setIsLoading(false);
      }
    };

    initializeApp();
  }, []);

  // Show loading screen while checking authentication and KYC status
  if (isLoading) {
    return null; // You can add a loading component here
  }

  return (
    <Stack screenOptions={{ headerShown: true }}>
      <Stack.Screen 
        name="index" 
        options={{ 
          title: "Home",
          // Prevent access to home if KYC not verified
          headerShown: kycVerified === true,
        }} 
      />
      <Stack.Screen name="login" options={{ title: "Login" }} />
      <Stack.Screen name="register" options={{ title: "Register" }} />
      <Stack.Screen 
        name="kyc" 
        options={{ 
          title: "KYC Verification", 
          headerBackVisible: false, // Prevent going back from KYC
          gestureEnabled: false, // Disable swipe back gesture
        }} 
      />
      <Stack.Screen name="geofence" options={{ title: "Geofence" }} />
      <Stack.Screen name="family" options={{ title: "Family" }} />
    </Stack>
  );
}
