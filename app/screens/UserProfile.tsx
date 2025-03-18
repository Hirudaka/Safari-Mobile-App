import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, Alert, StyleSheet, ActivityIndicator } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../types/navigation';

type UserProfileNavigationProp = StackNavigationProp<RootStackParamList, 'UserProfile'>;

const UserProfile = () => {
  const navigation = useNavigation<UserProfileNavigationProp>();
  const route = useRoute();
  const { userId } = route.params; // Get the userId from route params

  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(true);

  // Fetch user data (email) from the backend
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const response = await fetch(`http://192.168.8.164:5001/users/${userId}`);
        const data = await response.json();

        if (response.ok) {
          setEmail(data.email); // Set the email from the response
        } else {
          Alert.alert('Error', data.error || 'Failed to fetch user data');
        }
      } catch (error) {
        console.error('Error:', error);
        Alert.alert('Error', 'An error occurred while fetching user data');
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, [userId]);

  // Handle Remove Profile
  const handleRemoveProfile = async () => {
    try {
      const response = await fetch(`http://10.0.2.2:5001/users/${userId}`, {
        method: 'DELETE',
      });

      const data = await response.json();

      if (response.ok) {
        Alert.alert('Success', 'Profile removed successfully!');
        navigation.navigate('Login'); // Navigate back to the login screen
      } else {
        Alert.alert('Error', data.error || 'Failed to remove profile');
      }
    } catch (error) {
      console.error('Error:', error);
      Alert.alert('Error', 'An error occurred while removing the profile');
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#5A8200" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>User Profile</Text>
      <Text style={styles.email}>Email: {email}</Text>

      {/* Remove Profile Button */}
      <TouchableOpacity style={styles.removeButton} onPress={handleRemoveProfile}>
        <Text style={styles.removeButtonText}>Remove Profile</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    padding: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 20,
  },
  email: {
    fontSize: 18,
    color: '#666',
    marginBottom: 20,
  },
  removeButton: {
    backgroundColor: '#FF3B30',
    borderRadius: 10,
    padding: 16,
    alignItems: 'center',
  },
  removeButtonText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: 'white',
  },
});

export default UserProfile;