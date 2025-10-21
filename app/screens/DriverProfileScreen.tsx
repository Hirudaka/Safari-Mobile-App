import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  Image,
  ActivityIndicator,
  StyleSheet,
  Alert,
  TouchableOpacity,
} from "react-native";
import axios from "axios";
import { useNavigation } from "@react-navigation/native";
import Ionicons from "react-native-vector-icons/Ionicons";

const API_URL = "http://192.168.8.154:5001"; // Ensure this is correct for your backend

const DriverProfileScreen = ({ route }) => {
  const navigation = useNavigation();
  const { userId } = route.params;
  const [driver, setDriver] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  console.log(userId);
  useEffect(() => {
    const fetchDriverData = async () => {
      try {
        const response = await axios.get(`${API_URL}/get_driver/${userId}`);
        setDriver(response.data.driver);
      } catch (error) {
        console.error("Error fetching driver data:", error);
        Alert.alert("Error", "Failed to fetch driver details.");
      } finally {
        setLoading(false);
      }
    };

    fetchDriverData();
  }, [userId]);

  const handleLogout = () => {
    Alert.alert("Logout Confirmation", "Are you sure you want to logout?", [
      { text: "Cancel", style: "cancel" },
      { text: "Logout", onPress: () => navigation.navigate("Login") },
    ]);
  };

  if (loading) {
    return <ActivityIndicator size="large" color="#0000ff" />;
  }

  if (!driver) {
    return (
      <View style={styles.container}>
        <Text style={styles.title}>Driver Not Found</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.iconContainer}>
        <Ionicons name="person" size={68} color="#5A8200" />
      </View>
      <View style={styles.profileContainer}>
        <Text style={styles.title}>Driver Profile</Text>
        <Text style={styles.text}>Name: {driver?.name}</Text>
        <Text style={styles.text}>Email: {driver?.email}</Text>
        <Text style={styles.text}>Phone: {driver?.phone}</Text>
        <Text style={styles.text}>Vehicle ID: {driver?.vehicle_id}</Text>
      </View>
      <Image
        source={{ uri: `data:image/png;base64,${driver?.qr_code_image}` }}
        style={styles.qrImage}
      />

      {/* Logout Button */}
      <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
        <Text style={styles.logoutButtonText}>Logout</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
    backgroundColor: "#fff",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 20,
    alignSelf: "center",
  },
  text: {
    fontSize: 18,
    marginBottom: 10,
  },
  qrImage: {
    width: 200,
    height: 200,
    marginTop: 20,
  },
  logoutButton: {
    marginTop: 30,
    backgroundColor: "#007AFF",
    paddingVertical: 12,
    paddingHorizontal: 30,
    borderRadius: 8,
    shadowColor: "#007AFF",
    shadowOpacity: 0.3,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 4,
  },
  logoutButtonText: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#fff",
  },
  iconContainer: {
    backgroundColor: "#fff8f6",
    padding: 16,
    borderRadius: 50,
    marginBottom: 12,
  },
  profileContainer: {
    backgroundColor: "#fff8f6",
    padding: 16,
    borderRadius: 20,
    width: 300,
  },
});

export default DriverProfileScreen;
