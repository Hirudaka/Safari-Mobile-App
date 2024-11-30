import React from 'react';
import { View, Text, StyleSheet, ScrollView, Image } from 'react-native';
import { RouteProp } from '@react-navigation/native';
import { RootStackParamList } from '../index';

const animalData = require('../../data/animalData.json');

type ResultRouteProp = RouteProp<RootStackParamList, 'Result'>;

interface ResultProps {
  route: ResultRouteProp;
}

const Result = ({ route }: ResultProps) => {
  const { class: animalClass, confidence } = route.params.data;

  const animal = animalData.animals.find((a: any) => a.class === animalClass);

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerText}>Animal Identification</Text>
      </View>

      <View style={styles.resultContainer}>
        <Text style={styles.resultText}>Animal Class: {animalClass}</Text>
        <Text style={styles.resultText}>Confidence: {confidence}%</Text>
      </View>

      {animal ? (
        <View style={styles.animalInfo}>
          <Text style={styles.sectionTitle}>Details</Text>
          <Image
            source={{ uri: animal.imageUrl }}
            style={styles.image}
            resizeMode="contain"
          />
          <Text style={styles.infoText}>
            <Text style={styles.bold}>Name: </Text>
            {animal.name}
          </Text>
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

          <Text style={styles.sectionTitle}>Description</Text>
          <Text style={styles.description}>{animal.description}</Text>
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
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    backgroundColor: '#4682B4',
    padding: 15,
    alignItems: 'center',
  },
  headerText: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#fff',
  },
  resultContainer: {
    padding: 20,
    backgroundColor: '#fff',
    margin: 10,
    borderRadius: 8,
    elevation: 3,
  },
  resultText: {
    fontSize: 18,
    marginVertical: 5,
    fontWeight: '500',
  },
  animalInfo: {
    padding: 20,
    backgroundColor: '#fff',
    margin: 10,
    borderRadius: 8,
    elevation: 3,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginVertical: 10,
    color: '#4682B4',
  },
  image: {
    width: '100%',
    height: 200,
    borderRadius: 10,
    marginBottom: 15,
  },
  infoText: {
    fontSize: 16,
    marginVertical: 5,
    color: '#333',
  },
  bold: {
    fontWeight: 'bold',
  },
  description: {
    fontSize: 16,
    color: '#555',
    marginTop: 10,
    lineHeight: 22,
  },
  noData: {
    padding: 20,
    margin: 10,
    backgroundColor: '#fff',
    borderRadius: 8,
    elevation: 3,
    alignItems: 'center',
  },
  noDataText: {
    fontSize: 18,
    color: '#888',
  },
});

export default Result;
