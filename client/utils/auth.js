import AsyncStorage from "@react-native-async-storage/async-storage";
import api from "./api";

export async function login(email, password) {
  const res = await api.post("/auth/login", { email, password });
  await AsyncStorage.setItem("token", res.data.token);
  await AsyncStorage.setItem("user", JSON.stringify(res.data.user));
  return res.data.user;
}

export async function register(name, email, password) {
  const res = await api.post("/auth/register", { name, email, password });
  return res.data.user;
}

export async function logout() {
  await AsyncStorage.removeItem("token");
  await AsyncStorage.removeItem("user");
  // Clear KYC data on logout
  await AsyncStorage.removeItem("kycVerified");
  await AsyncStorage.removeItem("userData");
}

export async function getUser() {
  const user = await AsyncStorage.getItem("user");
  return user ? JSON.parse(user) : null;
}

// KYC Status Management Functions
export async function setKycVerified(userData) {
  await AsyncStorage.setItem("kycVerified", "true");
  await AsyncStorage.setItem("userData", JSON.stringify(userData));
  await AsyncStorage.setItem("kycVerifiedAt", new Date().toISOString());
}

export async function getKycStatus() {
  const kycVerified = await AsyncStorage.getItem("kycVerified");
  const userData = await AsyncStorage.getItem("userData");
  const kycVerifiedAt = await AsyncStorage.getItem("kycVerifiedAt");
  
  return {
    isVerified: kycVerified === "true",
    userData: userData ? JSON.parse(userData) : null,
    verifiedAt: kycVerifiedAt || null,
  };
}

export async function clearKycData() {
  await AsyncStorage.removeItem("kycVerified");
  await AsyncStorage.removeItem("userData");
  await AsyncStorage.removeItem("kycVerifiedAt");
}
