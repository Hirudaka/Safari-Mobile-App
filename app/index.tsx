import { NavigationContainer } from '@react-navigation/native';
import MapScreen from './screens/MapScreen';
import MapFilters from './screens/MapFiltersScreen';

//import { RootStackParamList } from './types/navigation';

import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import CameraScreen from './screens/CameraScreen';
import Result from './screens/Result';  
import UserMapScreen from './screens/UserMapScreen';

import DriverProfileScreen from './screens/DriverProfileScreen';
import QRScannerScreen from './screens/QRScannerScreen';
import DriverScheduleScreen from './screens/SchedulesScreen';

import HomePage from './screens/HomePage';
import AnimalDetailScreen from './screens/AnimalDetailScreen';
import GalleryScreen from './screens/GalleryScreen';

import UserRegistration from './screens/UserRegistration';
import LoginPage from './screens/LoginPage';
import DriverLanding from './screens/DriverLanding';
import UserLanding from './screens/UserLanding';
import UserProfile from './screens/UserProfile';

import WelcomeScreen from './screens/WelcomeScreen';

// Define the Animal type
export interface Animal {
  name: string;
  scientificName: string;
  size: string;
  age: string;
  description: string;
  class: string;
  imageUrl: string;
}

export type RootStackParamList = {
  Home: undefined;  
  Camera: undefined;
  Result: { data: { class: string; confidence: number } };
  UserMapScreen: undefined;  
  Gallery: undefined; 
  AnimalDetail: { animal: Animal }; 
  UserRegistration: undefined;
  Login: undefined;
  MapFilters: undefined;
  DriverLanding: { userId: string };
  UserLanding: { userId: string }; // Add userId parameter
  UserProfile: { userId: string };
  DriverProfile:{userId: string};
  DriverScheduleScreen:{userId: string}
};


const Stack = createStackNavigator<RootStackParamList>();

const Index = () => {
  return (

    <Stack.Navigator initialRouteName="MapFilters"
    screenOptions={{
      headerStyle: {
        backgroundColor: '#5A8200',
      },
      headerTintColor: '#fff',
      headerTitleStyle: {
        fontWeight: 'bold',
      },
    }}>
       <Stack.Screen name="WelcomeScreen" component={WelcomeScreen} />
      <Stack.Screen name="Home" component={HomePage} />
      <Stack.Screen name="Camera" component={CameraScreen} />
      <Stack.Screen name="Result" component={Result} />
      <Stack.Screen name="UserMapScreen" component={UserMapScreen} />
      <Stack.Screen name="Gallery" component={GalleryScreen} />
      <Stack.Screen name="AnimalDetail" component={AnimalDetailScreen} />
      <Stack.Screen name="QRScannerScreen" component={QRScannerScreen} />
      <Stack.Screen name="DriverScheduleScreen" component={DriverScheduleScreen}/>
      <Stack.Screen name="DriverProfileScreen" component={DriverProfileScreen}/>
      <Stack.Screen name="MapFilters" component={MapFilters} options={{ title: 'Map Filters' }}/>  
      <Stack.Screen name="MapScreen" component={MapScreen} options={{ title: 'Map' }} />
      <Stack.Screen name="UserRegistration" component={UserRegistration} />
      <Stack.Screen name="Login" component={LoginPage} />
      <Stack.Screen name="DriverLanding" component={DriverLanding} />
      <Stack.Screen name="UserLanding" component={UserLanding} />
      <Stack.Screen name="UserProfile" component={UserProfile} />
    </Stack.Navigator>
  );
};

export default Index;

