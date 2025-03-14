import React from 'react';
import { View, StyleSheet, TouchableOpacity, Text } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../types/navigation';
import Ionicons from 'react-native-vector-icons/Ionicons';

type HomeScreenNavigationProp = StackNavigationProp<RootStackParamList, 'Home'>;

const HomePage = () => {
  const navigation = useNavigation<HomeScreenNavigationProp>();

  return (
    <View style={styles.container}>
      <View style={styles.cardsContainer}>
        <TouchableOpacity 
          style={styles.card} 
          onPress={() => navigation.navigate('Camera')}
        >
          <View style={styles.iconContainer}>
            <Ionicons name="camera" size={32} color="#5A8200" />
          </View>
          <Text style={styles.cardTitle}>Capture Image</Text>
          <Text style={styles.cardSubtitle}>Take photos using your camera</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.card} 

          onPress={() => navigation.navigate('MapFilters')}

     
        >
          <View style={styles.iconContainer}>
            <Ionicons name="map" size={32} color="#5A8200" />
          </View>
          <Text style={styles.cardTitle}>Open Map</Text>
          <Text style={styles.cardSubtitle}>View and filter locations</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={styles.card} 
          onPress={() => navigation.navigate('Gallery')}

        >
          <View style={styles.iconContainer}>
            <Ionicons name="paw" size={32} color="#5A8200" />
          </View>
          <Text style={styles.cardTitle}>Gallery</Text>
          <Text style={styles.cardSubtitle}>Learn about animals in Yala</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.card} 
          onPress={() => navigation.navigate('QRScannerScreen')}
        >
          <View style={styles.iconContainer}>
            <Ionicons name="camera" size={32} color="#5A8200" />
          </View>
          <Text style={styles.cardTitle}>QR</Text>
          <Text style={styles.cardSubtitle}>Take photos using your camera</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={styles.card} 
          onPress={() => navigation.navigate('DriverScheduleScreen')}
        >
          <View style={styles.iconContainer}>
            <Ionicons name="camera" size={32} color="#5A8200" />
          </View>
          <Text style={styles.cardTitle}>QR</Text>
          <Text style={styles.cardSubtitle}>Take photos using your camera</Text>
        </TouchableOpacity>


      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  cardsContainer: {
    flex: 1,
    padding: 16,
    justifyContent: 'center',
  },
  card: {
    backgroundColor: 'white',
    borderRadius: 15,
    padding: 20,
    marginVertical: 10,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  iconContainer: {
    backgroundColor: '#fff8f6',
    padding: 16,
    borderRadius: 50,
    marginBottom: 12,
  },
  cardTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  cardSubtitle: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
  }
});

export default HomePage;