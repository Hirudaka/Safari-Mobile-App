import React from 'react';
import { View, Text, Image, ScrollView, StyleSheet } from 'react-native';
import { RouteProp } from '@react-navigation/native';
import { RootStackParamList } from '../index'; 

// Route props
type AnimalDetailRouteProp = RouteProp<RootStackParamList, 'AnimalDetail'>;
type Props = { route: AnimalDetailRouteProp };

const AnimalDetailScreen: React.FC<Props> = ({ route }) => {
  const { animal } = route.params;

  return (
    <ScrollView style={styles.container}>
      <Image source={{ uri: animal.imageUrl }} style={styles.image} />
      <Text style={styles.title}>{animal.name}</Text>
      <Text style={styles.scientificName}>({animal.scientificName})</Text>
      <Text style={styles.description}>{animal.description}</Text>
      <Text style={styles.details}>Size: {animal.size}</Text>
      <Text style={styles.details}>Lifespan: {animal.age}</Text>
      <Text style={styles.details}>Class: {animal.class}</Text>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: '#fff' },
  image: { width: '100%', height: 300, borderRadius: 10 },
  title: { fontSize: 24, fontWeight: 'bold', marginTop: 10 },
  scientificName: { fontSize: 18, fontStyle: 'italic', color: '#888' },
  description: { fontSize: 16, marginTop: 10 },
  details: { fontSize: 16, marginTop: 5, fontWeight: 'bold' }
});

export default AnimalDetailScreen;
