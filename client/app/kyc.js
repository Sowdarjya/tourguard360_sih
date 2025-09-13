import React, { useState, useEffect } from "react";
import {
  View,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Alert,
} from "react-native";
import {
  Card,
  Text,
  TextInput,
  Button,
  Title,
  Divider,
  Avatar,
  IconButton,
  HelperText,
} from "react-native-paper";
import { useRouter } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import * as DocumentPicker from "expo-document-picker";
import { verifyAadhaarXML } from "../utils/api";
import { setKycVerified, getKycStatus } from "../utils/auth";
import AsyncStorage from "@react-native-async-storage/async-storage";

export default function KYCScreen() {
  const [shareCode, setShareCode] = useState("");
  const [selectedFile, setSelectedFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  // Check if KYC is already completed
  useEffect(() => {
    const checkKycStatus = async () => {
      const kycStatus = await getKycStatus();
      if (kycStatus.isVerified) {
        // KYC already completed, redirect to home
        Alert.alert(
          "KYC Already Completed",
          "Your KYC verification is already completed. Redirecting to home.",
          [
            {
              text: "OK",
              onPress: () => router.replace("/"),
            },
          ],
          { cancelable: false }
        );
      }
    };

    checkKycStatus();
  }, []);

  const pickDocument = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: ["application/zip", "application/x-zip-compressed"],
        copyToCacheDirectory: true,
        multiple: false,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        const file = result.assets[0];
        console.log("Selected file:", {
          name: file.name,
          size: file.size,
          mimeType: file.mimeType,
          uri: file.uri
        });
        setSelectedFile(file);
      }
    } catch (error) {
      console.error("Document picker error:", error);
      Alert.alert("Error", "Failed to pick file. Please try again.");
    }
  };

  const handleVerification = async () => {
    if (!selectedFile) {
      Alert.alert("Error", "Please select a zip file");
      return;
    }

    if (!shareCode || shareCode.length !== 4) {
      Alert.alert("Error", "Please enter a valid 4-digit share code");
      return;
    }

    setLoading(true);
    try {
      const formData = new FormData();
      
      // Create file object for React Native FormData
      const fileObj = {
        uri: selectedFile.uri,
        type: selectedFile.mimeType || "application/zip",
        name: selectedFile.name || "aadhaar.zip",
      };
      
      // Append the file with proper React Native FormData format
      formData.append("zip_file", fileObj);
      
      // Append the share code as string
      formData.append("share_code", shareCode.toString());

      console.log("Sending FormData with:", {
        fileName: selectedFile.name,
        fileSize: selectedFile.size,
        shareCodeLength: shareCode.length,
        fileUri: selectedFile.uri,
        mimeType: selectedFile.mimeType
      });

      const response = await verifyAadhaarXML(formData);
      
      console.log("KYC Response:", response.data);
      
      if (response.data.status === "verified") {
        // Store the verified user data using auth function
        await setKycVerified(response.data.data);
        
        Alert.alert(
          "Verification Successful",
          `Welcome ${response.data.data.name}! Your KYC has been verified successfully. This is a one-time process and you won't need to verify again.`,
          [
            {
              text: "Continue",
              onPress: () => router.replace("/"),
            },
          ],
          { cancelable: false }
        );
      } else {
        console.error("Verification failed - unexpected response:", response.data);
        Alert.alert("Verification Failed", "Invalid Aadhaar XML or share code");
      }
    } catch (error) {
      console.error("KYC Verification Error:", error);
      const errorMessage = error.response?.data?.detail || 
                          error.response?.data?.error || 
                          error.message || 
                          "Please check your file and share code";
      Alert.alert("Verification Failed", errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const removeFile = () => {
    setSelectedFile(null);
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
              icon="shield-check"
              style={styles.avatar}
              color="#667eea"
            />
            <Text style={styles.appTitle}>KYC Verification</Text>
            <Text style={styles.tagline}>Verify your identity securely</Text>
          </View>

          <Card style={styles.card} elevation={8}>
            <Card.Content style={styles.cardContent}>
              <Title style={styles.title}>Aadhaar Verification</Title>
              <Text style={styles.subtitle}>
                Upload your offline Aadhaar XML file and enter the share code
              </Text>
              <Divider style={styles.divider} />

              {/* File Upload Section */}
              <View style={styles.fileSection}>
                <Text style={styles.sectionLabel}>Upload Aadhaar ZIP File</Text>
                <HelperText type="info" style={styles.helperText}>
                  Select the ZIP file downloaded from UIDAI portal
                </HelperText>
                
                {!selectedFile ? (
                  <Button
                    mode="outlined"
                    onPress={pickDocument}
                    style={styles.uploadButton}
                    contentStyle={styles.uploadButtonContent}
                    icon="file-upload"
                  >
                    Select ZIP File
                  </Button>
                ) : (
                  <Card style={styles.fileCard} elevation={2}>
                    <Card.Content style={styles.fileCardContent}>
                      <View style={styles.fileInfo}>
                        <Avatar.Icon
                          size={40}
                          icon="file-document"
                          style={styles.fileIcon}
                        />
                        <View style={styles.fileDetails}>
                          <Text style={styles.fileName} numberOfLines={1}>
                            {selectedFile.name}
                          </Text>
                          <Text style={styles.fileSize}>
                            {(selectedFile.size / 1024).toFixed(1)} KB
                          </Text>
                        </View>
                        <IconButton
                          icon="close"
                          size={20}
                          onPress={removeFile}
                          style={styles.removeButton}
                        />
                      </View>
                    </Card.Content>
                  </Card>
                )}
              </View>

              {/* Share Code Section */}
              <View style={styles.shareCodeSection}>
                <Text style={styles.sectionLabel}>4-Digit Share Code</Text>
                <HelperText type="info" style={styles.helperText}>
                  Enter the 4-digit code used while downloading the XML
                </HelperText>
                <TextInput
                  label="Share Code"
                  value={shareCode}
                  onChangeText={(text) => {
                    // Only allow numbers and limit to 4 digits
                    const numericText = text.replace(/[^0-9]/g, "").slice(0, 4);
                    setShareCode(numericText);
                  }}
                  mode="outlined"
                  style={styles.input}
                  keyboardType="numeric"
                  maxLength={4}
                  left={<TextInput.Icon icon="key" />}
                  theme={{
                    colors: {
                      primary: "#667eea",
                    },
                  }}
                />
              </View>

              <Button
                mode="contained"
                onPress={handleVerification}
                loading={loading}
                disabled={loading || !selectedFile || shareCode.length !== 4}
                style={styles.verifyButton}
                contentStyle={styles.buttonContent}
                labelStyle={styles.buttonLabel}
              >
                {loading ? "Verifying..." : "Verify KYC"}
              </Button>

              <View style={styles.infoContainer}>
                <Text style={styles.infoText}>
                  Your Aadhaar data will be processed securely and not stored on our servers.
                </Text>
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
  fileSection: {
    marginBottom: 24,
  },
  shareCodeSection: {
    marginBottom: 24,
  },
  sectionLabel: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1e293b",
    marginBottom: 8,
  },
  helperText: {
    fontSize: 14,
    color: "#64748b",
    marginBottom: 12,
  },
  uploadButton: {
    borderRadius: 12,
    borderColor: "#667eea",
    borderWidth: 2,
  },
  uploadButtonContent: {
    paddingVertical: 8,
  },
  fileCard: {
    borderRadius: 12,
    backgroundColor: "#f8fafc",
  },
  fileCardContent: {
    paddingVertical: 12,
  },
  fileInfo: {
    flexDirection: "row",
    alignItems: "center",
  },
  fileIcon: {
    backgroundColor: "#667eea",
    marginRight: 12,
  },
  fileDetails: {
    flex: 1,
  },
  fileName: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1e293b",
  },
  fileSize: {
    fontSize: 14,
    color: "#64748b",
  },
  removeButton: {
    backgroundColor: "#fee2e2",
  },
  input: {
    backgroundColor: "#ffffff",
  },
  verifyButton: {
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
  infoContainer: {
    alignItems: "center",
    paddingHorizontal: 16,
  },
  infoText: {
    fontSize: 12,
    color: "#64748b",
    textAlign: "center",
    lineHeight: 18,
  },
});