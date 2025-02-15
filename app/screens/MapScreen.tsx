import React from "react";
import { View, StyleSheet, Text } from "react-native";
import MapView, { Marker } from "react-native-maps";

const MapScreen = ({ route }) => {
  const { userLatitude, userLongitude, estimatedDistance } = route.params;

  // Calculate estimated animal location
  const estimatedAnimalLocation = {
    latitude: userLatitude + (estimatedDistance / 111320), // Approximate conversion of meters to degrees latitude
    longitude: userLongitude + (estimatedDistance / (111320 * Math.cos(userLatitude * (Math.PI / 180)))), // Adjust longitude based on heading
  };

  console.log("User Location:", userLatitude, userLongitude);
  console.log("Estimated Animal Location:", estimatedAnimalLocation);

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
        showsUserLocation={true} // Ensure user's location is visible
        followsUserLocation={true} // Follow the user's location on the map
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

      {/* Display user latitude and longitude on top of map */}
      <View style={styles.textContainer}>
        <Text style={styles.text}>Lat: {userLatitude}</Text>
        <Text style={styles.text}>Long: {userLongitude}</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  map: { ...StyleSheet.absoluteFillObject },
  textContainer: {
    position: "absolute",
    top: 20, // Adjust the position of the text
    left: 20, // Adjust the position of the text
    zIndex: 1, // Make sure the text is on top of the map
    backgroundColor: "rgba(255, 255, 255, 0.7)", // Optional: To make the text stand out
    padding: 10,
    borderRadius: 5,
  },
  text: {
    fontSize: 16,
    color: "black",
  },
});

export default MapScreen;
