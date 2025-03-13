import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import CameraScreen from './screens/CameraScreen';
import Result from './screens/Result';  
import UserMapScreen from './screens/UserMapScreen';
import DriverProfileScreen from './screens/DriverProfileScreen';
import QRScannerScreen from './screens/QRScannerScreen';
import DriverScheduleScreen from './screens/SchedulesScreen';
export type RootStackParamList = {
  Camera: undefined;
  Result: { data: { class: string; confidence: number } };
};

const Stack = createStackNavigator<RootStackParamList>();

const Index = () => {
  return (
    <Stack.Navigator initialRouteName="QRScannerScreen">
      <Stack.Screen name="Camera" component={CameraScreen} />
      <Stack.Screen name="Result" component={Result} />
      <Stack.Screen name="UserMapScreen" component={UserMapScreen} />
      <Stack.Screen name="QRScannerScreen" component={QRScannerScreen} />
      <Stack.Screen
        name="DriverScheduleScreen"
        component={DriverScheduleScreen}
      />
      <Stack.Screen
        name="DriverProfileScreen"
        component={DriverProfileScreen}
      />
    </Stack.Navigator>
  );
};

export default Index;
