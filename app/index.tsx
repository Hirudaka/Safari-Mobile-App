import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import CameraScreen from './screens/CameraScreen';
import Result from './screens/Result';  
import UserMapScreen from './screens/UserMapScreen';
import HomePage from './screens/HomePage';
import AnimalDetailScreen from './screens/AnimalDetailScreen';
import GalleryScreen from './screens/GalleryScreen';

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
};

const Stack = createStackNavigator<RootStackParamList>();

const Index = () => {
  return (
    <Stack.Navigator initialRouteName="Home"
    screenOptions={{
      headerStyle: {
        backgroundColor: '#5A8200',
      },
      headerTintColor: '#fff',
      headerTitleStyle: {
        fontWeight: 'bold',
      },
    }}>
      <Stack.Screen name="Home" component={HomePage} />
      <Stack.Screen name="Camera" component={CameraScreen} />
      <Stack.Screen name="Result" component={Result} />
      <Stack.Screen name="UserMapScreen" component={UserMapScreen} />
      <Stack.Screen name="Gallery" component={GalleryScreen} />
      <Stack.Screen name="AnimalDetail" component={AnimalDetailScreen} />

    </Stack.Navigator>
  );
};

export default Index;
