
import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import CameraScreen from './screens/CameraScreen';
import Result from './screens/Result';  // Import Result screen
import { View, Text } from 'react-native'
import MapScreen from './screens/MapScreen';

export type RootStackParamList = {
  Camera: undefined;
  Result: { data: { class: string; confidence: number } };
};

const Stack = createStackNavigator<RootStackParamList>();

const Index = () => {
  return (
    <MapScreen/>
    <Stack.Navigator initialRouteName="Camera">
      <Stack.Screen name="Camera" component={CameraScreen} />
      <Stack.Screen name="Result" component={Result} />
    </Stack.Navigator>
  );
};

export default Index;

