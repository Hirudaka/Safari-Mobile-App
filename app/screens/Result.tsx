import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, ScrollView, Image, TouchableOpacity } from "react-native";
import { useNavigation, useRoute } from "@react-navigation/native";
import { FontAwesome } from "@expo/vector-icons";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import * as Location from "expo-location";
import * as Speech from "expo-speech";
import imageMapping from "../../assets/imageMapping";
import AggressivePopup from "./AggressivePopup";

const animalData = require("../../data/animalData.json");

const animalHeights: Record<string, number> = {
  Deer: 1.2,
  Elephant: 3.0,
  Leopard: 0.7,
  Peacock: 1.1,
};

const safetyTips: Record<string, string[]> = {
  Deer: [
    "Although non-aggressive, always maintain a safe distance. Do not approach them or attempt to feed them.", 
  ],
  Elephant: [
    "Never approach an elephant, especially when it is alone or agitated. Maintain a safe distance and avoid making sudden movements.",
  ],
  Leopard: [
    "Stay at a safe distance. Avoid approaching or provoking the leopard. Do not venture into their territory without a guide."
  ],
  Peacock: [
    "While generally non-threatening, avoid disturbing the peacock, especially during mating displays. Keep your distance.", 
  ],
};

const safetyLevels: Record<string, string> = {
  Deer: 'safe',
  Elephant: 'dangerous',
  Leopard: 'dangerous',
  Peacock: 'caution',
};

