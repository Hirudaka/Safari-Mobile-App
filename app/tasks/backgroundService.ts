import * as BackgroundFetch from "expo-background-fetch";
import * as TaskManager from "expo-task-manager";
import { Platform } from "react-native";

// Define the background task name
export const BACKGROUND_FETCH_TASK = "background-fetch-api-call";

// Use a production API URL that will work across networks
// Replace this with your actual production API URL
const API_URL = "http://192.168.8.154:5001";

// Function to make the API call
export const callApi = async () => {
  const timestamp = new Date().toISOString();
  console.log(`API call function triggered - ${timestamp}`);

  try {
    const tripId = "67d3f0a9fe557d23758faca5";

    // Add timeout to prevent hanging requests
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 25000); // 25 second timeout

    const response = await fetch(
      `${API_URL}/api/trips/${tripId}/updateStatus`,
      {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          locations: [6.8338144, 79.9618444],
          speed: [10],
          timestamp: timestamp,
        }),
        signal: controller.signal,
      }
    );

    clearTimeout(timeoutId);

    if (response.ok) {
      const result = await response.json();
      console.log("Congestion Level Updated Successfully", result);
      return true;
    } else {
      const errorText = await response.text();
      console.log("Error updating status:", response.status, errorText);
      return false;
    }
  } catch (error) {
    if (error.name === "AbortError") {
      console.error("API call timed out");
    } else {
      console.error("Error updating congestion level:", error);
    }
    return false;
  }
};

// Define the background task
TaskManager.defineTask(BACKGROUND_FETCH_TASK, async () => {
  console.log(
    `[${BACKGROUND_FETCH_TASK}] Background task started - ${new Date().toISOString()}`
  );

  // Add defensive programming to catch any errors
  try {
    // Perform the API call
    const result = await callApi();

    console.log(`Background task completed. Success: ${result}`);

    // Return the appropriate result based on the API call success
    if (result) {
      return BackgroundFetch.BackgroundFetchResult.NewData;
    } else {
      return BackgroundFetch.BackgroundFetchResult.NoData;
    }
  } catch (error) {
    console.error(`Background task failed:`, error);
    return BackgroundFetch.BackgroundFetchResult.Failed;
  }
});

// Register the background fetch task
export const registerBackgroundFetch = async (): Promise<boolean> => {
  console.log("Attempting to register background fetch task");

  try {
    // Check if task is already registered
    const isRegistered = await TaskManager.isTaskRegisteredAsync(
      BACKGROUND_FETCH_TASK
    );

    if (isRegistered) {
      console.log(`Task ${BACKGROUND_FETCH_TASK} is already registered`);
      return true;
    }

    // Determine the appropriate minimum interval based on the platform
    // iOS has stricter requirements for background tasks
    const minimumInterval = Platform.OS === "ios" ? 900 : 60; // 15 minutes for iOS, 1 minute for Android

    // Register the task
    await BackgroundFetch.registerTaskAsync(BACKGROUND_FETCH_TASK, {
      minimumInterval,
      stopOnTerminate: false,
      startOnBoot: true,
    });

    console.log(
      `Task ${BACKGROUND_FETCH_TASK} registered successfully with minimum interval of ${minimumInterval} seconds`
    );

    // On iOS, we should manually trigger the task once after registration
    if (Platform.OS === "ios") {
      await BackgroundFetch.scheduleTaskAsync(BACKGROUND_FETCH_TASK);
    }

    return true;
  } catch (error) {
    console.error(
      `Failed to register background fetch task ${BACKGROUND_FETCH_TASK}:`,
      error
    );
    return false;
  }
};

// Unregister the background fetch task
export const unregisterBackgroundFetch = async (): Promise<boolean> => {
  try {
    // Check if task is registered before unregistering
    const isRegistered = await TaskManager.isTaskRegisteredAsync(
      BACKGROUND_FETCH_TASK
    );

    if (!isRegistered) {
      console.log(`Task ${BACKGROUND_FETCH_TASK} is not registered`);
      return true;
    }

    // Unregister the task
    await BackgroundFetch.unregisterTaskAsync(BACKGROUND_FETCH_TASK);
    console.log(`Task ${BACKGROUND_FETCH_TASK} unregistered successfully`);
    return true;
  } catch (error) {
    console.error(
      `Failed to unregister background fetch task ${BACKGROUND_FETCH_TASK}:`,
      error
    );
    return false;
  }
};

// Get the status of background fetch
export const getBackgroundFetchStatus =
  async (): Promise<BackgroundFetch.BackgroundFetchStatus> => {
    console.log("Checking background fetch status");

    try {
      const status = await BackgroundFetch.getStatusAsync();
      console.log(
        "Background fetch status:",
        BackgroundFetch.BackgroundFetchStatus[status]
      );
      return status;
    } catch (error) {
      console.error("Failed to get background fetch status:", error);
      throw error;
    }
  };

// Utility function to check if the background fetch is actually running
export const checkBackgroundFetchStatus = async (): Promise<string> => {
  try {
    const status = await BackgroundFetch.getStatusAsync();
    const isRegistered = await TaskManager.isTaskRegisteredAsync(
      BACKGROUND_FETCH_TASK
    );

    let statusMessage = `Background fetch status: ${BackgroundFetch.BackgroundFetchStatus[status]}\n`;
    statusMessage += `Task registered: ${isRegistered}\n`;

    if (
      status === BackgroundFetch.BackgroundFetchStatus.Available &&
      isRegistered
    ) {
      statusMessage +=
        "Background fetch is properly configured and should be running.";
    } else if (status !== BackgroundFetch.BackgroundFetchStatus.Available) {
      statusMessage += "Background fetch is not available on this device.";
    } else if (!isRegistered) {
      statusMessage += "Background task is not registered.";
    }

    return statusMessage;
  } catch (error) {
    return `Error checking background fetch status: ${error.message}`;
  }
};
