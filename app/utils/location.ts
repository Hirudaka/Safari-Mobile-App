import * as Location from "expo-location";

type Coordinates = [number, number]; // [latitude, longitude]

let previousLocation: Coordinates | null = null;
let previousTime: number | null = null;

// Get the current location
export const getCurrentLocation = async (): Promise<Coordinates> => {
  try {
    const { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== "granted") {
      throw new Error("Location permission not granted");
    }

    const location = await Location.getCurrentPositionAsync({
      accuracy: Location.Accuracy.High,
    });
    const { latitude, longitude } = location.coords;
    return [latitude, longitude];
  } catch (error) {
    console.error("Error getting location:", error);
    throw error;
  }
};

// Calculate speed based on location changes
export const getCurrentSpeed = async (): Promise<number> => {
  const currentLocation = await getCurrentLocation();
  const currentTime = Date.now();

  if (previousLocation && previousTime) {
    const distance = calculateDistance(previousLocation, currentLocation);
    const timeDiff = (currentTime - previousTime) / 1000; // Convert to seconds
    const speed = distance / timeDiff; // Speed in meters per second
    previousLocation = currentLocation;
    previousTime = currentTime;
    return speed * 3.6; // Convert to km/h
  } else {
    previousLocation = currentLocation;
    previousTime = currentTime;
    return 0; // No previous data, assume speed is 0
  }
};

// Calculate distance between two coordinates (in meters)
const calculateDistance = (loc1: Coordinates, loc2: Coordinates): number => {
  const [lat1, lon1] = loc1;
  const [lat2, lon2] = loc2;
  const R = 6371e3; // Earth radius in meters
  const φ1 = (lat1 * Math.PI) / 180;
  const φ2 = (lat2 * Math.PI) / 180;
  const Δφ = ((lat2 - lat1) * Math.PI) / 180;
  const Δλ = ((lon2 - lon1) * Math.PI) / 180;

  const a =
    Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
    Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return R * c; // Distance in meters
};
