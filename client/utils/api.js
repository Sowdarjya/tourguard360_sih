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
  try {
    // Use the Render deployment URL for KYC verification
    const KYC_BASE_URL = "https://tourguard360-sih.onrender.com";
    
    const response = await axios.create().post(`${KYC_BASE_URL}/verify-aadhaar-xml`, formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
      timeout: 30000, // 30 second timeout for file upload
    });
    return response;
  } catch (error) {
    console.error("KYC API Error:", error.response?.data || error.message);
    throw error;
  }
};

export default api;
