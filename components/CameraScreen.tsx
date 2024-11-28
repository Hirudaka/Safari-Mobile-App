import React, { useRef, useState } from "react";
import { View, StyleSheet, Button } from "react-native";
import { Camera } from "expo-camera";

interface Props {
  onImageCapture: (uri: string) => void;
}

const CameraScreen: React.FC<Props> = ({ onImageCapture }) => {
  const cameraRef = useRef<Camera | null>(null);
  const [hasPermission, setHasPermission] = useState(false);

  React.useEffect(() => {
    (async () => {
      const { status } = await Camera.requestCameraPermissionsAsync();
      setHasPermission(status === "granted");
    })();
  }, []);

  const takePicture = async () => {
    if (cameraRef.current) {
      const photo = await cameraRef.current.takePictureAsync();
      onImageCapture(photo.uri);
    }
  };

  if (!hasPermission) {
    return <View style={styles.container}><Button title="No Camera Access" disabled /></View>;
  }

  return (
    <Camera style={styles.container} ref={cameraRef}>
      <Button title="Take Picture" onPress={takePicture} />
    </Camera>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
});

export default CameraScreen;
