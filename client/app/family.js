import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Alert,
  KeyboardAvoidingView,
  ScrollView,
  Platform,
} from "react-native";
import {
  Card,
  TextInput,
  Button,
  IconButton,
  Divider,
  ActivityIndicator,
  Avatar,
  Chip,
} from "react-native-paper";
import { LinearGradient } from "expo-linear-gradient";
import api from "../utils/api";

export default function FamilyScreen() {
  const [family, setFamily] = useState([]);
  const [loading, setLoading] = useState(true);
  const [adding, setAdding] = useState(false);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");

  useEffect(() => {
    fetchFamily();
  }, []);

  const fetchFamily = async () => {
    try {
      setLoading(true);
      const res = await api.get("/family");
      setFamily(res.data || []);
    } catch (err) {
      console.error("Fetch family error:", err.message);
      Alert.alert("Error", "Failed to fetch family members");
    } finally {
      setLoading(false);
    }
  };

  const validateForm = () => {
    if (!name.trim()) {
      Alert.alert("Validation", "Please enter a name");
      return false;
    }
    if (!phone.trim() && !email.trim()) {
      Alert.alert(
        "Validation",
        "Please enter at least a phone number or email"
      );
      return false;
    }
    if (phone.trim() && !/^\+91[6-9]\d{9}$/.test(phone.trim())) {
      Alert.alert(
        "Validation",
        "Please enter a valid phone number (+91XXXXXXXXXX)"
      );
      return false;
    }
    if (email.trim() && !/\S+@\S+\.\S+/.test(email.trim())) {
      Alert.alert("Validation", "Please enter a valid email address");
      return false;
    }
    return true;
  };

  const handleAddMember = async () => {
    if (!validateForm()) return;

    try {
      const res = await api.post("/family", {
        name: name.trim(),
        phone: phone.trim(),
        email: email.trim(),
      });
      setFamily((prev) => [...prev, res.data]);
      setName("");
      setPhone("");
      setEmail("");
      setAdding(false);
      Alert.alert("Success", "Family member added successfully!");
    } catch (err) {
      console.error("Add family error:", err.message);
      Alert.alert("Error", "Failed to add family member");
    }
  };

  const handleRemoveMember = async (id, memberName) => {
    Alert.alert(
      "Confirm Removal",
      `Are you sure you want to remove ${memberName} from your family list?`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Remove",
          style: "destructive",
          onPress: async () => {
            try {
              await api.delete(`/family/${id}`);
              setFamily((prev) => prev.filter((f) => f.id !== id));
              Alert.alert("Success", "Family member removed");
            } catch (err) {
              console.error("Remove error:", err.message);
              Alert.alert("Error", "Failed to remove member");
            }
          },
        },
      ]
    );
  };

  const renderItem = ({ item }) => (
    <Card style={styles.memberCard} elevation={3}>
      <Card.Content style={styles.cardContent}>
        <View style={styles.memberHeader}>
          <Avatar.Text
            size={50}
            label={item.name
              .split(" ")
              .map((n) => n[0])
              .join("")
              .substring(0, 2)
              .toUpperCase()}
            style={styles.avatar}
            labelStyle={styles.avatarLabel}
          />
          <View style={styles.memberInfo}>
            <Text style={styles.memberName}>{item.name}</Text>
            <View style={styles.contactInfo}>
              {item.phone && (
                <Chip
                  icon="phone"
                  style={styles.contactChip}
                  textStyle={styles.chipText}
                >
                  {item.phone}
                </Chip>
              )}
              {item.email && (
                <Chip
                  icon="email"
                  style={[styles.contactChip, { marginTop: 4 }]}
                  textStyle={styles.chipText}
                >
                  {item.email}
                </Chip>
              )}
            </View>
          </View>
          <IconButton
            icon="delete"
            iconColor="#ef4444"
            size={24}
            style={styles.deleteButton}
            onPress={() => handleRemoveMember(item.id, item.name)}
          />
        </View>
      </Card.Content>
    </Card>
  );

  const renderAddForm = () => (
    <Card style={styles.addCard} elevation={4}>
      <Card.Content style={styles.addCardContent}>
        <Text style={styles.addTitle}>Add Family Member</Text>
        <Divider style={styles.formDivider} />

        <TextInput
          label="Full Name"
          value={name}
          onChangeText={setName}
          style={styles.input}
          mode="outlined"
          left={<TextInput.Icon icon="account" />}
          theme={{ colors: { primary: "#10b981" } }}
        />

        <TextInput
          label="Phone Number (+91XXXXXXXXXX)"
          value={phone}
          onChangeText={setPhone}
          keyboardType="phone-pad"
          style={styles.input}
          mode="outlined"
          left={<TextInput.Icon icon="phone" />}
          theme={{ colors: { primary: "#10b981" } }}
          placeholder="+919876543210"
        />

        <TextInput
          label="Email Address"
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          autoCapitalize="none"
          style={styles.input}
          mode="outlined"
          left={<TextInput.Icon icon="email" />}
          theme={{ colors: { primary: "#10b981" } }}
          placeholder="example@email.com"
        />

        <View style={styles.formButtons}>
          <Button
            mode="contained"
            onPress={handleAddMember}
            style={styles.saveButton}
            contentStyle={styles.buttonContent}
            labelStyle={styles.buttonLabel}
          >
            Save Member
          </Button>

          <Button
            mode="outlined"
            onPress={() => {
              setAdding(false);
              setName("");
              setPhone("");
              setEmail("");
            }}
            style={styles.cancelButton}
            contentStyle={styles.buttonContent}
            labelStyle={styles.cancelButtonLabel}
          >
            Cancel
          </Button>
        </View>
      </Card.Content>
    </Card>
  );

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={["#10b981", "#059669"]}
        style={styles.header}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <Text style={styles.headerTitle}>Family Members</Text>
        <Text style={styles.headerSubtitle}>
          {family.length} of 5 members added
        </Text>
      </LinearGradient>

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        keyboardVerticalOffset={80} // adjust if header is tall
      >
        <ScrollView
          contentContainerStyle={styles.content}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {loading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator animating size="large" color="#10b981" />
              <Text style={styles.loadingText}>Loading family members...</Text>
            </View>
          ) : (
            <>
              <FlatList
                data={family}
                keyExtractor={(item) => item.id.toString()}
                renderItem={renderItem}
                ItemSeparatorComponent={() => <View style={{ height: 12 }} />}
                ListEmptyComponent={() => <Text>No data available.</Text>}
                contentContainerStyle={styles.listContent}
                showsVerticalScrollIndicator={false}
              />

              {adding && renderAddForm()}

              {!adding && (
                <Button
                  mode="contained"
                  style={styles.addButton}
                  contentStyle={styles.addButtonContent}
                  labelStyle={styles.addButtonLabel}
                  icon="plus"
                  onPress={() => {
                    if (family.length >= 5) {
                      Alert.alert(
                        "Limit Reached",
                        "You can only add up to 5 family members for optimal safety monitoring."
                      );
                    } else {
                      setAdding(true);
                    }
                  }}
                >
                  Add Family Member
                </Button>
              )}
            </>
          )}
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8fafc",
  },
  header: {
    paddingTop: 50,
    paddingBottom: 30,
    paddingHorizontal: 20,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#ffffff",
    textAlign: "center",
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 16,
    color: "#d1fae5",
    textAlign: "center",
    fontWeight: "500",
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: "#64748b",
    fontWeight: "500",
  },
  listContent: {
    paddingBottom: 20,
  },
  memberCard: {
    borderRadius: 16,
    backgroundColor: "#ffffff",
  },
  cardContent: {
    padding: 16,
  },
  memberHeader: {
    flexDirection: "row",
    alignItems: "flex-start",
  },
  avatar: {
    backgroundColor: "#10b981",
    marginRight: 16,
  },
  avatarLabel: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#ffffff",
  },
  memberInfo: {
    flex: 1,
    marginRight: 8,
  },
  memberName: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#1e293b",
    marginBottom: 8,
  },
  contactInfo: {
    flexDirection: "column",
  },
  contactChip: {
    alignSelf: "flex-start",
    backgroundColor: "#f0fdf4",
    borderWidth: 1,
    borderColor: "#bbf7d0",
  },
  chipText: {
    fontSize: 12,
    color: "#166534",
  },
  deleteButton: {
    backgroundColor: "#fef2f2",
    borderWidth: 1,
    borderColor: "#fecaca",
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 60,
  },
  emptyIcon: {
    backgroundColor: "#f0fdf4",
    marginBottom: 20,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#1e293b",
    marginBottom: 8,
    textAlign: "center",
  },
  emptyText: {
    fontSize: 16,
    color: "#64748b",
    textAlign: "center",
    lineHeight: 22,
    paddingHorizontal: 40,
  },
  addCard: {
    marginVertical: 20,
    borderRadius: 16,
    backgroundColor: "#ffffff",
  },
  addCardContent: {
    padding: 20,
  },
  addTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#1e293b",
    textAlign: "center",
    marginBottom: 8,
  },
  formDivider: {
    marginBottom: 20,
    backgroundColor: "#e2e8f0",
  },
  input: {
    marginBottom: 16,
    backgroundColor: "#ffffff",
  },
  formButtons: {
    marginTop: 8,
  },
  saveButton: {
    backgroundColor: "#10b981",
    borderRadius: 12,
    marginBottom: 12,
  },
  cancelButton: {
    borderRadius: 12,
    borderColor: "#64748b",
  },
  buttonContent: {
    paddingVertical: 8,
  },
  buttonLabel: {
    fontSize: 16,
    fontWeight: "600",
    color: "#ffffff",
  },
  cancelButtonLabel: {
    fontSize: 16,
    fontWeight: "600",
    color: "#64748b",
  },
  addButton: {
    backgroundColor: "#10b981",
    borderRadius: 16,
    marginBottom: 20,
    elevation: 4,
  },
  addButtonContent: {
    paddingVertical: 12,
  },
  addButtonLabel: {
    fontSize: 16,
    fontWeight: "600",
    color: "#ffffff",
  },
});
