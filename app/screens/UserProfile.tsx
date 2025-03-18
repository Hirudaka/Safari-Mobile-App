import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Alert,
  StyleSheet,
  ActivityIndicator
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../types/navigation';

type UserProfileNavigationProp = StackNavigationProp<RootStackParamList, 'UserProfile'>;

const UserProfile = () => {
  const navigation = useNavigation<UserProfileNavigationProp>();
  const route = useRoute();
  const { userId } = route.params as { userId: string }; // Ensure correct type

  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(true);

  // Fetch user data (email) from the backend
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const response = await fetch(`http://10.0.2.2:5001/users/${userId}`);
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

  // Handle Logout
  const handleLogOutProfile = () => {
    Alert.alert(
      'Logout Confirmation',
      'Are you sure you want to logout?',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Logout', onPress: () => navigation.navigate('Login') }
      ]
    );
  };

  // Handle Remove Profile
  const handleRemoveProfile = async () => {
    Alert.alert(
      'Delete Account',
      'Are you sure you want to permanently delete your profile? This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
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
          }
        }
      ]
    );
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

      {/* Buttons Container */}
      <View style={styles.buttonContainer}>
        {/* Logout Button */}
        <TouchableOpacity style={styles.logoutButton} onPress={handleLogOutProfile}>
          <Text style={styles.logoutButtonText}>Logout</Text>
        </TouchableOpacity>

        {/* Remove Profile Button */}
        <TouchableOpacity style={styles.deleteButton} onPress={handleRemoveProfile}>
          <Text style={styles.deleteButtonText}>Delete Account</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

// Styles for better UI/UX
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    padding: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#2D2D2D',
    marginBottom: 15,
  },
  email: {
    fontSize: 18,
    color: '#4A4A4A',
    marginBottom: 30,
  },
  buttonContainer: {
    width: '100%',
    alignItems: 'center',
  },
  logoutButton: {
    width: '80%',
    backgroundColor: '#007AFF',
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
    marginBottom: 12,
    shadowColor: '#007AFF',
    shadowOpacity: 0.3,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 4,
  },
  logoutButtonText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: 'white',
  },
  deleteButton: {
    width: '80%',
    backgroundColor: '#FF3B30',
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
    shadowColor: '#FF3B30',
    shadowOpacity: 0.3,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 4,
  },
  deleteButtonText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: 'white',
  },
});

export default UserProfile;
