import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { RouteProp } from '@react-navigation/native';
import { RootStackParamList } from '../index';  

type ResultRouteProp = RouteProp<RootStackParamList, 'Result'>;

interface ResultProps {
  route: ResultRouteProp;
}

const Result = ({ route }: ResultProps) => {
  const { class: animalClass, confidence } = route.params.data;

  return (
    <View style={styles.container}>
      <Text style={styles.text}>Animal Class: {animalClass}</Text>
      <Text style={styles.text}>Confidence: {confidence}%</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  text: {
    fontSize: 20,
    fontWeight: 'bold',
  },
});

export default Result;
