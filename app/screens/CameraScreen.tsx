import React, { useState, useEffect, useRef } from "react";
import { Button, StyleSheet, Text, View, Alert } from "react-native";
import { CameraView, useCameraPermissions } from "expo-camera";
import axios from 'axios';
import { StackNavigationProp } from '@react-navigation/stack';

// Define the RootStackParamList with the 'Result' route
type RootStackParamList = {
  Camera: undefined;
  Result: { data: { class: string; confidence: number } }; // Define the parameters for the 'Result' route
};

// Define the type for CameraScreen's navigation prop
type CameraScreenNavigationProp = StackNavigationProp<RootStackParamList, 'Camera'>;

interface CameraScreenProps {
  navigation: CameraScreenNavigationProp;
}

export default function CameraScreen({ navigation }: CameraScreenProps) {
  const cameraRef = useRef<CameraView>(null);
  const [permission, requestPermission] = useCameraPermissions();
  const [pictureSize, setPictureSize] = useState<string | undefined>(undefined);

  useEffect(() => {
    async function getBestSize() {
      if (permission?.granted && cameraRef.current) {
        const sizes = await cameraRef.current.getAvailablePictureSizesAsync();
        const bestSize = sizes[0]; // Choose the best size
        setPictureSize(bestSize);
      }
    }

    if (permission?.granted) {
      getBestSize();
    }
  }, [permission]);

  if (!permission) {
    return <View />; // Loading state
  }

  if (!permission.granted) {
    return (
      <View style={styles.container}>
        <Text style={{ textAlign: "center" }}>We need your permission to access the camera</Text>
        <Button onPress={requestPermission} title="Grant Permission" />
      </View>
    );
  }

  // Function to test the connection to the server
  const testConnection = async () => {
    try {
      const response = await axios.get('http://192.168.8.167:8000/ping'); 
      return true; 
    } catch (error) {
      console.error("Connection error:", error); 
      Alert.alert('Error', 'Unable to connect to the server');
      return false; // Connection failed
    }
  };

  // Function to capture photo and send it to the API
  const captureAndPredict = async () => {
    const isConnected = await testConnection(); // Check if the server is reachable
    if (!isConnected) {
      return; // If connection fails, stop execution
    }

    if (cameraRef.current) {
      const photo = await cameraRef.current.takePictureAsync();
      console.log(photo); // Log the captured photo

      const formData = new FormData();
      formData.append('file', {
        uri: photo.uri,
        type: 'image/png',
        name: 'photo.png',
      });

      try {
        const response = await axios.post('http://192.168.8.167:8000/predict', formData, { // Use your machine's IP address
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        });

        console.log(response.data); 
        navigation.navigate('Result', { data: response.data });
      } catch (error) {
        console.error(error);
        Alert.alert('Error', 'There was an error processing the image');
      }
    }
  };

  return (
    <View style={styles.container}>
      <View style={{ flex: 1 }}>
        <CameraView style={styles.camera} ref={cameraRef} pictureSize={pictureSize}>
          <View style={styles.overlay}>
            <Text style={styles.overlayText}>In To The Jungle</Text>
          </View>
        </CameraView>
      </View>

      <View style={styles.captureButtonContainer}>
        <Button title="Capture Photo" onPress={captureAndPredict} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    backgroundColor: "#000",
  },
  camera: {
    flex: 1,
    justifyContent: "flex-end",
  },
  overlay: {
    position: "absolute",
    top: 20,
    left: 20,
    zIndex: 10,
  },
  overlayText: {
    fontSize: 18,
    color: "#fff",
    fontWeight: "bold",
    textShadowColor: "#000",
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 10,
  },
  captureButtonContainer: {
    padding: 20,
    backgroundColor: "transparent",
    justifyContent: "center",
    alignItems: "center",
  },
});
