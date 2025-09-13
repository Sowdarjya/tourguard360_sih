import { Stack } from "expo-router";

export default function Layout() {
  return (
    <Stack screenOptions={{ headerShown: true }}>
      <Stack.Screen 
        name="index" 
        options={{ 
          title: "Home",
        }} 
      />
      <Stack.Screen 
        name="login" 
        options={{ 
          title: "Login",
          headerShown: false,
        }} 
      />
      <Stack.Screen 
        name="register" 
        options={{ 
          title: "Register",
          headerShown: false,
        }} 
      />
      <Stack.Screen 
        name="kyc" 
        options={{ 
          title: "KYC Verification", 
          headerBackVisible: false,
          gestureEnabled: false,
        }} 
      />
      <Stack.Screen name="geofence" options={{ title: "Geofence" }} />
      <Stack.Screen name="family" options={{ title: "Family" }} />
    </Stack>
  );
}
