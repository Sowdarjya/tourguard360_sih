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
}

export async function getUser() {
  const user = await AsyncStorage.getItem("user");
  return user ? JSON.parse(user) : null;
}
