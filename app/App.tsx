import React, { useEffect, useState } from "react";
import { NavigationContainer } from "@react-navigation/native";
import { View, Text, Alert, AppState, AppStateStatus } from "react-native";
import axios from "axios";
import * as Location from "expo-location";
import * as TaskManager from "expo-task-manager";
import Index from "./index";

const API_URL = "http://10.0.2.2:5001"; // Replace with your backend URL
const TRIP_ID = "65a1b2c3d4e5f6a7b8c9d0e1"; // Replace with the actual trip ID
const LOCATION_TASK_NAME = "background-location-task";

// Register background location task
TaskManager.defineTask(LOCATION_TASK_NAME, async ({ data, error }) => {
  if (error) {
    console.error("Background Task Error:", error);
    return;
  }

  if (data) {
    const { locations } = data;
    if (locations.length > 0) {
      const location = locations[0];

      // Extract latitude, longitude, and speed
      const { latitude, longitude, speed } = location.coords;

      try {
        await axios.put(`${API_URL}/api/trips/${TRIP_ID}/updateStatus`, {
          locations: [{ latitude, longitude }],
          speed: [speed || 0]
        });

        console.log("Trip status updated:", { latitude, longitude, speed });
      } catch (error) {
        console.error("Error updating trip status:", error);
      }
    }
  }
});

const App = () => {
  const [hasPermission, setHasPermission] = useState(false);

  // Request permissions and start tracking location
  useEffect(() => {
    const startTracking = async () => {
      const { status } = await Location.requestForegroundPermissionsAsync();
      const { status: bgStatus } =
        await Location.requestBackgroundPermissionsAsync();

      if (status !== "granted" || bgStatus !== "granted") {
        Alert.alert(
          "Permission Required",
          "Location permission is needed to track the trip."
        );
        return;
      }

      setHasPermission(true);

      // Start background location tracking
      await Location.startLocationUpdatesAsync(LOCATION_TASK_NAME, {
        accuracy: Location.Accuracy.High,
        timeInterval: 60000, // Update every minute
        distanceInterval: 50, // Update if moved 50 meters
        showsBackgroundLocationIndicator: true,
        foregroundService: {
          notificationTitle: "Tracking Trip",
          notificationBody: "Your location is being recorded for the trip.",
        },
      });

      console.log("Started background location tracking.");
    };

    startTracking();

    return () => {
      Location.stopLocationUpdatesAsync(LOCATION_TASK_NAME);
    };
  }, []);

  return (
    <NavigationContainer>
      <Index />
    </NavigationContainer>
  );
};

export default App;
