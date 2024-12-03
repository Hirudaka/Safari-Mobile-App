import React from "react";
import { View, Text, StyleSheet, ScrollView, Image, Alert } from "react-native";
import { RouteProp } from "@react-navigation/native";
import imageMapping from "../../assets/imageMapping"; // Ensure this maps correctly to image resources

const animalData = require("../../data/animalData.json"); // Ensure this JSON is correctly structured

type RootStackParamList = {
  Result: { data: { class_name: string; confidence: number } };
};

type ResultRouteProp = RouteProp<RootStackParamList, "Result">;

interface ResultProps {
  route: ResultRouteProp;
}

const Result = ({ route }: ResultProps) => {
  const { class_name: animalClass, confidence } = route.params.data;

  // Match the animal based on the 'class_name' field
  const animal = animalData.animals.find(
    (a: any) => a.class === animalClass
  );

  // Handle missing animal data gracefully
  if (!animal) {
    console.error("No matching animal found for class_name:", animalClass);
    Alert.alert("Error", "No details available for the identified animal.");
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerText}>
          {animal ? animal.name : "Unknown Animal"}
        </Text>
        <Text style={styles.confidenceText}>
          Confidence: {confidence.toFixed(2)}%
        </Text>
      </View>

      {animal ? (
        <View style={styles.content}>
          <Image
            source={imageMapping[animal.imageUrl]}
            style={styles.image}
            resizeMode="contain"
          />
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
          </View>

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

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#e8f5e9",
  },
  header: {
    backgroundColor: "#2e7d32",
    paddingVertical: 20,
    paddingHorizontal: 15,
    alignItems: "center",
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
    elevation: 5,
  },
  headerText: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#ffffff",
    marginBottom: 5,
  },
  confidenceText: {
    fontSize: 16,
    color: "#d0f2d0",
  },
  content: {
    padding: 15,
  },
  image: {
    width: "100%",
    height: 250,
    borderRadius: 15,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: "#c8e6c9",
  },
  infoCard: {
    backgroundColor: "#ffffff",
    padding: 15,
    borderRadius: 10,
    marginBottom: 20,
    elevation: 3,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 10,
    color: "#2e7d32",
  },
  infoText: {
    fontSize: 16,
    color: "#4e4e4e",
    marginBottom: 5,
  },
  bold: {
    fontWeight: "bold",
  },
  descriptionCard: {
    backgroundColor: "#ffffff",
    padding: 15,
    borderRadius: 10,
    elevation: 3,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
  },
  description: {
    fontSize: 16,
    color: "#4e4e4e",
    lineHeight: 22,
  },
  noData: {
    padding: 20,
    margin: 10,
    backgroundColor: "#ffffff",
    borderRadius: 8,
    elevation: 3,
    alignItems: "center",
  },
  noDataText: {
    fontSize: 18,
    color: "#7b7b7b",
  },
});

export default Result;
