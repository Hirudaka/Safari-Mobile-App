import React, { useState } from "react";
import { View, StyleSheet, Text, Button, Alert } from "react-native";
import MapView, { Marker } from "react-native-maps";

const MapScreen = ({ route }) => {
  const { userLatitude, userLongitude, estimatedDistance, class_name } = route.params;

  // Calculate estimated animal location
  const estimatedAnimalLocation = {
    latitude: userLatitude + (estimatedDistance / 111320), // Approximate conversion of meters to degrees latitude
    longitude: userLongitude + (estimatedDistance / (111320 * Math.cos(userLatitude * (Math.PI / 180)))), // Adjust longitude based on heading
  };

  // Generate timestamp
  const timestamp = new Date().toISOString();

  // State to handle loading status
  const [isSaving, setIsSaving] = useState(false);

  // Function to send data to the backend
  const saveAnimalData = async () => {
    setIsSaving(true); // Show loading state

    try {
      const response = await fetch("http://192.168.48.219:8000/save_animal_data", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          estimatedAnimalLocation,
          class_name,
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
      setIsSaving(false); // Stop loading state
    }
  };

  return (
    <View style={styles.container}>
      <MapView
        style={styles.map}
        initialRegion={{
          latitude: userLatitude,
          longitude: userLongitude,
          latitudeDelta: 0.05, // Increased zoom level for wider view
          longitudeDelta: 0.05, // Increased zoom level for wider view
        }}
        showsUserLocation={true}
        followsUserLocation={true}
      >
        {/* User Location Marker */}
        <Marker
          coordinate={{ latitude: userLatitude, longitude: userLongitude }}
          title="Your Location"
          description="This is your current location"
        />

        {/* Estimated Animal Location Marker */}
        <Marker
          coordinate={estimatedAnimalLocation}
          title="Estimated Animal Location"
          description={`Estimated distance: ${estimatedDistance.toFixed(2)} meters`}
        />
      </MapView>

      {/* Display user latitude and longitude */}
      <View style={styles.textContainer}>
        <Text style={styles.text}>Lat: {userLatitude}</Text>
        <Text style={styles.text}>Long: {userLongitude}</Text>
      </View>

      {/* Save Button */}
      <View style={styles.buttonContainer}>
        <Button
          title={isSaving ? "Saving..." : "Save Animal Data"}
          onPress={saveAnimalData}
          disabled={isSaving} // Disable the button while saving
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  map: { ...StyleSheet.absoluteFillObject },
  textContainer: {
    position: "absolute",
    top: 20,
    left: 20,
    zIndex: 1,
    backgroundColor: "rgba(255, 255, 255, 0.7)",
    padding: 10,
    borderRadius: 5,
  },
  text: {
    fontSize: 16,
    color: "black",
  },
  buttonContainer: {
    position: "absolute",
    bottom: 20, // Position the button at the bottom of the screen
    left: 20,
    right: 20,
    zIndex: 1,
  },
});

export default MapScreen;
