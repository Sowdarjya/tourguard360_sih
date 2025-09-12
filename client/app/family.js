import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, FlatList, Alert } from "react-native";
import {
  Card,
  TextInput,
  Button,
  IconButton,
  Divider,
  ActivityIndicator,
} from "react-native-paper";
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

  const handleAddMember = async () => {
    if (!name || (!phone && !email)) {
      Alert.alert("Validation", "Enter a name and at least a phone or email");
      return;
    }
    try {
      const res = await api.post("/family", { name, phone, email });
      setFamily((prev) => [...prev, res.data]);
      setName("");
      setPhone("");
      setEmail("");
      setAdding(false);
    } catch (err) {
      console.error("Add family error:", err.message);
      Alert.alert("Error", "Failed to add family member");
    }
  };

  const handleRemoveMember = async (id) => {
    Alert.alert("Confirm", "Remove this family member?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Remove",
        style: "destructive",
        onPress: async () => {
          try {
            await api.delete(`/family/${id}`);
            setFamily((prev) => prev.filter((f) => f.id !== id));
          } catch (err) {
            console.error("Remove error:", err.message);
            Alert.alert("Error", "Failed to remove member");
          }
        },
      },
    ]);
  };

  const renderItem = ({ item }) => (
    <Card style={styles.card}>
      <Card.Title
        title={item.name}
        subtitle={`${item.phone || ""} ${item.email || ""}`}
        right={(props) => (
          <IconButton
            {...props}
            icon="delete"
            onPress={() => handleRemoveMember(item.id)}
          />
        )}
      />
    </Card>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.header}>My Family Members</Text>

      {loading ? (
        <ActivityIndicator animating size="large" style={{ marginTop: 20 }} />
      ) : (
        <FlatList
          data={family}
          keyExtractor={(item) => item.id.toString()}
          renderItem={renderItem}
          ItemSeparatorComponent={() => <Divider />}
          ListEmptyComponent={
            <Text style={styles.empty}>No family members yet</Text>
          }
        />
      )}

      {adding ? (
        <Card style={styles.addCard}>
          <Card.Content>
            <TextInput
              label="Name"
              value={name}
              onChangeText={setName}
              style={styles.input}
            />
            <TextInput
              label="Phone (+91...)"
              value={phone}
              onChangeText={setPhone}
              keyboardType="phone-pad"
              style={styles.input}
            />
            <TextInput
              label="Email"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              style={styles.input}
            />
            <Button mode="contained" onPress={handleAddMember}>
              Save
            </Button>
            <Button onPress={() => setAdding(false)} style={{ marginTop: 6 }}>
              Cancel
            </Button>
          </Card.Content>
        </Card>
      ) : (
        <Button
          mode="contained"
          style={styles.addButton}
          onPress={() => {
            if (family.length >= 5) {
              Alert.alert("Limit Reached", "You can only add up to 5 members");
            } else {
              setAdding(true);
            }
          }}
        >
          Add Family Member
        </Button>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16 },
  header: { fontSize: 20, fontWeight: "bold", marginBottom: 12 },
  card: { marginBottom: 8 },
  addCard: { marginTop: 12 },
  input: { marginBottom: 8 },
  addButton: { marginTop: 16 },
  empty: { textAlign: "center", marginTop: 20, color: "#666" },
});
