import React, { useState, useEffect } from "react";
import { NavigationContainer } from "@react-navigation/native";
import { View, Text, Alert, AppState, AppStateStatus } from "react-native";
import axios from "axios";
import Index from "./index";
import { getCurrentLocation, getCurrentSpeed } from "./utils/location";


const API_URL = "http://10.0.2.2:5001"; 

const App = () => {
  return (
    <NavigationContainer>
      <Index />
    </NavigationContainer>
  );
};

export default App;


// import React, { useState, useEffect } from "react";
// import { View, Text, Alert, AppState, AppStateStatus } from "react-native";
// import axios from "axios";
// import { getCurrentLocation, getCurrentSpeed } from "./utils/location";

// const API_URL = "http://10.0.2.2:5001"; // Replace with your backend URL

// type TripStatus = "ongoing" | "idle" | "completed";

// const App: React.FC = () => {
//   const [tripStatus, setTripStatus] = useState<TripStatus>("ongoing");
//   const [intervalId, setIntervalId] = useState<NodeJS.Timeout | null>(null);
//   const tripId = "65a1b2c3d4e5f6a7b8c9d0e1"; // Replace with the actual trip ID

//   // Function to fetch driver's speed and location
//   const fetchDriverData = async () => {
//     try {
//       const speed = await getCurrentSpeed(); // Get current speed
//       const location = await getCurrentLocation(); // Get current location

//       // Send data to the backend
//       const response = await axios.put(
//         `${API_URL}/api/trips/${tripId}/updateStatus`,
//         {
//           locations: [location], // Add new location
//           speed: [speed], // Add new speed
//           trip_time: 1 / 60, // Add 1 minute to trip time (in hours)
//         }
//       );

//       if (response.status === 200) {
//         console.log("Trip status updated successfully");
//         setTripStatus(response.data.new_status); // Update trip status in the UI
//       }
//     } catch (error) {
//       console.error("Error updating trip status:", error);
//       Alert.alert("Error", "Failed to update trip status.");
//     }
//   };

//   // Start tracking when the component mounts or trip starts
//   useEffect(() => {
//     if (tripId) {
//       const id = setInterval(fetchDriverData, 60000); // Update every 1 minute
//       setIntervalId(id);
//     }

//     // Cleanup on unmount
//     return () => {
//       if (intervalId) {
//         clearInterval(intervalId);
//       }
//     };
//   }, [tripId]);

//   // Handle app background/foreground state
//   useEffect(() => {
//     const handleAppStateChange = (nextAppState: AppStateStatus) => {
//       if (nextAppState === "background" && intervalId) {
//         clearInterval(intervalId); // Stop the timer
//         setIntervalId(null);
//       } else if (nextAppState === "active" && tripId && !intervalId) {
//         const id = setInterval(fetchDriverData, 60000); // Restart the timer
//         setIntervalId(id);
//       }
//     };

//     AppState.addEventListener("change", handleAppStateChange);

//     return () => {
//       AppState.removeEventListener("change", handleAppStateChange);
//     };
//   }, [tripId, intervalId]);

//   return (
//     <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
//       <Text>Trip Status: {tripStatus}</Text>
//     </View>
//   );
// };

// export default App;
