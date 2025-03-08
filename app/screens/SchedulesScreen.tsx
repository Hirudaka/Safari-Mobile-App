import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  ActivityIndicator,
  StyleSheet,
  Alert,
  FlatList,
} from "react-native";
import axios from "axios";

const API_URL = "http://10.0.2.2:5001"; // Ensure this is correct for your backend

const formatTime = (decimalHours) => {
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

  useEffect(() => {
    const fetchSchedules = async () => {
      try {
        const response = await axios.get(`${API_URL}/api/optimized_schedule`);
        console.log(response);
      if (response.data && response.data.optimized_schedule && Array.isArray(response.data.optimized_schedule.schedule)) {
  setSchedules(response.data.optimized_schedule.schedule);
} else {
  throw new Error("Invalid response format");
}

      } catch (error) {
        console.error("Error fetching schedules:", error);
        Alert.alert("Error", "Failed to fetch schedules.");
      } finally {
        setLoading(false);
      }
    };

    fetchSchedules();
  }, []);

  if (loading) {
    return (
      <View style={styles.loaderContainer}>
        <ActivityIndicator size="large" color="#0000ff" />
      </View>
    );
  }

  if (!schedules.length) {
    return (
      <View style={styles.container}>
        <Text style={styles.title}>No Schedules Available</Text>
      </View>
    );
  }

   const handleBookSchedule = async (index) => {
     const scheduleId = schedules[index].id; // Ensure each schedule has a unique ID

     try {
       const response = await axios.post(`${API_URL}/api/book_schedule`, {
         schedule_id: scheduleId,
         driver_id: driverId,
       });

       if (response.status === 200) {
         // Update the local state to mark the schedule as booked
         const updatedSchedules = [...schedules];
         updatedSchedules[index].booked = true;
         updatedSchedules[index].driverId = driverId; // Add driver ID to the local state
         setSchedules(updatedSchedules);
         Alert.alert("Success", "Schedule booked successfully!");
       }
     } catch (error) {
       console.error("Error booking schedule:", error);
       Alert.alert("Error", "Failed to book schedule.");
     }
   };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Driver Schedule</Text>
      <FlatList
        data={schedules}
        keyExtractor={(item, index) => item.id || index.toString()}
        renderItem={({ item, index }) => (
          <View style={styles.scheduleItem}>
            <Text style={styles.scheduleTitle}>Schedule {index + 1}</Text>
            <Text style={styles.text}>
              Entry Time: {formatTime(item.entry_time)}
            </Text>
            <Text style={styles.text}>Traffic Level: {item.congestion}</Text>
            <Text style={styles.text}>
              Trip Time: {Math.floor(item.trip_time)}h{" "}
              {Math.round((item.trip_time % 1) * 60)}m
            </Text>
            <Text style={styles.text}>
              Speed:{" "}
              {Array.isArray(item.speed) ? item.speed.join(" - ") : "N/A"} km/h
            </Text>
            <Text style={styles.text}>
              Estimated Exit Time:{" "}
              {formatTime(item.entry_time + item.trip_time)}
            </Text>
            <button
              onClick={() => handleBookSchedule(index)}
              disabled={item.booked}
              style={item.booked ? styles.buttonDisabled : styles.button}
            >
              {item.booked ? "Booked" : "Book Schedule"}
            </button>
          </View>
        )}
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
