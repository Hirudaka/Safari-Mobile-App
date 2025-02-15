import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, ScrollView, Image, Button } from "react-native";
import { useNavigation } from "@react-navigation/native";
import * as Location from "expo-location";
import imageMapping from "../../assets/imageMapping";

// Import animal data from JSON
const animalData = require("../../data/animalData.json");

// Animal heights (in meters)
const animalHeights: { [key: string]: number } = {
  Deer: 1.2,
  Elephant: 3.0,
  Leopard: 0.7,
  Peacock: 1.1,
};

const Result = ({ route }) => {
  const { class_name, classification_confidence, height_pixels, detection_confidence } = route.params.data;
  const navigation = useNavigation();
  const [userLocation, setUserLocation] = useState<Location.LocationObject | null>(null);
  const [distance, setDistance] = useState<number | null>(null);

  // Request and fetch user's location
  useEffect(() => {
    (async () => {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        console.warn("Location permission not granted");
        return;
      }
      const location = await Location.getCurrentPositionAsync({});
      setUserLocation(location);
    })();
  }, []);

  // Function to estimate distance using triangle similarity
  const estimateDistance = (class_name: string, height_pixels: number): number | null => {
    const H_real = animalHeights[class_name]; 
    const F = 3250; 
    if (!H_real || height_pixels <= 0) return null;
    return (H_real * F) / height_pixels;
  };

  // Estimate the distance based on class and pixel height
  useEffect(() => {
    if (class_name) {
      setDistance(estimateDistance(class_name, height_pixels));
    }
  }, [class_name, height_pixels]);

  // Navigate to the map with user location and distance
  const handleNavigateToMap = () => {
    if (userLocation && distance) {
      navigation.navigate("MapScreen", {
        userLatitude: userLocation.coords.latitude,
        userLongitude: userLocation.coords.longitude,
        estimatedDistance: distance,
      });
    } else {
      console.warn("User location or distance not available");
    }
  };

  if (!class_name) {
    return (
      <View style={styles.noData}>
        <Text style={styles.noDataText}>No classification result available.</Text>
      </View>
    );
  }

  const animal = animalData.animals.find((a: any) => a.class === class_name);
  const animalImage = imageMapping[animal?.imageUrl] || null;

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerText}>{animal ? animal.name : "Unknown Animal"}</Text>
        <Text style={styles.confidenceText}>Confidence: {classification_confidence.toFixed(2)}%</Text>
      </View>

      {animal ? (
        <View style={styles.content}>
          {animalImage ? (
            <Image source={animalImage} style={styles.image} resizeMode="contain" />
          ) : (
            <Text style={styles.noImageText}>Image not available</Text>
          )}
          <View style={styles.infoCard}>
            <Text style={styles.sectionTitle}>Details</Text>
            <Text style={styles.infoText}>
              <Text style={styles.bold}>Scientific Name: </Text>
              {animal.scientificName}
            </Text>
            <Text style={styles.infoText}>
              <Text style={styles.bold}>Size: </Text>
              {animal.size}
            </Text>
            <Text style={styles.infoText}>
              <Text style={styles.bold}>Age: </Text>
              {animal.age}
            </Text>
            <Text style={styles.infoText}>
              <Text style={styles.bold}>Height (pixels): </Text>
              {height_pixels}
            </Text>
            <Text style={styles.infoText}>
              <Text style={styles.bold}>Detection Confidence: </Text>
              {detection_confidence.toFixed(2)}%
            </Text>
            <Text style={styles.infoText}>
              <Text style={styles.bold}>Estimated Distance: </Text>
              {distance ? `${distance.toFixed(2)} meters` : "Unavailable"}
            </Text>
          </View>

          <Button title="View on Map" onPress={handleNavigateToMap} />
        </View>
      ) : (
        <View style={styles.noData}>
          <Text style={styles.noDataText}>No detailed data available for this animal.</Text>
        </View>
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#e8f5e9" },
  header: {
    backgroundColor: "#2e7d32",
    paddingVertical: 20,
    paddingHorizontal: 15,
    alignItems: "center",
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
    elevation: 5,
  },
  headerText: { fontSize: 24, fontWeight: "bold", color: "#ffffff", marginBottom: 5 },
  confidenceText: { fontSize: 16, color: "#d0f2d0" },
  content: { padding: 15 },
  image: { width: "100%", height: 250, borderRadius: 15, marginBottom: 20, borderWidth: 1, borderColor: "#c8e6c9" },
  noImageText: { fontSize: 16, color: "#7b7b7b", textAlign: "center", marginBottom: 10 },
  infoCard: { backgroundColor: "#ffffff", padding: 15, borderRadius: 10, marginBottom: 20, elevation: 3 },
  sectionTitle: { fontSize: 18, fontWeight: "bold", marginBottom: 10, color: "#2e7d32" },
  infoText: { fontSize: 16, color: "#4e4e4e", marginBottom: 5 },
  bold: { fontWeight: "bold" },
  noData: { padding: 20, margin: 10, backgroundColor: "#ffffff", borderRadius: 8, elevation: 3, alignItems: "center" },
  noDataText: { fontSize: 18, color: "#7b7b7b" },
});

export default Result;