const Result = () => {
  const route = useRoute();
  const { data, onAggressiveResponse } = route.params;
  const {
    class_name,
    classification_confidence,
    height_pixels,
    detection_confidence,
  } = data;
  const [aggressiveData, setAggressiveData] = useState(null);
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

  useEffect(() => {
    if (onAggressiveResponse) {
      onAggressiveResponse().then((response) => {
        setAggressiveData(response);
      });
    }
  }, [onAggressiveResponse]);

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
  const [showAggressivePopup, setShowAggressivePopup] = useState(false);

  useEffect(() => {
    if (
      aggressiveData &&
      (class_name === "Leopard" || class_name === "Elephant") &&
      distance !== null &&
      distance > 2 &&
      distance < 10 &&
      aggressiveData.similarity_score > 0.85 &&
      ((class_name === "Leopard" && aggressiveData.predicted_class === "Known_leopard") ||
        (class_name === "Elephant" && aggressiveData.predicted_class === "Known_Elephant"))
    ) {
      setShowAggressivePopup(true);
    }
  }, [aggressiveData, class_name, distance]);
  const animal = animalData.animals.find((a: { class: string }) => a.class === class_name);
  const animalImage = animal ? imageMapping[animal.imageUrl] : null;

  const toggleSpeech = () => {
    if (isSpeaking) {
      Speech.stop();
      setIsSpeaking(false);
    } else if (animal?.description) {
      Speech.speak(animal.description, {
        language: "en", 
        pitch: 1.0,
        rate: 1.0,
        onDone: () => setIsSpeaking(false),
        onStart: () => setIsSpeaking(true),
      });
    }
  };

  const tips = safetyTips[class_name] || ["Safety tips not available for this animal."];
  const safetyLevel = safetyLevels[class_name] || "unknown";

  const getSafetyIcon = (level: string) => {
    switch (level) {
      case 'dangerous':
        return <MaterialCommunityIcons name="alert-circle" size={22} color="red" />;
      case 'caution':
        return <MaterialCommunityIcons name="alert" size={22} color="orange" />;
      case 'safe':
        return <MaterialCommunityIcons name="check-circle" size={22} color="green" />;
      default:
        return <MaterialCommunityIcons name="help-circle" size={22} color="gray" />;
    }
  };

  const getSafetyColor = (level: string) => {
    switch (level) {
      case 'dangerous':
        return { backgroundColor: 'rgba(255, 0, 0, 0.1)', borderColor: 'red' };
      case 'caution':
        return { backgroundColor: 'rgba(255, 255, 0, 0.1)', borderColor: 'orange' };
      case 'safe':
        return { backgroundColor: 'rgba(0, 255, 0, 0.1)', borderColor: 'green' };
      default:
        return { backgroundColor: 'rgba(200, 200, 200, 0.1)', borderColor: 'gray' };
    }
  };

  return (
    <View style={{ flex: 1 }}>
      <ScrollView style={styles.container}>
        <View style={styles.headerContainer}>
          {animalImage && <Image source={animalImage} style={styles.image} resizeMode="cover" />}
          <View style={styles.overlay} />
          <View style={styles.textContainer}>
            <Text style={styles.headerTitle}>{animal ? animal.name : "Unknown Animal"}</Text>
            <Text style={styles.headerSubtitle}>
              {animal?.scientificName}
            </Text>
          </View>
        </View>
        <AggressivePopup
  visible={showAggressivePopup}
  onClose={() => setShowAggressivePopup(false)}
  predictedClass={aggressiveData?.predicted_class || ""}
  similarityScore={aggressiveData?.similarity_score || 0}
/>
        <View style={styles.contentContainer}>
          <Text style={styles.description}>{animal?.description}</Text>
          
          <Text style={styles.details}>
            <Text style={styles.label}>Size:</Text> {animal?.size}
          </Text>
          <Text style={styles.details}>
            <Text style={styles.label}>Age:</Text> {animal?.age}
          </Text>       
          <Text style={styles.details}>
            <Text style={styles.label}>Estimated Distance:</Text> {distance !== null ? `${distance.toFixed(2)} meters` : "Unavailable"}
          </Text>
          <Text style={styles.leftText}>
            <Text style={styles.label}>Confidence:</Text> {classification_confidence ? classification_confidence.toFixed(2) + "%" : "N/A"}
          </Text>
          {aggressiveData && (
            <>
              <Text style={styles.details}>
                <Text style={styles.label}>Predicted Aggressive Animal:</Text> {aggressiveData.predicted_class}
              </Text>
              <Text style={styles.details}>
                <Text style={styles.label}>Similarity Score:</Text> {aggressiveData.similarity_score ? aggressiveData.similarity_score.toFixed(4) : "N/A"}
              </Text>
            </>
          )}
          <View style={[styles.safetyTipsContainer, getSafetyColor(safetyLevel)]}>
            <Text style={styles.safetyTipsTitle}>Safety Tips:  {getSafetyIcon(safetyLevel)}</Text>
            {tips.map((tip, index) => (
              <Text key={index} style={styles.safetyTip}>{`${tip}`}</Text>
            ))}
          </View>
        </View>

        <TouchableOpacity style={styles.voiceButton} onPress={toggleSpeech}>
          <FontAwesome name={isSpeaking ? "pause" : "play"} size={24} color="#fff" />
        </TouchableOpacity>

        <TouchableOpacity style={styles.mapButton} onPress={handleNavigateToMap}>
          <FontAwesome name="map-marker" size={28} color="#fff" />
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 , backgroundColor: "#f8f9fa" },
  headerContainer: {
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    height: 250,
  },
  image: {
    width: '100%',
    height: '100%',
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.3)',
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
  },
  textContainer: {
    position: 'absolute',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#fff',
    textAlign: 'center',
    marginBottom: 2,
  },
  headerSubtitle: {
    fontSize: 16,
    fontStyle: 'italic',
    color: '#f1f1f1',
    textAlign: 'center',
  },
  contentContainer: {
    padding: 20,
    backgroundColor: '#fff',
    marginTop: -10,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  description: {
    fontSize: 16,
    color: '#333',
    lineHeight: 24,
    marginBottom: 15,
  },
  details: {
    fontSize: 16,
    color: '#555',
    marginBottom: 5,
  },
  leftText: {
    fontSize: 16,
    color: '#555',
    marginBottom: 5,
    textAlign:"right",
  },
  label: {
    fontWeight: 'bold',
    color: '#222',
  },
  voiceButton: {
    position: "absolute",
    right: 20,
    bottom: 10,
    backgroundColor: "#2e7d32",
    padding: 18,
    borderRadius: 50,
    width: 60,
    height: 60,
    justifyContent: "center",
    alignItems: "center",
    elevation: 5,
  },
  mapButton: {
    position: "relative",
    left: 20,
    bottom: 10,
    backgroundColor: "#d32f2f",
    padding: 18,
    borderRadius: 50,
    width: 60,
    height: 60,
    justifyContent: "center",
    alignItems: "center",
    elevation: 5,
  },
  safetyTipsContainer: {
    marginTop: 10,
    padding: 10,
    borderWidth: 1,
    borderRadius: 10,
  },
  safetyTipsTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 10,
  },
  safetyTip: {
    fontSize: 16,
    color: '#555',
    marginBottom: 5,
  },
});

export default Result;