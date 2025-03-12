import * as React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import Ionicons from 'react-native-vector-icons/Ionicons';

import HomePage from './screens/HomePage';
import CameraScreen from './screens/CameraScreen';
import Result from './screens/Result';
import MapScreen from './screens/MapScreen';
import MapFilters from './screens/MapFiltersScreen';
import UserMapScreen from './screens/UserMapScreen';
import { RootStackParamList } from './types/navigation';

const Stack = createStackNavigator<RootStackParamList>();
const Tab = createBottomTabNavigator();

const BottomTabNavigator = () => {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ color, size }) => {
          let iconName = '';

          if (route.name === 'Home') iconName = 'home';
          else if (route.name === 'Result') iconName = 'list';
          else if (route.name === 'Camera') iconName = 'camera';
          else if (route.name === 'MapFilters') iconName = 'options';
          else if (route.name === 'UserMap') iconName = 'person';

          return <Ionicons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: '#5A8200',
        tabBarInactiveTintColor: 'black',
        tabBarStyle: route.name === 'Home' ? { display: 'none' } : { backgroundColor: '#fff', height: 60, paddingBottom: 8 },
        /*tabBarStyle: {
          backgroundColor: '#fff',
          height: 60,
          paddingBottom: 8,
        },*/
      })}
    >
      <Tab.Screen name="Home" component={HomePage} />
      <Tab.Screen name="Result" component={Result} />
      <Tab.Screen name="Camera" component={CameraScreen} />
      <Tab.Screen name="MapFilters" component={MapFilters} />
      <Tab.Screen name="UserMap" component={UserMapScreen} />
      
    </Tab.Navigator>
  );
};

const AppNavigator = () => {
  return (
    <Stack.Navigator 
      screenOptions={{
        headerStyle: { backgroundColor: '#5A8200' },
        headerTintColor: '#fff',
        headerTitleStyle: { fontWeight: 'bold' },
      }}
    >
      <Stack.Screen name="MainTabs" component={BottomTabNavigator} options={{ headerShown: false }} />
      <Stack.Screen name="MapScreen" component={MapScreen} options={{ title: 'Map' }} />
      <Stack.Screen name="MapFilters" component={MapFilters} options={{ title: 'Map Filters' }} />
    </Stack.Navigator>
  );
};

export default AppNavigator;
