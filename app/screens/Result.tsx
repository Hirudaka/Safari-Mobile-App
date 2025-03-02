import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, ScrollView, Image, TouchableOpacity } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { FontAwesome } from "@expo/vector-icons";
import * as Location from "expo-location";
import * as Speech from "expo-speech";
import imageMapping from "../../assets/imageMapping";

const animalData = require("../../data/animalData.json");

const animalHeights: Record<string, number> = {
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
  const [isSpeaking, setIsSpeaking] = useState(false);

  useEffect(() => {
    (async () => {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status === "granted") {
        const location = await Location.getCurrentPositionAsync({});
        setUserLocation(location); 
      }
    })();
  }, []);

  useEffect(() => {
    if (class_name && class_name in animalHeights) {
      const H_real = animalHeights[class_name]; 
      const F = 3250;
      if (H_real && height_pixels > 0) {
        setDistance((H_real * F) / height_pixels); 
      }
    }
  }, [class_name, height_pixels]);

  const handleNavigateToMap = () => {
    if (userLocation && distance !== null) {
      navigation.navigate("UserMapScreen", {
        userLatitude: userLocation.coords.latitude,
        userLongitude: userLocation.coords.longitude,
        estimatedDistance: distance,
        class_name,
      });
    }
  };

  const animal = animalData.animals.find((a: { class: string }) => a.class === class_name);
  const animalImage = animal ? imageMapping[animal.imageUrl] : null;

  const toggleSpeech = () => {
    if (isSpeaking) {
      Speech.stop();
      setIsSpeaking(false);
    } else if (animal?.description) {
      Speech.speak(animal.description, {
        language: "it", // 🇮🇹 Change to Italian if needed
        pitch: 1.0,
        rate: 1.0,
        onDone: () => setIsSpeaking(false),
        onStart: () => setIsSpeaking(true),
      });
    }
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerText}>{animal ? animal.name : "Unknown Animal"}</Text>
        <Text style={styles.confidenceText}>
  Confidence: {classification_confidence ? classification_confidence.toFixed(2) + "%" : "N/A"}
</Text>
      </View>

      <View style={styles.content}>
        {animalImage && <Image source={animalImage} style={styles.image} resizeMode="contain" />}

        <View style={styles.infoCard}>
          <Text style={styles.sectionTitle}>Details</Text>
          <Text style={styles.infoText}><Text style={styles.bold}>Scientific Name:</Text> {animal?.scientificName}</Text>
          <Text style={styles.infoText}><Text style={styles.bold}>Size:</Text> {animal?.size}</Text>
          <Text style={styles.infoText}><Text style={styles.bold}>Height (pixels):</Text> {height_pixels}</Text>
          <Text style={styles.infoText}>
  <Text style={styles.bold}>Detection Confidence:</Text> {detection_confidence ? detection_confidence.toFixed(2) + "%" : "N/A"}
</Text>

<Text style={styles.infoText}>
  <Text style={styles.bold}>Estimated Distance:</Text> {distance !== null ? `${distance.toFixed(2)} meters` : "Unavailable"}
</Text>
        </View>

        <View style={styles.descriptionCard}>
          <Text style={styles.sectionTitle}>Animal Description</Text>
          <Text style={styles.infoText}>{animal?.description}</Text>
        </View>
      </View>

      {/* Voice Control Button */}
      <TouchableOpacity style={styles.voiceButton} onPress={toggleSpeech}>
        <FontAwesome name={isSpeaking ? "pause" : "play"} size={24} color="#fff" />
      </TouchableOpacity>

      {/* Floating Map Button */}
      <TouchableOpacity style={styles.mapButton} onPress={handleNavigateToMap}>
        <FontAwesome name="map-marker" size={28} color="#fff" />
      </TouchableOpacity>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#e8f5e9" },
  header: { backgroundColor: "#2e7d32", paddingVertical: 20, paddingHorizontal: 15, alignItems: "center", borderBottomLeftRadius: 20, borderBottomRightRadius: 20, elevation: 5 },
  headerText: { fontSize: 24, fontWeight: "bold", color: "#ffffff" },
  confidenceText: { fontSize: 16, color: "#d0f2d0" },
  content: { padding: 15 },
  image: { width: "100%", height: 250, borderRadius: 15, marginBottom: 20 },
  infoCard: { backgroundColor: "#ffffff", padding: 15, borderRadius: 10, marginBottom: 20, elevation: 3 },
  descriptionCard: { backgroundColor: "#ffffff", padding: 15, borderRadius: 10, marginBottom: 20, elevation: 3 },
  sectionTitle: { fontSize: 18, fontWeight: "bold", marginBottom: 10, color: "#2e7d32" },
  infoText: { fontSize: 16, color: "#4e4e4e", marginBottom: 5 },
  bold: { fontWeight: "bold" },
  voiceButton: {position: "absolute", right: 20,bottom: 100,backgroundColor: "#2e7d32",padding: 18,borderRadius: 50,width: 60,height: 60,justifyContent: "center",alignItems: "center",elevation: 5},
  
  mapButton: { position: "absolute",right: 20,bottom: 30,backgroundColor: "#d32f2f",padding: 18,borderRadius: 50,width: 60,height: 60,justifyContent: "center",alignItems: "center",elevation: 5},
  
});

export default Result;