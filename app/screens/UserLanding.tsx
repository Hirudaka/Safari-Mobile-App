import React from 'react';
import { View, StyleSheet, TouchableOpacity, Text, FlatList } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../types/navigation';
import Ionicons from 'react-native-vector-icons/Ionicons';

type UserLandingNavigationProp = StackNavigationProp<RootStackParamList, 'UserLanding'>;

const UserLanding = () => {
  const navigation = useNavigation<UserLandingNavigationProp>();
  const route = useRoute();
  const { userId } = route.params; // Get the userId from route params

  const cards = [
    { id: '1', title: 'Profile', subtitle: 'View your Profile', icon: 'person', screen: 'UserProfile', params: { userId } },
    { id: '2', title: 'Capture Image', subtitle: 'Take photos using your camera', icon: 'camera', screen: 'Camera' },
    { id: '3', title: 'Gallery', subtitle: 'Learn about animals in Yala', icon: 'paw', screen: 'Gallery' },
    { id: '4', title: 'Open Map', subtitle: 'View and filter locations', icon: 'map', screen: 'MapFilters', params: { userId } },
  ];

  const renderItem = ({ item }: { item: any }) => (
    <TouchableOpacity 
      style={styles.card} 
      onPress={() => navigation.navigate(item.screen, item.params)}
    >
      <View style={styles.iconContainer}>
        <Ionicons name={item.icon} size={32} color="#5A8200" />
      </View>
      <Text style={styles.cardTitle}>{item.title}</Text>
      <Text style={styles.cardSubtitle}>{item.subtitle}</Text>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <FlatList
        data={cards}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        numColumns={2} // This ensures 2 columns
        columnWrapperStyle={styles.row} // Ensures proper spacing
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    padding: 16,
  },
  row: {
    justifyContent: 'space-between', // Distribute items evenly
  },
  card: {
    backgroundColor: 'white',
    borderRadius: 15,
    padding: 20,
    marginVertical: 10,
    flex: 1,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
    marginHorizontal: 8, // Add margin to space between cards
  },
  iconContainer: {
    backgroundColor: '#fff8f6',
    padding: 16,
    borderRadius: 50,
    marginBottom: 12,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
    textAlign: 'center',
  },
  cardSubtitle: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
  },
});

export default UserLanding;