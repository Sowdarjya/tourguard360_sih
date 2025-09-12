import React, { useState } from "react";
import {
  View,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from "react-native";
import {
  Card,
  Text,
  TextInput,
  Button,
  Title,
  Divider,
  Avatar,
} from "react-native-paper";
import { register } from "../utils/auth";
import { useRouter } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";

export default function RegisterScreen() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const router = useRouter();

  const validateForm = () => {
    if (!name.trim()) {
      alert("Please enter your name");
      return false;
    }
    if (!email.trim()) {
      alert("Please enter your email");
      return false;
    }
    if (!password) {
      alert("Please enter a password");
      return false;
    }
    if (password.length < 6) {
      alert("Password must be at least 6 characters long");
      return false;
    }
    if (password !== confirmPassword) {
      alert("Passwords do not match");
      return false;
    }
    return true;
  };

  const handleRegister = async () => {
    if (!validateForm()) return;

    setLoading(true);
    try {
      await register(name.trim(), email.trim(), password);
      alert("Account created successfully! Please sign in.");
      router.replace("/login");
    } catch (err) {
      alert(
        "Registration failed: " +
          (err.response?.data?.error || "Please try again")
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <LinearGradient
        colors={["#10b981", "#059669"]}
        style={styles.gradient}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.logoContainer}>
            <Avatar.Icon
              size={80}
              icon="account-plus"
              style={styles.avatar}
              color="#10b981"
            />
            <Text style={styles.appTitle}>Join TourGuard360</Text>
            <Text style={styles.tagline}>Create your safety account</Text>
          </View>

          <Card style={styles.card} elevation={8}>
            <Card.Content style={styles.cardContent}>
              <Title style={styles.title}>Create Account</Title>
              <Text style={styles.subtitle}>
                Fill in your details to get started
              </Text>
              <Divider style={styles.divider} />

              <TextInput
                label="Full Name"
                value={name}
                onChangeText={setName}
                mode="outlined"
                style={styles.input}
                autoCapitalize="words"
                left={<TextInput.Icon icon="account" />}
                theme={{
                  colors: {
                    primary: "#10b981",
                  },
                }}
              />

              <TextInput
                label="Email Address"
                value={email}
                onChangeText={setEmail}
                mode="outlined"
                style={styles.input}
                autoCapitalize="none"
                keyboardType="email-address"
                left={<TextInput.Icon icon="email" />}
                theme={{
                  colors: {
                    primary: "#10b981",
                  },
                }}
              />

              <TextInput
                label="Password"
                value={password}
                onChangeText={setPassword}
                mode="outlined"
                style={styles.input}
                secureTextEntry={!showPassword}
                left={<TextInput.Icon icon="lock" />}
                right={
                  <TextInput.Icon
                    icon={showPassword ? "eye-off" : "eye"}
                    onPress={() => setShowPassword(!showPassword)}
                  />
                }
                theme={{
                  colors: {
                    primary: "#10b981",
                  },
                }}
              />

              <TextInput
                label="Confirm Password"
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                mode="outlined"
                style={styles.input}
                secureTextEntry={!showConfirmPassword}
                left={<TextInput.Icon icon="lock-check" />}
                right={
                  <TextInput.Icon
                    icon={showConfirmPassword ? "eye-off" : "eye"}
                    onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                  />
                }
                theme={{
                  colors: {
                    primary: "#10b981",
                  },
                }}
              />

              {password && confirmPassword && password !== confirmPassword && (
                <Text style={styles.errorText}>Passwords do not match</Text>
              )}

              <Button
                mode="contained"
                onPress={handleRegister}
                loading={loading}
                disabled={loading}
                style={styles.registerButton}
                contentStyle={styles.buttonContent}
                labelStyle={styles.buttonLabel}
              >
                {loading ? "Creating Account..." : "Create Account"}
              </Button>

              <View style={styles.loginContainer}>
                <Text style={styles.loginText}>Already have an account?</Text>
                <Button
                  mode="text"
                  onPress={() => router.push("/login")}
                  style={styles.loginButton}
                  labelStyle={styles.loginButtonLabel}
                >
                  Sign In
                </Button>
              </View>
            </Card.Content>
          </Card>
        </ScrollView>
      </LinearGradient>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  gradient: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: "center",
    paddingHorizontal: 20,
    paddingVertical: 40,
  },
  logoContainer: {
    alignItems: "center",
    marginBottom: 40,
  },
  avatar: {
    backgroundColor: "#ffffff",
    marginBottom: 16,
    elevation: 4,
  },
  appTitle: {
    fontSize: 32,
    fontWeight: "bold",
    color: "#ffffff",
    textAlign: "center",
    marginBottom: 4,
  },
  tagline: {
    fontSize: 16,
    color: "#d1fae5",
    textAlign: "center",
    fontWeight: "500",
  },
  card: {
    borderRadius: 20,
    backgroundColor: "#ffffff",
  },
  cardContent: {
    paddingHorizontal: 24,
    paddingVertical: 32,
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    textAlign: "center",
    color: "#1e293b",
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 16,
    textAlign: "center",
    color: "#64748b",
    marginBottom: 16,
  },
  divider: {
    marginBottom: 24,
    backgroundColor: "#e2e8f0",
  },
  input: {
    marginBottom: 16,
    backgroundColor: "#ffffff",
  },
  errorText: {
    color: "#ef4444",
    fontSize: 12,
    marginTop: -12,
    marginBottom: 16,
    textAlign: "center",
  },
  registerButton: {
    marginTop: 8,
    marginBottom: 24,
    borderRadius: 12,
    backgroundColor: "#10b981",
    elevation: 3,
  },
  buttonContent: {
    paddingVertical: 8,
  },
  buttonLabel: {
    fontSize: 16,
    fontWeight: "600",
    color: "#ffffff",
  },
  loginContainer: {
    alignItems: "center",
  },
  loginText: {
    fontSize: 14,
    color: "#64748b",
    marginBottom: 8,
  },
  loginButton: {
    borderRadius: 8,
  },
  loginButtonLabel: {
    color: "#10b981",
    fontSize: 16,
    fontWeight: "600",
  },
});
