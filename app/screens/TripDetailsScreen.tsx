import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
} from "react-native";
import MapView, { Polyline, Marker } from "react-native-maps";
import axios from "axios";
import { useRoute } from "@react-navigation/native";

const TripDetailsScreen = () => {
  const route = useRoute();
  const { tripId } = route.params; // Get the trip ID from the route params
  const [trip, setTrip] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch trip details by trip ID
  useEffect(() => {
    const fetchTripDetails = async () => {
      console.log(tripId);
      try {
        const response = await axios.get(
          `http://192.168.8.154:5001/api/trips/${tripId}`
        );
        setTrip(response.data); // Assuming the API returns { trip: {...} }
        setLoading(false);
      } catch (err) {
        setError(err.message);
        setLoading(false);
      }
    };

    fetchTripDetails();
  }, [tripId]);

  if (loading) {
    return <ActivityIndicator size="large" color="#0000ff" />;
  }

  if (error) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>Error: {error}</Text>
      </View>
    );
  }

  if (!trip) {
    return (
      <View style={styles.container}>
        <Text style={styles.noTripText}>No trip found.</Text>
      </View>
    );
  }

  // Format entry time
  const formatEntryTime = (entryTime) => {
    const date = new Date(entryTime);
    return {
      date: date.toLocaleDateString(),
      time: date.toLocaleTimeString(),
    };
  };

  const { date, time } = formatEntryTime(trip.entry_time);

  // Get the last recorded speed
  const getLastSpeed = (speedArray) => {
    if (Array.isArray(speedArray) && speedArray.length > 0) {
      return speedArray[speedArray.length - 1];
    }
    return "N/A";
  };

  // Get the last location
  const lastLocation =
    trip.locations && trip.locations.length > 0
      ? trip.locations[trip.locations.length - 1]
      : null;

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.header}>Trip Details</Text>
      <View style={styles.detailsContainer}>
        <Text style={styles.label}>Driver:</Text>
        <Text style={styles.value}>{trip.driver_name || "Unknown Driver"}</Text>
      </View>
      <View style={styles.detailsContainer}>
        <Text style={styles.label}>Status:</Text>
        <Text style={styles.value}>{trip.status}</Text>
      </View>
      <View style={styles.detailsContainer}>
        <Text style={styles.label}>Start Date:</Text>
        <Text style={styles.value}>{date}</Text>
      </View>
      <View style={styles.detailsContainer}>
        <Text style={styles.label}>Start Time:</Text>
        <Text style={styles.value}>{time}</Text>
      </View>
      <View style={styles.detailsContainer}>
        <Text style={styles.label}>Last Recorded Speed:</Text>
        <Text style={styles.value}>{getLastSpeed(trip.speed)} km/h</Text>
      </View>

      {/* Map Section */}
      {trip.locations && trip.locations.length > 0 ? (
        <View style={styles.mapContainer}>
          <MapView
            style={styles.map}
            initialRegion={{
              latitude: lastLocation[0],
              longitude: lastLocation[1],
              latitudeDelta: 0.1,
              longitudeDelta: 0.1,
            }}
          >
            {/* Display the route as a polyline */}
            <Polyline
              coordinates={trip.locations.map((loc) => ({
                latitude: loc[0],
                longitude: loc[1],
              }))}
              strokeColor="#FF0000"
              strokeWidth={3}
            />
            {/* Display markers for each location */}
            {trip.locations.map((loc, index) => (
              <Marker
                key={index}
                coordinate={{ latitude: loc[0], longitude: loc[1] }}
                title={`Location ${index + 1}`}
                pinColor={
                  index === 0
                    ? "red"
                    : index === trip.locations.length - 1
                    ? "green"
                    : "blue"
                }
              />
            ))}
          </MapView>
        </View>
      ) : (
        <Text style={styles.noDataText}>No location data available</Text>
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: "#f5f5f5",
  },
  header: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 16,
  },
  detailsContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 12,
  },
  label: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#333",
  },
  value: {
    fontSize: 16,
    color: "#555",
  },
  mapContainer: {
    height: 450,
    marginTop: 16,
    borderRadius: 8,
    overflow: "hidden",
  },
  map: {
    flex: 1,
  },
  noDataText: {
    fontSize: 16,
    textAlign: "center",
    marginTop: 16,
  },
  errorText: {
    fontSize: 18,
    color: "red",
    textAlign: "center",
    marginTop: 20,
  },
  noTripText: {
    fontSize: 18,
    textAlign: "center",
    marginTop: 20,
  },
});

export default TripDetailsScreen;
