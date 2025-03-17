import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  Image,
  ActivityIndicator,
  StyleSheet,
  Alert,
} from "react-native";
import axios from "axios";

const API_URL = "http://10.0.2.2:5001"; // Ensure this is correct for your backend

const DriverProfileScreen = ({ route }) => {
  // const { driverId } = route.params; // Get driver ID from navigation
  const driverId = "67d6f1e50c6ff596244f061d";
  const [driver, setDriver] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDriverData = async () => {
      try {
        const response = await axios.get(`${API_URL}/get_driver/${driverId}`);
        setDriver(response.data.driver);
      } catch (error) {
        console.error("Error fetching driver data:", error);
        Alert.alert("Error", "Failed to fetch driver details.");
      } finally {
        setLoading(false);
      }
    };

    fetchDriverData();
  }, [driverId]);

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
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
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
});

export default DriverProfileScreen;
