import * as BackgroundFetch from "expo-background-fetch";
import * as TaskManager from "expo-task-manager";
import { getCurrentLocation, getCurrentSpeed } from "../utils/location";

// Define a task name
const BACKGROUND_FETCH_TASK = "background-fetch-task";
const API_URL = "http://192.168.8.154:5001"; // Use your machine's IP for real devices

// Define the fetchData function
const fetchData = async () => {
  try {
    //const currentLocation = await getCurrentLocation();
    //const currentSpeed = await getCurrentSpeed();
    const tripId = "67d3f0a9fe557d23758faca5";

    const response = await fetch(
      `${API_URL}/api/trips/${tripId}/updateStatus`,
      {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          locations: [6.8338144, 79.9618444],
          speed: [10],
        }),
      }
    );

    const result = await response.json();

    if (response.ok) {
      console.log("Congestion Level Updated", `Selected Level:`);
    } else {
      console.log("Error", result.error || "Failed to update trip status");
    }
  } catch (error) {
    console.error("Error updating congestion level:", error);
    console.log(
      "Error",
      "Failed to update congestion level. Please try again."
    );
  }
};

// Define the task
TaskManager.defineTask(BACKGROUND_FETCH_TASK, async () => {
  try {
    await fetchData();
    return BackgroundFetch.Result.NewData;
  } catch (error) {
    console.error("Background fetch failed:", error);
    return BackgroundFetch.Result.Failed;
  }
});

// Register the background task
export const registerBackgroundFetch = async () => {
  try {
    await BackgroundFetch.registerTaskAsync(BACKGROUND_FETCH_TASK, {
      minimumInterval: 60, // 1 minute (in seconds)
      stopOnTerminate: false, // Continue running even if the app is closed
      startOnBoot: true, // Start the task when the device boots
    });
    console.log("Background fetch task registered");
  } catch (error) {
    console.error("Failed to register background fetch task:", error);
  }
};

// Unregister the task (optional, for cleanup)
export const unregisterBackgroundFetch = async () => {
  try {
    await BackgroundFetch.unregisterTaskAsync(BACKGROUND_FETCH_TASK);
    console.log("Background fetch task unregistered");
  } catch (error) {
    console.error("Failed to unregister background fetch task:", error);
  }
};
