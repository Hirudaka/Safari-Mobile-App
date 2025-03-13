import React, { useState } from 'react';
import { View, Text, Image, ScrollView, StyleSheet, TouchableOpacity, Dimensions } from 'react-native';
import { RouteProp } from '@react-navigation/native';
import { RootStackParamList } from '../index';
import imageMapping from "../../assets/imageMapping";
import { FontAwesome, MaterialCommunityIcons } from '@expo/vector-icons';
import * as Speech from 'expo-speech';

const { width } = Dimensions.get('window');

type AnimalDetailRouteProp = RouteProp<RootStackParamList, 'AnimalDetail'>;
type Props = { route: AnimalDetailRouteProp };

const AnimalDetailScreen: React.FC<Props> = ({ route }) => {
  const { animal } = route.params;
  const animalImage = animal ? imageMapping[animal.imageUrl] : null;
  const [isSpeaking, setIsSpeaking] = useState(false);

  const toggleSpeech = () => {
    if (isSpeaking) {
      Speech.stop();
      setIsSpeaking(false);
    } else if (animal?.description) {
      Speech.speak(animal.description, {
        language: "en",
        pitch: 1.0,
        rate: 1.2,
        onDone: () => setIsSpeaking(false),
        onStart: () => setIsSpeaking(true),
      });
    }
  };

  const safetyTips = {
    "Sri Lankan Leopard": { 
      tip: "Stay at a safe distance. Avoid approaching or provoking the leopard. Do not venture into their territory without a guide.", 
      level: "dangerous" 
    },
    "Mugger Crocodile": { 
      tip: "Keep a safe distance from water bodies. Never attempt to feed or provoke a crocodile. They can be very dangerous.", 
      level: "dangerous" 
    },
    "Spotted Deer": { 
      tip: "Although non-aggressive, always maintain a safe distance. Do not approach them or attempt to feed them.", 
      level: "safe" 
    },
    "Sri lankan Peacock": { 
      tip: "While generally non-threatening, avoid disturbing the peacock, especially during mating displays. Keep your distance.", 
      level: "caution" 
    },
    "Asian Elephant": { 
      tip: "Never approach an elephant, especially when it is alone or agitated. Maintain a safe distance and avoid making sudden movements.", 
      level: "dangerous" 
    },
    "Water Buffalo": { 
      tip: "Be cautious around water buffalo, as they may become aggressive when threatened. Do not attempt to approach them.", 
      level: "caution" 
    },
    "Sri Lankan Sloth Bear": { 
      tip: "Avoid close encounters, especially at night. Sloth bears can be dangerous when surprised or threatened.", 
      level: "dangerous" 
    },
    "Sri Lankan Wild Boar": { 
      tip: "Stay at a safe distance from wild boars. They may become aggressive if they feel cornered or threatened.", 
      level: "caution" 
    },
  };
  

  const { tip: animalSafetyTip, level: safetyLevel } = safetyTips[animal.name as keyof typeof safetyTips] || { tip: "Safety tip not available.", level: "safe" };

  const getSafetyIcon = (level: string) => {
    switch (level) {
      case 'dangerous':
        return <MaterialCommunityIcons name="alert-circle" size={24} color="red" />;
      case 'caution':
        return <MaterialCommunityIcons name="alert" size={24} color="orange" />;
      case 'safe':
        return <MaterialCommunityIcons name="check-circle" size={24} color="green" />;
      default:
        return <MaterialCommunityIcons name="help-circle" size={24} color="gray" />;
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
    <ScrollView style={styles.container}>
      <View style={styles.headerContainer}>
        {animalImage && <Image source={animalImage} style={styles.image} resizeMode="cover" />}
        <View style={styles.overlay} />
        <View style={styles.textContainer}>
          <Text style={styles.headerTitle}>{animal.name}</Text>
          <Text style={styles.headerSubtitle}>{animal.scientificName}</Text>
        </View>
      </View>
      
      <View style={styles.contentContainer}>
        <Text style={styles.description}>{animal.description}</Text>
        <Text style={styles.details}><Text style={styles.label}>Size:</Text> {animal.size}</Text>
        <Text style={styles.details}><Text style={styles.label}>Lifespan:</Text> {animal.age}</Text>
      </View>

      {/* Safety Tips Section */}
      <View style={[styles.safetyTipContainer, getSafetyColor(safetyLevel)]}>
        <Text style={styles.safetyTipHeader}>Safety Tips</Text>
        <View style={styles.safetyTipContent}>
          {getSafetyIcon(safetyLevel)}
          <Text style={styles.safetyTip}>{animalSafetyTip}</Text>
        </View>
      </View>

      {/* Voice Button */}
      <TouchableOpacity style={styles.voiceButton} onPress={toggleSpeech}>
        <FontAwesome name={isSpeaking ? "pause" : "play"} size={24} color="#fff" />
      </TouchableOpacity>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8f9fa' },
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
  label: {
    fontWeight: 'bold',
    color: '#222',
  },
  safetyTipContainer: {
    marginTop: 20,
    padding: 15,
    borderRadius: 10,
    borderWidth: 2,
    marginBottom: 20,
  },
  safetyTipHeader: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#222',
    marginBottom: 10,
  },
  safetyTipContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  safetyTip: {
    fontSize: 16,
    color: '#555',
    lineHeight: 22,
    marginLeft: 10,
  },
  voiceButton: {
    position: "absolute",
    right: 20,
    bottom: -60,
    backgroundColor: "#2e7d32",
    padding: 18,
    borderRadius: 50,
    width: 60,
    height: 60,
    justifyContent: "center",
    alignItems: "center",
    elevation: 5,
  },
});

export default AnimalDetailScreen;
