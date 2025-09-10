import { useState } from "react";
import { View, Text, TextInput, Button, Alert } from "react-native";
import { register } from "../utils/auth";
import { useRouter } from "expo-router";

export default function RegisterScreen() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const router = useRouter();

  const handleRegister = async () => {
    try {
      await register(name, email, password);
      Alert.alert("Success", "Registered successfully. Please login.");
      router.replace("/login");
    } catch (err) {
      Alert.alert("Register failed", err.response?.data?.error || "Try again");
    }
  };

  return (
    <View style={{ padding: 20 }}>
      <Text>Name</Text>
      <TextInput
        value={name}
        onChangeText={setName}
        style={{ borderWidth: 1, marginBottom: 10 }}
      />
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
      <Button title="Register" onPress={handleRegister} />
    </View>
  );
}
