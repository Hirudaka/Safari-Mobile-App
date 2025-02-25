import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import CameraScreen from './screens/CameraScreen';
import Result from './screens/Result';  
import MapScreen from './screens/MapScreen';
export type RootStackParamList = {
  Camera: undefined;
  Result: { data: { class: string; confidence: number } };
};

const Stack = createStackNavigator<RootStackParamList>();

const Index = () => {
  return (
    <Stack.Navigator initialRouteName="Camera">
      <Stack.Screen name="Camera" component={CameraScreen} />
      <Stack.Screen name="Result" component={Result} />
      <Stack.Screen name="MapScreen" component={MapScreen} />
    </Stack.Navigator>
  );
};

export default Index;
