import * as React from "react";
import { View, Text, StyleSheet, ScrollView, Image, Alert } from "react-native";
import { RouteProp } from "@react-navigation/native";
import { RootStackParamList } from '../types/navigation';
import imageMapping from "../../imageMapping";

// Import animal data from JSON
const animalData = require("../data/animalData.json");

// Type definitions
type ResultScreenRouteProp = RouteProp<RootStackParamList, "Result">;

interface ResultProps {
  route: ResultScreenRouteProp;
}

const Result: React.FC<ResultProps> = ({ route }) => {
  // Destructure route params with type safety
  const { 
    class_name, 
    classification_confidence, 
    height_pixels, 
    detection_confidence,
    imageUri
  } = route.params.data;

  // Handle case when no classification is available
  if (!class_name) {
    console.warn("class_name is undefined, using fallback value.");
    return (
      <View style={styles.noData}>
        <Text style={styles.noDataText}>No classification result available.</Text>
      </View>
    );
  }

  // Find matching animal data
  const animal = animalData.animals.find((a: any) => a.class === class_name);

  if (!animal) {
    console.warn("No matching animal found for class_name:", class_name);
  }

  return (
    <ScrollView style={styles.container}>
      {/* Header Section */}
      <View style={styles.header}>
        <Text style={styles.headerText}>
          {animal ? animal.name : "Unknown Animal"}
        </Text>
        <Text style={styles.confidenceText}>
          Confidence: {classification_confidence.toFixed(2)}%
        </Text>
      </View>

      {animal ? (
        <View style={styles.content}>
          {/* Animal Image */}
          <Image 
            source={imageMapping[animal.imageUrl]} 
            style={styles.image} 
            resizeMode="contain" 
          />

          {/* Details Card */}
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
          </View>

          {/* Description Card */}
          <View style={styles.descriptionCard}>
            <Text style={styles.sectionTitle}>Description</Text>
            <Text style={styles.description}>{animal.description}</Text>
          </View>
        </View>
      ) : (
        <View style={styles.noData}>
          <Text style={styles.noDataText}>
            No detailed data available for this animal.
          </Text>
        </View>
      )}
    </ScrollView>
  );
};

// Styles
const styles = StyleSheet.create({
  // Container styles
  container: { 
    flex: 1, 
    backgroundColor: "#e8f5e9" 
  },
  
  // Header styles
  header: { 
    backgroundColor: "#2e7d32", 
    paddingVertical: 20, 
    paddingHorizontal: 15, 
    alignItems: "center", 
    borderBottomLeftRadius: 20, 
    borderBottomRightRadius: 20, 
    elevation: 5 
  },
  headerText: { 
    fontSize: 24, 
    fontWeight: "bold", 
    color: "#ffffff", 
    marginBottom: 5 
  },
  confidenceText: { 
    fontSize: 16, 
    color: "#d0f2d0" 
  },

  // Content styles
  content: { 
    padding: 15 
  },
  image: { 
    width: "100%", 
    height: 250, 
    borderRadius: 15, 
    marginBottom: 20, 
    borderWidth: 1, 
    borderColor: "#c8e6c9" 
  },

  // Card styles
  infoCard: { 
    backgroundColor: "#ffffff", 
    padding: 15, 
    borderRadius: 10, 
    marginBottom: 20, 
    elevation: 3, 
    shadowColor: "#000", 
    shadowOpacity: 0.1, 
    shadowRadius: 10, 
    shadowOffset: { width: 0, height: 4 } 
  },
  descriptionCard: { 
    backgroundColor: "#ffffff", 
    padding: 15, 
    borderRadius: 10, 
    elevation: 3, 
    shadowColor: "#000", 
    shadowOpacity: 0.1, 
    shadowRadius: 10, 
    shadowOffset: { width: 0, height: 4 } 
  },

  // Text styles
  sectionTitle: { 
    fontSize: 18, 
    fontWeight: "bold", 
    marginBottom: 10, 
    color: "#2e7d32" 
  },
  infoText: { 
    fontSize: 16, 
    color: "#4e4e4e", 
    marginBottom: 5 
  },
  bold: { 
    fontWeight: "bold" 
  },
  description: { 
    fontSize: 16, 
    color: "#4e4e4e", 
    lineHeight: 22 
  },

  // No data styles
  noData: { 
    padding: 20, 
    margin: 10, 
    backgroundColor: "#ffffff", 
    borderRadius: 8, 
    elevation: 3, 
    alignItems: "center" 
  },
  noDataText: { 
    fontSize: 18, 
    color: "#7b7b7b" 
  },
});

export default Result;
