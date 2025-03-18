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

const API_URL = "http://10.0.2.2:5001"; // Ensure this is correct for your backend

const DriverProfileScreen = ({ route }) => {
  const navigation = useNavigation();
  // const { driverId } = route.params; // Get driver ID from navigation
  const driverId = "a3487d91-d956-42af-bd04-bf072f22981c";
  const [driver, setDriver] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDriverData = async () => {
      try {
        const response = await axios.get(`${API_URL}/get_driver/${driverId}`);
        setDriver(response.data);
      } catch (error) {
        console.error("Error fetching driver data:", error);
        Alert.alert("Error", "Failed to fetch driver details.");
      } finally {
        setLoading(false);
      }
    };

    fetchDriverData();
  }, [driverId]);

  const handleLogout = () => {
    Alert.alert(
      "Logout Confirmation",
      "Are you sure you want to logout?",
      [
        { text: "Cancel", style: "cancel" },
        { text: "Logout", onPress: () => navigation.navigate("Login") },
      ]
    );
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
      <Text style={styles.title}>Driver Profile</Text>
      <Text style={styles.text}>Name: {driver?.name}</Text>
      <Text style={styles.text}>Email: {driver?.email}</Text>
      <Text style={styles.text}>Phone: {driver?.phone}</Text>
      <Text style={styles.text}>Vehicle ID: {driver?.vehicle_id}</Text>
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
});

export default DriverProfileScreen;
