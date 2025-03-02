import * as React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import HomePage from './screens/HomePage';
import CameraScreen from './screens/CameraScreen';
import Result from './screens/Result';
import MapScreen from './screens/MapScreen';
import MapFilters from './screens/MapFiltersScreen';
import UserMapScreen from './screens/UserMapScreen';
import { RootStackParamList } from './types/navigation';

const Stack = createStackNavigator<RootStackParamList>();

const AppNavigator = () => {
  return (
    <Stack.Navigator 
      initialRouteName="Home"
      screenOptions={{
        headerStyle: {
          backgroundColor: '#5A8200',
        },
        headerTintColor: '#fff',
        headerTitleStyle: {
          fontWeight: 'bold',
        },
      }}
    >
      <Stack.Screen 
        name="Home" 
        component={HomePage}
        options={{ title: 'Home' }}
      />
      <Stack.Screen 
        name="Camera" 
        component={CameraScreen}
        options={{ title: 'Camera' }}
      />
      <Stack.Screen 
        name="Result" 
        component={Result}
        options={{ title: 'Results' }}
      />
      <Stack.Screen 
        name="MapFilters" 
        component={MapFilters}
        options={{ title: 'Map Filters' }}
      />
      <Stack.Screen 
        name="UserMapScreen" 
        component={UserMapScreen}
        options={{ title: 'User Map' }}
      />
      <Stack.Screen 
        name="MapScreen" 
        component={MapScreen}
        options={{ title: 'Map' }}
      />
      
    </Stack.Navigator>
  );
};

export default AppNavigator;

