import React, { useState } from "react";
import { View, StyleSheet, Button, Text } from "react-native";
import * as ImagePicker from "expo-image-picker";
import { uploadImage } from "../api";

const HomeScreen: React.FC = () => {
  const [result, setResult] = useState<{ class: string; confidence: number } | null>(null);
  const [loading, setLoading] = useState(false);

  const handleImageCapture = async (uri: string) => {
    const formData = new FormData();
    formData.append("file", {
      uri,
      name: "image.jpg",
      type: "image/jpeg",
    } as any);

    setLoading(true);
    try {
      const response = await uploadImage(formData);
      setResult(response);
    } catch (error) {
      console.error(error);
      alert("Failed to upload image!");
    } finally {
      setLoading(false);
    }
  };

  const openCamera = async () => {
    const permission = await ImagePicker.requestCameraPermissionsAsync();
    if (permission.granted) {
      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
      });
      if (!result.canceled) {
        handleImageCapture(result.assets[0].uri);
      }
    } else {
      alert("Camera permission denied");
    }
  };

  return (
    <View style={styles.container}>
      {result ? (
        <View>
          <Text>Class: {result.class}</Text>
          <Text>Confidence: {result.confidence.toFixed(2)}</Text>
        </View>
      ) : (
        <Button title="Capture Image" onPress={openCamera} />
      )}
      {loading && <Text>Loading...</Text>}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
});

export default HomeScreen;
