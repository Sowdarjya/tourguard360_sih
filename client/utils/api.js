import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";

const api = axios.create({
  baseURL: "https://woodcock-select-reliably.ngrok-free.app",
});

api.interceptors.request.use(async (config) => {
  const token = await AsyncStorage.getItem("token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// KYC Verification function
export const verifyAadhaarXML = async (formData) => {
  return api.post("http://localhost:3000//verify-aadhaar-xml", formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
};

export default api;
