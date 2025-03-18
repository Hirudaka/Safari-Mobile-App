import React, { useEffect, useState, useCallback, useRef } from "react";
import {
  RefreshControl,
  View,
  Text,
  ActivityIndicator,
  StyleSheet,
  Alert,
  FlatList,
  TouchableOpacity,
  Animated,
  Button,
  Switch,
} from "react-native";
import DateTimePicker from "@react-native-community/datetimepicker";
import axios from "axios";
import TrafficCongestionPopup from "./TrafficCongestionPopup";
import { getCurrentLocation, getCurrentSpeed } from "../utils/location";

const API_URL = "http://192.168.8.154:5001"; // Ensure your local server is accessible

// Utility functions remain unchanged

const DriverScheduleScreen = () => {
  const driverId = "67d6f1e50c6ff596244f061d";
  const [schedules, setSchedules] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [popupVisible, setPopupVisible] = useState(false);
  const [fromTime, setFromTime] = useState(null);
  const [toTime, setToTime] = useState(null);
  const [showFromTimePicker, setShowFromTimePicker] = useState(false);
  const [showToTimePicker, setShowToTimePicker] = useState(false);
  const fadeAnim = useState(new Animated.Value(0))[0];

  // New state for auto-updates
  const [autoUpdateEnabled, setAutoUpdateEnabled] = useState(false);
  const [autoUpdateCongestionLevel, setAutoUpdateCongestionLevel] = useState(1);
  const intervalRef = useRef(null);

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

  const parseEntryTime = (entryTimeString) => {
    const date = new Date(entryTimeString); // Convert string to Date object
    if (isNaN(date.getTime())) {
      return null; // Invalid date
    }
    // Extract hours and minutes in UTC (GMT) to avoid timezone conversion
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

  const calculateAverage = (arr) => {
    if (!Array.isArray(arr) || arr.length === 0) return "N/A";
    const sum = arr.reduce((acc, val) => acc + val, 0);
    return (sum / arr.length).toFixed(2); // Round to 2 decimal places
  };

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good Morning 🌞";
    if (hour < 18) return "Good Afternoon ☀️";
    return "Good Evening 🌙";
  };

  const getTomorrowDate = () => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    return tomorrow.toDateString();
  };
  useEffect(() => {
    fetchSchedules();
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 800,
      useNativeDriver: true,
    }).start();
  }, []);

  // New useEffect for auto-updates
  useEffect(() => {
    // Clear any existing interval when the component unmounts or when autoUpdateEnabled changes
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, []);

  // Watch for changes to autoUpdateEnabled
  useEffect(() => {
    if (autoUpdateEnabled) {
      // Start the interval timer
      intervalRef.current = setInterval(() => {
        handleTrafficSubmit(autoUpdateCongestionLevel);
      }, 3000); // 3000 milliseconds = 3 seconds

      // Show initial notification
      Alert.alert(
        "Auto Updates Enabled",
        `Traffic updates will be sent automatically every 3 seconds with congestion level ${autoUpdateCongestionLevel}.`
      );
    } else {
      // Clear the interval timer
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    }

    // Cleanup when component unmounts or when autoUpdateEnabled changes
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [autoUpdateEnabled, autoUpdateCongestionLevel]);

  const fetchSchedules = async () => {
    // Existing fetchSchedules code unchanged
    setLoading(true);
    try {
      const response = await axios.get(`${API_URL}/api/optimized_schedule`);
      const { optimized_schedule } = response.data;

      if (Array.isArray(optimized_schedule) && optimized_schedule.length > 0) {
        setSchedules(optimized_schedule);
      } else {
        throw new Error("No schedules available.");
      }
    } catch (error) {
      console.error("Error fetching schedules:", error);
      Alert.alert("Error", "Failed to fetch schedules. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    setFromTime(null);
    setToTime(null);
    fetchSchedules().finally(() => setRefreshing(false));
  }, []);

  const handleBookSchedule = async (index) => {
    // Existing handleBookSchedule code unchanged
    const schedule = schedules[index];
    try {
      const response = await axios.post(`${API_URL}/api/book_schedule`, {
        driver_id: driverId,
        mainSchedule_id: schedule._id,
      });

      if (response.status === 200) {
        setSchedules((prevSchedules) =>
          prevSchedules.map((item, i) =>
            i === index ? { ...item, booked: true, driverId } : item
          )
        );
        Alert.alert("✅ Success", "Schedule booked successfully!");
      }
    } catch (error) {
      console.error(
        "Error:",
        error.response ? error.response.data : error.message
      );
      Alert.alert("❌ Error", "Failed to book schedule. Please try again.");
    }
  };

  const openTrafficPopup = () => setPopupVisible(true);
  const closeTrafficPopup = () => setPopupVisible(false);

  const handleTrafficSubmit = async (congestionLevel) => {
    try {
      // Fetch trips for the driver
      const tripResponse = await axios.get(
        `${API_URL}/api/trips/driver/${driverId}`
      );

      if (tripResponse.data.length === 0) {
        if (!autoUpdateEnabled) {
          Alert.alert(
            "No Active Trips",
            "You have no active trips at the moment."
          );
        }
        return;
      }

      // Extract the trip ID (assuming the first trip in the list)
      const tripId = tripResponse.data[0]._id;

      // Get current location and speed
      const currentLocation = await getCurrentLocation();
      const currentSpeed = await getCurrentSpeed();

      // Update congestion level for the trip
      const response = await fetch(
        `${API_URL}/api/trips/${tripId}/updateStatus`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            congestion: congestionLevel,
            locations: [currentLocation],
            speed: [currentSpeed],
          }),
        }
      );

      const result = await response.json();

      if (response.ok) {
        // Only show alert if not in auto-update mode
        if (!autoUpdateEnabled) {
          Alert.alert(
            "Congestion Level Updated",
            `Selected Level: ${congestionLevel}`
          );
        }
        closeTrafficPopup();
      } else {
        if (!autoUpdateEnabled) {
          Alert.alert("Error", result.error || "Failed to update trip status");
        }
      }
    } catch (error) {
      console.error("Error updating congestion level:", error);
      if (!autoUpdateEnabled) {
        Alert.alert(
          "Error",
          "Failed to update congestion level. Please try again."
        );
      }
    }
  };

  // Function to toggle auto-updates
  const toggleAutoUpdate = () => {
    setAutoUpdateEnabled(!autoUpdateEnabled);
  };

  // Function to change congestion level for auto-updates
  const changeCongestionLevel = (level) => {
    setAutoUpdateCongestionLevel(level);
    if (autoUpdateEnabled) {
      Alert.alert(
        "Congestion Level Changed",
        `Auto-updates will now use congestion level ${level}`
      );
    }
  };

  // Existing functions remain unchanged
  const handleTimeFilterChange = (type, value) => {
    const parsedTime = parseEntryTime(value);
    if (type === "from") {
      setFromTime(parsedTime);
    } else if (type === "to") {
      setToTime(parsedTime);
    }
  };

  const filterSchedulesByTime = () => {
    if (fromTime !== null && toTime !== null) {
      return schedules.filter((schedule) => {
        const entryTime = parseEntryTime(schedule.entry_time);
        return entryTime >= fromTime && entryTime <= toTime;
      });
    }
    return schedules;
  };

  const showTimePicker = (type) => {
    if (type === "from") setShowFromTimePicker(true);
    if (type === "to") setShowToTimePicker(true);
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
      {/* Greeting Section */}
      <Text style={styles.greeting}>{getGreeting()}</Text>

      {/* Date Card */}
      <View style={styles.dateCard}>
        <Text style={styles.dateTextTitle}>📅 Schedule For:</Text>
        <Text style={styles.dateText}>{getTomorrowDate()}</Text>
      </View>

      {/* Auto Traffic Updates Section */}
      <View style={styles.autoUpdateContainer}>
        <View style={styles.autoUpdateHeader}>
          <Text style={styles.autoUpdateTitle}>🚦 Auto Traffic Updates</Text>
          <Switch
            value={autoUpdateEnabled}
            onValueChange={toggleAutoUpdate}
            trackColor={{ false: "#767577", true: "#81b0ff" }}
            thumbColor={autoUpdateEnabled ? "#4CAF50" : "#f4f3f4"}
          />
        </View>

        {autoUpdateEnabled && (
          <View style={styles.congestionLevelSelector}>
            <Text style={styles.congestionLevelTitle}>Congestion Level:</Text>
            <View style={styles.congestionButtons}>
              {[1, 2, 3, 4, 5].map((level) => (
                <TouchableOpacity
                  key={level}
                  style={[
                    styles.congestionButton,
                    autoUpdateCongestionLevel === level &&
                      styles.congestionButtonActive,
                  ]}
                  onPress={() => changeCongestionLevel(level)}
                >
                  <Text style={styles.congestionButtonText}>{level}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        )}
      </View>

      {/* Manual Traffic Button */}
      <Button title="Manual Traffic Update" onPress={openTrafficPopup} />

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

      {filterSchedulesByTime().length === 0 ? (
        <Text style={styles.noScheduleText}>No Schedules Available</Text>
      ) : (
        <FlatList
          data={filterSchedulesByTime()}
          keyExtractor={(item, index) => item._id || `schedule-${index}`}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
          renderItem={({ item, index }) => (
            <View style={styles.scheduleItem}>
              <Text style={styles.scheduleTitle}>🛻 Schedule {index + 1}</Text>
              <View style={styles.horizontalLine} />
              <Text style={styles.scheduleText}>
                <Text style={styles.boldText}>🕒 Entry Time: </Text>
                {formatTime(parseEntryTime(item.entry_time))}
              </Text>

              <Text style={styles.scheduleText}>
                <Text style={styles.boldText}>🚦 Avg Traffic Level: </Text>
                {calculateAverage(item.congestion)}
              </Text>

              <Text style={styles.scheduleText}>
                <Text style={styles.boldText}>⏳ Trip Time: </Text>
                {item.trip_time
                  ? `${Math.floor(item.trip_time)}h ${Math.round(
                      (item.trip_time % 1) * 60
                    )}m`
                  : "N/A"}
              </Text>

              <Text style={styles.scheduleText}>
                <Text style={styles.boldText}>🚗💨 Avg Speed: </Text>
                {calculateAverage(item.speed)} km/h
              </Text>

              <Text style={styles.scheduleText}>
                <Text style={styles.boldText}>⏰ Exit Time: </Text>
                {formatTime(parseEntryTime(item.entry_time) + item.trip_time)}
              </Text>

              <TouchableOpacity
                onPress={() => handleBookSchedule(index)}
                style={[styles.bookButton, item.booked && styles.bookedButton]}
              >
                <Text style={styles.buttonText}>
                  {item.booked ? "✅ Booked" : "📌 Book Now"}
                </Text>
              </TouchableOpacity>
            </View>
          )}
        />
      )}

      {/* Traffic Congestion Popup */}
      <TrafficCongestionPopup
        visible={popupVisible}
        onCancel={() => setPopupVisible(false)}
        onSubmit={handleTrafficSubmit}
      />
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
  greeting: {
    fontSize: 24,
    fontWeight: "bold",
    marginVertical: 20,
  },
  dateCard: {
    backgroundColor: "#f0f0f0",
    padding: 15,
    borderRadius: 8,
    marginBottom: 20,
  },
  dateTextTitle: {
    fontSize: 18,
    color: "#000",
    fontWeight: "bold",
  },
  dateText: {
    fontSize: 16,
    color: "#333",
  },
  autoUpdateContainer: {
    backgroundColor: "#f0f0f0",
    padding: 15,
    borderRadius: 8,
    marginBottom: 20,
  },
  autoUpdateHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  autoUpdateTitle: {
    fontSize: 16,
    fontWeight: "bold",
  },
  congestionLevelSelector: {
    marginTop: 10,
  },
  congestionLevelTitle: {
    fontSize: 14,
    fontWeight: "bold",
    marginBottom: 5,
  },
  congestionButtons: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  congestionButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#ddd",
    justifyContent: "center",
    alignItems: "center",
  },
  congestionButtonActive: {
    backgroundColor: "#4CAF50",
  },
  congestionButtonText: {
    fontSize: 16,
    fontWeight: "bold",
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
  title: {
    fontSize: 22,
    fontWeight: "bold",
    marginVertical: 15,
  },
  noScheduleText: {
    textAlign: "center",
    fontSize: 18,
    color: "#777",
  },
  scheduleItem: {
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
  scheduleTitle: {
    fontSize: 18,
    fontWeight: "bold",
  },
  horizontalLine: {
    marginVertical: 10,
    height: 1,
    backgroundColor: "#ccc",
  },
  scheduleText: {
    fontSize: 16,
    marginVertical: 5,
  },
  boldText: {
    fontWeight: "bold",
  },
  bookButton: {
    padding: 10,
    backgroundColor: "#4CAF50",
    borderRadius: 20,
    marginTop: 10,
    width: "60%",
    alignItems: "center",
    alignSelf: "center",
  },
  bookedButton: {
    backgroundColor: "#888",
  },
  buttonText: {
    color: "#fff",
    fontSize: 16,
  },
});

export default DriverScheduleScreen;
