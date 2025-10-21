import React, { useState } from 'react';
import { View, Text, FlatList, Image, TouchableOpacity, StyleSheet, Dimensions, TextInput } from 'react-native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../index';
import animalData from '../../data/animalData.json';
import imageMapping from "../../assets/imageMapping";

type Animal = {
  name: string;
  scientificName: string;
  size: string;
  age: string;
  description: string;
  class: string;
  imageUrl: string;
};

type GalleryScreenNavigationProp = StackNavigationProp<RootStackParamList, 'Gallery'>;
type Props = { navigation: GalleryScreenNavigationProp };

const animals: Animal[] = animalData.animals;

const { width } = Dimensions.get('window');
const CARD_SIZE = width / 2 - 20;
const IMAGE_HEIGHT = CARD_SIZE * 1.2;

const GalleryScreen: React.FC<Props> = ({ navigation }) => {
  const [searchQuery, setSearchQuery] = useState('');

  const filteredAnimals = animals.filter((animal) =>
    animal.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <View style={styles.container}>
      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <TextInput
          style={styles.searchInput}
          placeholder="Search Animals"
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
      </View>

      <FlatList
        data={filteredAnimals}
        keyExtractor={(item) => item.name}
        numColumns={2}
        renderItem={({ item }) => {
          const animalImage = item.imageUrl ? imageMapping[item.imageUrl] : null;

          return (
            <TouchableOpacity
              style={styles.card}
              onPress={() => navigation.navigate('AnimalDetail', { animal: item })}
            >
              {animalImage ? (
                <Image source={animalImage} style={styles.image} resizeMode="cover" />
              ) : (
                <View style={styles.imagePlaceholder}>
                  <Text style={styles.noImageText}>No Image</Text>
                </View>
              )}
              <View style={styles.overlay}>
                <Text style={styles.name}>{item.name}</Text>
              </View>
            </TouchableOpacity>
          );
        }}
        contentContainerStyle={styles.listContainer}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8f8f8', paddingVertical: 10 },
  listContainer: { paddingBottom: 20 },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
    marginHorizontal: 15,
  },
  searchInput: {
    flex: 1,
    height: 40,
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 20,
    paddingLeft: 15,
  },
  card: {
    width: CARD_SIZE,
    height: IMAGE_HEIGHT,
    backgroundColor: '#fff',
    borderRadius: 15,
    overflow: 'hidden',
    margin: 10,
    elevation: 6,
    shadowColor: '#000',
    shadowOpacity: 0.3,
    shadowOffset: { width: 0, height: 3 },
    shadowRadius: 5,
    alignItems: 'center',
  },
  image: {
    width: '100%',
    height: '100%',
    position: 'absolute',
  },
  imagePlaceholder: {
    width: '100%',
    height: '100%',
    backgroundColor: '#ddd',
    justifyContent: 'center',
    alignItems: 'center',
  },
  noImageText: {
    fontSize: 16,
    color: '#666',
  },
  overlay: {
    position: 'absolute',
    bottom: 0,
    width: '100%',
    backgroundColor: 'rgba(0,0,0,0.5)',
    paddingVertical: 8,
    alignItems: 'center',
  },
  name: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
  },
});

export default GalleryScreen;