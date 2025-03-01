import React, { useState, useEffect } from "react";
import { View, StyleSheet, Text, Alert, Button, Animated } from "react-native";
import MapView, { Marker } from "react-native-maps";
import { Picker } from "@react-native-picker/picker";
import { Magnetometer } from "expo-sensors"; // To access device orientation

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

  const [zoom] = useState(new Animated.Value(0));

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

  // Zoom into the user's location when the screen loads
  useEffect(() => {
    Animated.timing(zoom, {
      toValue: 1,
      duration: 1000,
      useNativeDriver: true,
    }).start();
  }, [userLatitude, userLongitude]);

  // Generate timestamp
  const timestamp = new Date().toISOString();

  // Function to send data to the backend
  const saveAnimalData = async () => {
    setIsSaving(true);

    try {
      const response = await fetch("http://172.28.0.229:8000/save_animal_data", {
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
        Alert.alert("Success", "Animal data saved successfully!");
      } else {
        Alert.alert("Error", "Failed to save animal data.");
      }
    } catch (error) {
      Alert.alert("Error", "An error occurred while saving the data.");
      console.error("Error:", error);
    } finally {
      setIsSaving(false);
    }
  };

  if (!estimatedAnimalLocation) {
    return (
      <View style={styles.container}>
        <Text>Loading location...</Text>
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
        <Picker
          selectedValue={selectedAnimal}
          onValueChange={(itemValue) => setSelectedAnimal(itemValue)}
          style={styles.picker}
        >
          <Picker.Item label="Peacock" value="Peacock" />
          <Picker.Item label="Elephant" value="Elephant" />
          <Picker.Item label="Deer" value="Deer" />
          <Picker.Item label="Leopard" value="Leopard" />
        </Picker>

        {/* Buttons */}
        <View style={styles.modalButtons}>
          <Button
            title="Cancel"
            color="red"
            onPress={() => Alert.alert("Cancelled", "Animal data was not saved.")}
          />
          <Button title="OK" onPress={saveAnimalData} disabled={isSaving} />
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  map: { ...StyleSheet.absoluteFillObject },
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
    borderTopWidth: 1,
    borderTopColor: "#eee",
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
  picker: {
    width: "100%",
    height: 50,
  },
  modalButtons: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "100%",
    marginTop: 10,
  },
});

export default UserMapScreen;
