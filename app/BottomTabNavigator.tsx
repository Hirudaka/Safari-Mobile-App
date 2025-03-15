import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import Ionicons from 'react-native-vector-icons/Ionicons';

import HomePage from './screens/HomePage';
import CameraScreen from './screens/CameraScreen';
import Result from './screens/Result';
import MapScreen from './screens/MapScreen';
import MapFilters from './screens/MapFiltersScreen';
import UserMapScreen from './screens/UserMapScreen';

const Tab = createBottomTabNavigator();

const BottomTabNavigator = () => {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ color, size }) => {
          let iconName = '';

          if (route.name === 'Home') {
            iconName = 'home';
          } else if (route.name === 'Camera') {
            iconName = 'camera';
          } else if (route.name === 'Result') {
            iconName = 'list';
          } else if (route.name === 'Map') {
            iconName = 'map';
          } else if (route.name === 'Profile') {
            iconName = 'person';
          }

          return <Ionicons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: '#5A8200',
        tabBarInactiveTintColor: 'gray',
        tabBarStyle: {
          backgroundColor: '#fff',
          height: 60,
          paddingBottom: 8,
        },
        headerShown: false, // Hide header since we have the navbar
      })}
    >
      <Tab.Screen name="Home" component={HomePage} />
      <Tab.Screen name="Camera" component={CameraScreen} />
      <Tab.Screen name="Result" component={Result} />
      <Tab.Screen name="Map" component={MapScreen} />
      <Tab.Screen name="UserMapScreen" component={UserMapScreen} />
    </Tab.Navigator>
  );
};

export default BottomTabNavigator;
