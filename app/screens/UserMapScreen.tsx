import React, { useState, useEffect } from "react";
import {
  View,
  StyleSheet,
  Text,
  Animated,
  ActivityIndicator,
  TouchableOpacity,
} from "react-native";
import MapView, { Marker } from "react-native-maps";
import { Picker } from "@react-native-picker/picker";
import { Magnetometer } from "expo-sensors"; // To access device orientation
import Toast from "react-native-toast-message"; // For toast messages

const UserMapScreen = ({ route }) => {
  const { userLatitude, userLongitude, estimatedDistance, class_name } = route.params;

  // State for selected animal and modal visibility
  const [selectedAnimal, setSelectedAnimal] = useState(class_name || "Peacock");
  const [isSaving, setIsSaving] = useState(false);
  const [bearing, setBearing] = useState(0); // State for storing device's bearing (direction)
  const [estimatedAnimalLocation, setEstimatedAnimalLocation] = useState(null); // Store the location once calculated
  const [userPinnedLocation, setUserPinnedLocation] = useState(null); // Store new user-pinned location
  const [region, setRegion] = useState({
    latitude: userLatitude,
    longitude: userLongitude,
    latitudeDelta: 0.05,
    longitudeDelta: 0.05,
  });
  const [isSaveDisabled, setIsSaveDisabled] = useState(false); // Disable save after first use

  // Get device orientation (bearing) using Magnetometer
  useEffect(() => {
    const subscription = Magnetometer.addListener((sensorData) => {
      const angle = Math.atan2(sensorData.y, sensorData.x) * (180 / Math.PI); // Calculate the angle
      setBearing(angle); // Set the bearing (orientation)
    });

    return () => {
      subscription.remove(); // Cleanup subscription on unmount
    };
  }, []);

  // Function to calculate estimated animal location based on user position and bearing
  useEffect(() => {
    if (bearing !== 0 && estimatedAnimalLocation === null) {
      const bearingRad = (bearing * Math.PI) / 180; // Convert bearing to radians
      const newLatitude =
        userLatitude + (estimatedDistance / 111320) * Math.cos(bearingRad); // Adjust latitude based on bearing
      const newLongitude =
        userLongitude +
        (estimatedDistance / (111320 * Math.cos(userLatitude * (Math.PI / 180)))) *
          Math.sin(bearingRad); // Adjust longitude based on bearing

      setEstimatedAnimalLocation({ latitude: newLatitude, longitude: newLongitude });
    }
  }, [bearing, userLatitude, userLongitude, estimatedDistance, estimatedAnimalLocation]);

  // Generate timestamp
  const timestamp = new Date().toISOString();

  // Function to send data to the backend
  const saveAnimalData = async () => {
    setIsSaving(true);

    try {
      const response = await fetch("http://172.28.6.37:8000/save_animal_data", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          estimatedAnimalLocation: userPinnedLocation || estimatedAnimalLocation,
          class_name: selectedAnimal,
          timestamp,
        }),
      });

      if (response.ok) {
        Toast.show({
          type: "success",
          text1: "Success",
          text2: "Animal data saved successfully!",
        });
        setIsSaveDisabled(true); // Disable save after successful submission
      } else {
        Toast.show({
          type: "error",
          text1: "Error",
          text2: "Failed to save animal data. Please try again.",
        });
      }
    } catch (error) {
      Toast.show({
        type: "error",
        text1: "Error",
        text2: "An error occurred while saving the data. Please check your connection.",
      });
      console.error("Error:", error);
    } finally {
      setIsSaving(false);
    }
  };

  if (!estimatedAnimalLocation) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#007BFF" />
        <Text style={styles.loadingText}>Calculating animal location...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <MapView
        style={styles.map}
        region={region}
        showsUserLocation={true}
        followsUserLocation={true}
        onPress={(e) => setUserPinnedLocation(e.nativeEvent.coordinate)} // Allow user to pin a new location
        zoomEnabled={true}
        scrollEnabled={true}
      >
        {/* Show the calculated estimated location */}
        <Marker
          coordinate={estimatedAnimalLocation}
          title="Estimated Animal Location"
          description={`Estimated distance: ${estimatedDistance.toFixed(2)} meters`}
        />
        {/* Show user-pinned location if any */}
        {userPinnedLocation && (
          <Marker
            coordinate={userPinnedLocation}
            title="Pinned Animal Location"
            description="You can save this location."
            pinColor="blue" // Change the color to distinguish it
          />
        )}
      </MapView>

      {/* Confirmation Box at Bottom */}
      <View style={styles.bottomSheet}>
        <Text style={styles.modalTitle}>Confirm Save</Text>
        <Text style={styles.modalText}>Select the animal you spotted:</Text>

        {/* Picker Dropdown */}
        <View style={styles.pickerContainer}>
          <Picker
            selectedValue={selectedAnimal}
            onValueChange={(itemValue) => setSelectedAnimal(itemValue)}
            style={styles.picker}
            dropdownIconColor="#007BFF"
          >
            <Picker.Item label="Peacock" value="Peacock" />
            <Picker.Item label="Elephant" value="Elephant" />
            <Picker.Item label="Deer" value="Deer" />
            <Picker.Item label="Leopard" value="Leopard" />
          </Picker>
        </View>

        {/* Buttons */}
        <View style={styles.modalButtons}>
          <TouchableOpacity
            style={[styles.button, styles.cancelButton]}
            onPress={() =>
              Toast.show({
                type: "info",
                text1: "Cancelled",
                text2: "Animal data was not saved.",
              })
            }
          >
            <Text style={styles.buttonText}>Cancel</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.button, styles.saveButton, isSaveDisabled && styles.disabledButton]}
            onPress={saveAnimalData}
            disabled={isSaving || isSaveDisabled}
          >
            {isSaving ? (
              <ActivityIndicator size="small" color="#fff" />
            ) : (
              <Text style={styles.buttonText}>Save</Text>
            )}
          </TouchableOpacity>
        </View>
      </View>

      {/* Toast Message Component */}
      <Toast />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  map: { ...StyleSheet.absoluteFillObject },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#fff",
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: "#666",
  },
  bottomSheet: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: "#fff",
    padding: 20,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    alignItems: "center",
    elevation: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 10,
    color: "#333",
  },
  modalText: {
    fontSize: 16,
    marginBottom: 10,
    color: "#666",
  },
  pickerContainer: {
    width: "100%",
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    marginBottom: 20,
  },
  picker: {
    width: "100%",
    height: 50,
  },
  modalButtons: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "100%",
  },
  button: {
    flex: 1,
    padding: 10,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
    marginHorizontal: 5,
  },
  cancelButton: {
    backgroundColor: "#ff4444",
  },
  saveButton: {
    backgroundColor: "#007BFF",
  },
  disabledButton: {
    backgroundColor: "#ccc",
  },
  buttonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
});

export default UserMapScreen;