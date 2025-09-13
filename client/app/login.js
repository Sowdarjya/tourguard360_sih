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
import { login } from "../utils/auth";
import { useRouter } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";

export default function LoginScreen() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const router = useRouter();

  const handleLogin = async () => {
    if (!email || !password) {
      alert("Please fill in all fields");
      return;
    }

    setLoading(true);
    try {
      await login(email, password);
      // Redirect to KYC verification instead of homepage
      router.replace("/kyc");
    } catch (err) {
      alert(
        "Login failed: " +
          (err.response?.data?.error ||
            "Please check your credentials and try again")
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
        colors={["#667eea", "#764ba2"]}
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
              icon="shield-lock"
              style={styles.avatar}
              color="#667eea"
            />
            <Text style={styles.appTitle}>TourGuard360</Text>
            <Text style={styles.tagline}>Your Safety Companion</Text>
          </View>

          <Card style={styles.card} elevation={8}>
            <Card.Content style={styles.cardContent}>
              <Title style={styles.title}>Welcome Back</Title>
              <Text style={styles.subtitle}>Sign in to your account</Text>
              <Divider style={styles.divider} />

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
                    primary: "#667eea",
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
                    primary: "#667eea",
                  },
                }}
              />

              <Button
                mode="contained"
                onPress={handleLogin}
                loading={loading}
                disabled={loading}
                style={styles.loginButton}
                contentStyle={styles.buttonContent}
                labelStyle={styles.buttonLabel}
              >
                {loading ? "Signing In..." : "Sign In"}
              </Button>

              <View style={styles.registerContainer}>
                <Text style={styles.registerText}>Don't have an account?</Text>
                <Button
                  mode="text"
                  onPress={() => router.push("/register")}
                  style={styles.registerButton}
                  labelStyle={styles.registerButtonLabel}
                >
                  Create Account
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
    color: "#e2e8f0",
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
  loginButton: {
    marginTop: 8,
    marginBottom: 24,
    borderRadius: 12,
    backgroundColor: "#667eea",
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
  registerContainer: {
    alignItems: "center",
  },
  registerText: {
    fontSize: 14,
    color: "#64748b",
    marginBottom: 8,
  },
  registerButton: {
    borderRadius: 8,
  },
  registerButtonLabel: {
    color: "#667eea",
    fontSize: 16,
    fontWeight: "600",
  },
});
