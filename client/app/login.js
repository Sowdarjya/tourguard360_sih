import { useState } from "react";
import { View, Text, TextInput, Button, Alert } from "react-native";
import { login } from "../utils/auth";
import { useRouter } from "expo-router";

export default function LoginScreen() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const router = useRouter();

  const handleLogin = async () => {
    try {
      await login(email, password);
      router.replace("/");
    } catch (err) {
      Alert.alert("Login failed", err.response?.data?.error || "Try again");
    }
  };

  return (
    <View style={{ padding: 20 }}>
      <Text>Email</Text>
      <TextInput
        value={email}
        onChangeText={setEmail}
        style={{ borderWidth: 1, marginBottom: 10 }}
      />
      <Text>Password</Text>
      <TextInput
        value={password}
        secureTextEntry
        onChangeText={setPassword}
        style={{ borderWidth: 1, marginBottom: 10 }}
      />
      <Button title="Login" onPress={handleLogin} />
      <Button title="Register" onPress={() => router.push("/register")} />
    </View>
  );
}
