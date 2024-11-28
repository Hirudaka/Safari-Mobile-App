import React from "react";
import { View, Text, StyleSheet } from "react-native";

interface Props {
  result: { class: string; confidence: number } | null;
}

const ResultScreen: React.FC<Props> = ({ result }) => {
  if (!result) return <Text>Loading...</Text>;

  return (
    <View style={styles.container}>
      <Text style={styles.text}>Class: {result.class}</Text>
      <Text style={styles.text}>Confidence: {result.confidence.toFixed(2)}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  text: {
    fontSize: 18,
    marginBottom: 10,
  },
});

export default ResultScreen;
