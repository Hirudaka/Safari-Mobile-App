import React, { useEffect, useState, useCallback } from "react";
import {
  RefreshControl,
  View,
  Text,
  ActivityIndicator,
  StyleSheet,
  Alert,
  FlatList,
  Button,
} from "react-native";
import axios from "axios";
import TrafficCongestionPopup from "./TrafficCongestionPopup"; 
import { getCurrentLocation, getCurrentSpeed } from "../utils/location";

const API_URL = "http://10.0.2.2:5001";

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

const DriverScheduleScreen = () => {
  const driverId = "a3487d91-d956-42af-bd04-bf072f22981c";
  const [schedules, setSchedules] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [popupVisible, setPopupVisible] = useState(false); // State to manage popup visibility

  const fetchSchedules = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`${API_URL}/api/optimized_schedule`);
      const { optimized_schedule } = response.data;

      if (Array.isArray(optimized_schedule) && optimized_schedule.length > 0) {
        setSchedules(optimized_schedule);
      } else {
        throw new Error("Invalid response format or empty data.");
      }
    } catch (error) {
      console.error("Error fetching schedules:", error);
      Alert.alert("Error", "Failed to fetch schedules. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSchedules();
  }, []);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchSchedules().finally(() => setRefreshing(false));
  }, []);

  const handleBookSchedule = async (index) => {
    const schedule = schedules[index];
    console.log(schedule);
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
        Alert.alert("Success", "Schedule booked successfully!");
      }
    } catch (error) {
      console.error("Axios Error:", error.response ? error.response.data : error.message);
      Alert.alert("Error", "Failed to book schedule. Please try again.");
    }
  };

  const openTrafficPopup = () => {
    setPopupVisible(true); // Open the popup
  };

  const closeTrafficPopup = () => {
    setPopupVisible(false); // Close the popup
  };

 const handleTrafficSubmit = async (congestionLevel) => {
  const currentLocation = await getCurrentLocation(); // Replace with actual method for fetching the location
  const currentSpeed = await getCurrentSpeed(); // Replace with actual method for fetching the speed

  const tripId = "67d27775f72e543d20aee9de"; // Replace with the actual trip ID you're working with

  try {
    const response = await fetch(`${API_URL}/api/trips/${tripId}/updateStatus`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        congestion: congestionLevel,
        locations: [currentLocation], // Assuming you're sending one location
        speed: [currentSpeed], // Assuming you're sending one speed
        trip_time: 15, // Assuming you're sending a trip time value (replace with actual value)
      }),
    });

    const result = await response.json();

    if (response.ok) {
      Alert.alert("Congestion Level Updated", `Selected Level: ${congestionLevel}`);
      closeTrafficPopup(); // Close the popup after submission
      // Optionally update the UI or state here if necessary, e.g.:
      // setSchedules(updatedSchedules);
    } else {
      Alert.alert("Error", result.error || "Failed to update trip status");
    }
  } catch (error) {
    console.error("Error updating congestion level:", error);
    Alert.alert("Error", "Failed to update congestion level. Please try again.");
  }
};


  if (loading) {
    return (
      <View style={styles.loaderContainer}>
        <ActivityIndicator size="large" color="#0000ff" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Driver Schedule</Text>
      <Button title="Open Traffic Popup" onPress={openTrafficPopup} />
      {schedules.length === 0 ? (
        <Text style={styles.noScheduleText}>No Schedules Available</Text>
      ) : (
        <FlatList
          data={schedules}
          keyExtractor={(item, index) => item._id || `schedule-${index}`}
          renderItem={({ item, index }) => (
            <View style={styles.scheduleItem}>
              <Text style={styles.scheduleTitle}>Schedule {index + 1}</Text>
              <Text style={styles.text}>
                Entry Time: {formatTime(item.entry_time)}
              </Text>
              <Text style={styles.text}>Traffic Level: {item.congestion}</Text>
              <Text style={styles.text}>Trip Time: {item.trip_time}</Text>
              <Button
                title={item.booked ? "Booked" : "Book Schedule"}
                onPress={() => handleBookSchedule(index)}
                disabled={item.booked}
              />
            </View>
          )}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
        />
      )}

      {/* Traffic Congestion Popup */}
      <TrafficCongestionPopup
        visible={popupVisible}
        onCancel={closeTrafficPopup}
        onSubmit={handleTrafficSubmit}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: "#fff",
  },
  loaderContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 20,
    textAlign: "center",
  },
  noScheduleText: {
    fontSize: 18,
    textAlign: "center",
    marginTop: 20,
    color: "gray",
  },
  scheduleItem: {
    backgroundColor: "#f8f9fa",
    padding: 15,
    marginVertical: 8,
    borderRadius: 8,
    elevation: 2,
  },
  scheduleTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 5,
  },
  text: {
    fontSize: 16,
    marginBottom: 5,
  },
});

export default DriverScheduleScreen;