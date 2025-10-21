import React, { useEffect, useState, useCallback, useRef } from "react";
import {
  RefreshControl,
  View,
  Text,
  ActivityIndicator,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Animated,
} from "react-native";
import DateTimePicker from "@react-native-community/datetimepicker";
import axios from "axios";
import { useNavigation, useRoute } from "@react-navigation/native";
import Ionicons from "react-native-vector-icons/Ionicons";

const API_URL = "http://192.168.8.154:5001"; // Ensure your local server is accessible

const DriverTripsScreen = ({ route }) => {
  const navigation = useNavigation();
  const { userId } = route.params; // Get the driver ID from the route params
  const [trips, setTrips] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [fromTime, setFromTime] = useState(null);
  const [toTime, setToTime] = useState(null);
  const [showFromTimePicker, setShowFromTimePicker] = useState(false);
  const [showToTimePicker, setShowToTimePicker] = useState(false);
  const fadeAnim = useState(new Animated.Value(0))[0];

  // Fetch trips by driver ID
  const fetchTrips = async () => {
    setLoading(true);
    try {
      const response = await axios.get(
        `${API_URL}/api/completed_trips/driver/${userId}`
      );
      setTrips(response.data.trips); // Assuming the API returns { trips: [...] }
      setLoading(false);
    } catch (err) {
      setError(err.message);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTrips();
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 800,
      useNativeDriver: true,
    }).start();
  }, []);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    setFromTime(null);
    setToTime(null);
    fetchTrips().finally(() => setRefreshing(false));
  }, []);

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good Morning 🌞";
    if (hour < 18) return "Good Afternoon ☀️";
    return "Good Evening 🌙";
  };

  // Format time for display
  const formatTime = (decimalHours) => {
    if (decimalHours == null) return "N/A";
    const totalMinutes = Math.round(decimalHours * 60);
    const hours = Math.floor(totalMinutes / 60);
    const minutes = totalMinutes % 60;
    const period = hours >= 12 ? "PM" : "AM";
    const formattedHours = hours % 12 || 12;
    const formattedMinutes = minutes.toString().padStart(2, "0");

    return `${formattedHours}:${formattedMinutes} ${period}`;
  };

  const formatTripTime = (seconds) => {
    if (!seconds) return "N/A";
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    return `${hours}h ${minutes}m`;
  };

  // Parse entry time for filtering
  const parseEntryTime = (entryTimeString) => {
    const date = new Date(entryTimeString);
    if (isNaN(date.getTime())) return null;
    const hours = date.getUTCHours();
    const minutes = date.getUTCMinutes();
    return hours + minutes / 60; // Convert to decimal hours
  };

  const parseEntryTimeTimer = (entryTimeString) => {
    const date = new Date(entryTimeString); // Convert string to Date object
    if (isNaN(date.getTime())) {
      return null; // Invalid date
    }
    // Extract hours and minutes in local time
    const hours = date.getHours();
    const minutes = date.getMinutes();
    return hours + minutes / 60; // Convert to decimal hours
  };

  // Handle time filter changes
  const handleTimeFilterChange = (type, value) => {
    const parsedTime = parseEntryTime(value);
    if (type === "from") {
      setFromTime(parsedTime);
    } else if (type === "to") {
      setToTime(parsedTime);
    }
  };

  // Filter trips by time range
  const filterTripsByTime = () => {
    if (fromTime !== null && toTime !== null) {
      return trips.filter((trip) => {
        const entryTime = parseEntryTime(trip.entry_time);
        return entryTime >= fromTime && entryTime <= toTime;
      });
    }
    return trips;
  };

  // Show time picker
  const showTimePicker = (type) => {
    if (type === "from") setShowFromTimePicker(true);
    if (type === "to") setShowToTimePicker(true);
  };

  // Navigate to trip details
  const navigateToTripDetails = (tripId) => {
    navigation.navigate("TripDetails", { tripId });
  };

  const onTimeChange = (event, selectedDate, type) => {
    const currentDate = selectedDate || new Date();
    if (type === "from") {
      setFromTime(parseEntryTimeTimer(currentDate));
      setShowFromTimePicker(false);
    } else if (type === "to") {
      setToTime(parseEntryTimeTimer(currentDate));
      setShowToTimePicker(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.loaderContainer}>
        <ActivityIndicator size="large" color="#4CAF50" />
      </View>
    );
  }

  return (
    <Animated.View style={[styles.container, { opacity: fadeAnim }]}>
      {/* Time Filter Section */}
      {/* Greeting Section */}
      <Text style={styles.greeting}>{getGreeting()}</Text>

      {/* Time Filter Section */}
      <View style={styles.timeFilter}>
        <View style={styles.timePickerContainer}>
          <Text style={styles.timeLabel}>From:</Text>
          <TouchableOpacity
            style={styles.timeButton}
            onPress={() => showTimePicker("from")}
          >
            <Text style={styles.timeText}>
              {fromTime ? formatTime(fromTime) : "Select From Time"}
            </Text>
          </TouchableOpacity>
        </View>

        <View style={styles.timePickerContainer}>
          <Text style={styles.timeLabel}>To:</Text>
          <TouchableOpacity
            style={styles.timeButton}
            onPress={() => showTimePicker("to")}
          >
            <Text style={styles.timeText}>
              {toTime ? formatTime(toTime) : "Select To Time"}
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* DateTimePicker Modals */}
      {showFromTimePicker && (
        <DateTimePicker
          mode="time"
          value={
            fromTime
              ? new Date(
                  new Date().setHours(
                    Math.floor(fromTime),
                    Math.round((fromTime % 1) * 60),
                    0
                  )
                )
              : new Date()
          }
          onChange={(event, date) => onTimeChange(event, date, "from")}
        />
      )}
      {showToTimePicker && (
        <DateTimePicker
          mode="time"
          value={
            toTime
              ? new Date(
                  new Date().setHours(
                    Math.floor(toTime),
                    Math.round((toTime % 1) * 60),
                    0
                  )
                )
              : new Date()
          }
          onChange={(event, date) => onTimeChange(event, date, "to")}
        />
      )}

      {/* DateTimePicker Modals */}
      {showFromTimePicker && (
        <DateTimePicker
          mode="time"
          value={
            fromTime
              ? new Date(
                  new Date().setHours(
                    Math.floor(fromTime),
                    Math.round((fromTime % 1) * 60),
                    0
                  )
                )
              : new Date()
          }
          onChange={(event, date) => onTimeChange(event, date, "from")}
        />
      )}
      {showToTimePicker && (
        <DateTimePicker
          mode="time"
          value={
            toTime
              ? new Date(
                  new Date().setHours(
                    Math.floor(toTime),
                    Math.round((toTime % 1) * 60),
                    0
                  )
                )
              : new Date()
          }
          onChange={(event, date) => onTimeChange(event, date, "to")}
        />
      )}

      {/* Trip List */}
      {filterTripsByTime().length === 0 ? (
        <Text style={styles.noScheduleText}>No Trips Available</Text>
      ) : (
        <FlatList
          data={filterTripsByTime()}
          keyExtractor={(item) => item._id}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
          renderItem={({ item }) => (
            <View style={styles.tripItem}>
              <Text style={styles.tripText}>Trip ID: {item._id}</Text>
              <Text style={styles.tripText}>Driver: {item.driver_name}</Text>
              <Text style={styles.tripText}>Vehicle ID: {item.vehicle_id}</Text>
              <Text style={styles.tripText}>Status: {item.status}</Text>
              <Text style={styles.tripText}>
                Entry Time: {formatTime(parseEntryTime(item.entry_time))}
              </Text>

              <Text style={styles.tripText}>
                Trip Time: {formatTripTime(item.trip_time)}
              </Text>

              <TouchableOpacity
                style={styles.detailsButton}
                onPress={() => navigateToTripDetails(item._id)}
              >
                <Ionicons name="eye" size={20} color="white" />
                <Text style={styles.buttonText}>View Details</Text>
              </TouchableOpacity>
            </View>
          )}
        />
      )}
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 20,
    paddingHorizontal: 15,
    backgroundColor: "#fff",
  },
  loaderContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  timeFilter: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginVertical: 20,
  },
  timePickerContainer: {
    flex: 1,
    marginHorizontal: 5,
  },
  timeLabel: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 5,
  },
  timeButton: {
    padding: 10,
    backgroundColor: "#e0e0e0",
    borderRadius: 5,
    alignItems: "center",
  },
  timeText: {
    fontSize: 16,
    color: "#333",
  },
  noScheduleText: {
    textAlign: "center",
    fontSize: 18,
    color: "#777",
  },
  tripItem: {
    marginVertical: 10,
    padding: 15,
    backgroundColor: "#f9f9f9",
    borderRadius: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.8,
    shadowRadius: 5,
    borderStyle: "solid",
    borderColor: "#ddd",
    borderWidth: 1,
  },
  tripText: {
    fontSize: 16,
    marginVertical: 5,
  },
  detailsButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#4CAF50",
    padding: 10,
    borderRadius: 5,
    marginTop: 10,
  },
  buttonText: {
    color: "white",
    marginLeft: 8,
    fontSize: 16,
  },
  greeting: {
    fontSize: 24,
    fontWeight: "bold",
    marginVertical: 20,
  },
});

export default DriverTripsScreen;
