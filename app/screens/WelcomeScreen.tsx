import React from "react";
import { View, Text, Image, TouchableOpacity, Dimensions, StyleSheet } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { Video } from "expo-av";
import { MotiView } from "moti";

const { width, height } = Dimensions.get("window");

const WelcomeScreen = () => {
  const navigation = useNavigation();

  return (
    <View style={styles.container}>
      {/* Full-screen background video */}
      <Video
        source={require("../../assets/jungle_background.mp4")}
        useNativeControls={false}
        resizeMode="cover"
        shouldPlay
        isLooping
        style={StyleSheet.absoluteFill} // Ensures it covers the entire screen
      />

      {/* Dark overlay for readability */}
      <View style={styles.overlay}>
        <MotiView
          from={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ type: "spring", duration: 1000 }}
          style={styles.content}
        >
          {/* Logo */}
          <Image
            source={require("../../assets/jungle_logo.png")}
            style={styles.logo}
            resizeMode="contain"
          />

          {/* Title */}
          <Text style={styles.title}>Welcome to Into the Jungle</Text>

          {/* Subtitle */}
          <Text style={styles.subtitle}>Experience the wild like never before!</Text>
        </MotiView>

        {/* Button */}
        <TouchableOpacity
          onPress={() => navigation.navigate("Login")}
          style={styles.button}
        >
          <Text style={styles.buttonText}>Get Started</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  overlay: {
    flex: 1,
    alignItems: "center",
    justifyContent: "flex-start", // Align content to the top
    paddingHorizontal: 24,
    backgroundColor: "rgba(0,0,0,0.5)", // Semi-transparent background
  },
  content: {
    alignItems: "center",
    marginTop: height * 0.1, // Adds spacing from the top of the screen
  },
  logo: {
    width: width * 0.5,
    height: width * 0.5,
    maxWidth: 200,
    maxHeight: 100,
    marginBottom: 320, // Adds space below the logo
  },
  title: {
    color: "white",
    fontSize: 30, // Increased font size for prominence
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 8, // Adds space between title and subtitle
  },
  subtitle: {
    color: "white",
    fontSize: 20, // Adjusted font size for clarity
    textAlign: "center",
    marginBottom: 24, // Adds space between subtitle and button
  },
  button: {
    backgroundColor: "#5A8200",
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 16,
    shadowOpacity: 0.3,
    shadowRadius: 6,
    marginBottom: 40, // Adds space at the bottom of the screen
  },
  buttonText: {
    color: "white",
    fontSize: 18,
    fontWeight: "600",
  },
});

export default WelcomeScreen;
