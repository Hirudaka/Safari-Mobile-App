import React, { useState, useEffect, useRef } from "react";
import { TouchableOpacity, StyleSheet, Text, View, Alert } from "react-native";
import { CameraView, useCameraPermissions } from "expo-camera";
import axios from "axios";
import { StackNavigationProp } from "@react-navigation/stack";

// Define the RootStackParamList with the 'Result' route
type RootStackParamList = {
  Camera: undefined;
  Result: { data: { class: string; confidence: number } }; // Define the parameters for the 'Result' route
};

// Define the type for CameraScreen's navigation prop
type CameraScreenNavigationProp = StackNavigationProp<RootStackParamList, "Camera">;

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
        <TouchableOpacity onPress={requestPermission} style={styles.permissionButton}>
          <Text style={styles.permissionButtonText}>Grant Permission</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const testConnection = async () => {
    try {
      await axios.get("http://192.168.8.167:8000/ping");
      return true;
    } catch (error) {
      console.error("Connection error:", error);
      Alert.alert("Error", "Unable to connect to the server");
      return false;
    }
  };

  const captureAndPredict = async () => {
    const isConnected = await testConnection();
    if (!isConnected) return;

    if (cameraRef.current) {
      const photo = await cameraRef.current.takePictureAsync();

      const formData = new FormData();
      formData.append("file", {
        uri: photo.uri,
        type: "image/png",
        name: "photo.png",
      });

      try {
        const response = await axios.post(
          "http://192.168.8.167:8000/predict",
          formData,
          { headers: { "Content-Type": "multipart/form-data" } }
        );
        navigation.navigate("Result", { data: response.data });
      } catch (error) {
        console.error(error);
        Alert.alert("Error", "There was an error processing the image");
      }
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.topPadding} />
      <CameraView style={styles.camera} ref={cameraRef} pictureSize={pictureSize}>
        
      </CameraView>
      <View style={styles.bottomPadding}>
        <TouchableOpacity onPress={captureAndPredict} style={styles.shutterButton} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#000",
  },
  topPadding: {
    height: 50,
    backgroundColor: "#000",
  },
  bottomPadding: {
    height: 120,
    backgroundColor: "#000",
    justifyContent: "center",
    alignItems: "center",
  },
  camera: {
    flex: 1,
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
  shutterButton: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: "#fff",
    borderWidth: 4,
    borderColor: "#000",
  },
  permissionButton: {
    backgroundColor: "#007BFF",
    padding: 10,
    borderRadius: 5,
  },
  permissionButtonText: {
    color: "#fff",
    fontSize: 16,
  },
});
