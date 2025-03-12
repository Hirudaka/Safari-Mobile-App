import React, { useState, useEffect, useRef } from "react";
import {
  Text,
  View,
  StyleSheet,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from "react-native";
import { CameraView, useCameraPermissions } from "expo-camera";
import { getCurrentLocation, getCurrentSpeed } from "../utils/location";
const API_URL = "http://10.0.2.2:5001";

export default function App() {
  const [permission, requestPermission] = useCameraPermissions();
  const [scanned, setScanned] = useState(false);
  const [loading, setLoading] = useState(false);
  const cameraRef = useRef<CameraView>(null);


  useEffect(() => {
    if (permission?.granted && cameraRef.current) {
      // Camera settings can be configured here if needed
    }
  }, [permission]);

  const handleBarCodeScanned = async ({
    type,
    data,
  }: {
    type: any;
    data: any;
  }) => {
    setScanned(true);

    try {
      const parsedData = JSON.parse(data); // Parse JSON from QR code
      const driverId = parsedData.driver_id; // Ensure driver ID exists
      const vehicleId = parsedData.vehicle_id; // Extract vehicle ID
      const speed = await getCurrentSpeed(); // Get current speed
      const location = await getCurrentLocation(); // Get current location

      if (!driverId || !vehicleId) {
        Alert.alert(
          "Invalid QR Code",
          "Driver ID and Vehicle ID are required."
        );
        return;
      }

      setLoading(true); // Show loading indicator while calling API
      const response = await fetch(`${API_URL}/api/start_trip`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          driver_id: driverId,
          vehicle_id: vehicleId,
          congestion: 0,
          speed: [speed],
          locations: [location],
        }),
      });

      const result = await response.json();
      setLoading(false);

      if (response.ok) {
        Alert.alert(
          "Success",
          `Trip started successfully! \nTrip ID: ${result.trip_details._id}`
        );
      } else {
        Alert.alert("Error", result.error || "Failed to start trip.");
      }
    } catch (error) {
      setLoading(false);
      console.error("Error scanning QR code:", error);
      Alert.alert("Error", "Invalid QR Code or API request failed.");
    }
  };

  if (!permission) {
    return <View />; // Loading state
  }

  if (!permission.granted) {
    return (
      <View style={styles.container}>
        <Text style={styles.permissionText}>
          We need your permission to access the camera
        </Text>
        <TouchableOpacity
          onPress={requestPermission}
          style={styles.permissionButton}
        >
          <Text style={styles.permissionButtonText}>Grant Permission</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <CameraView
        style={styles.camera}
        ref={cameraRef}
        onBarcodeScanned={scanned ? undefined : handleBarCodeScanned}
      >
        <View style={styles.overlay}>
          {loading && <ActivityIndicator size="large" color="#fff" />}
          {scanned && !loading && (
            <TouchableOpacity
              style={styles.button}
              onPress={() => setScanned(false)}
            >
              <Text style={styles.buttonText}>Tap to Scan Again</Text>
            </TouchableOpacity>
          )}
        </View>
      </CameraView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#000",
  },
  camera: {
    flex: 1,
    width: "100%",
  },
  overlay: {
    position: "absolute",
    bottom: 20,
    left: 0,
    right: 0,
    alignItems: "center",
  },
  permissionText: {
    color: "#fff",
    fontSize: 18,
    textAlign: "center",
  },
  permissionButton: {
    backgroundColor: "#007BFF",
    padding: 10,
    borderRadius: 5,
    marginTop: 20,
  },
  permissionButtonText: {
    color: "#fff",
    fontSize: 16,
  },
  button: {
    backgroundColor: "#007AFF",
    padding: 15,
    borderRadius: 10,
  },
  buttonText: {
    color: "#fff",
    fontSize: 16,
  },
});
