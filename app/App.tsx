import * as React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import AppNavigator from './index';

export default function App() {
  return (
    <NavigationContainer>
      <AppNavigator />
    </NavigationContainer>
  );
}
