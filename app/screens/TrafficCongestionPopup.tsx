import React, { useState } from "react";
import { Text, View,Modal } from "react-native";
import Slider from '@react-native-community/slider';


const TrafficCongestionPopup = ({ visible, onCancel, onSubmit }) => {
  const [congestionLevel, setCongestionLevel] = useState(0);

  const handleCongestionChange = (value) => {
    setCongestionLevel(value);
  };

  return (
       <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onCancel}  // Change `onClose` to `onRequestClose` for Android
    >
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20, backgroundColor: 'rgba(0, 0, 0, 0.5)' }}>
        <View style={{ backgroundColor: 'white', padding: 20, borderRadius: 10 }}>
          <Text>
            Select the current traffic congestion level (0 = No Traffic, 10 = Heavy Traffic):
          </Text>
          <Slider
            minimumValue={0}
            maximumValue={10}
            value={congestionLevel}
            onValueChange={handleCongestionChange} // Corrected event name
            step={1} // Optional: allows for integer values
          />
          <Text>Selected Level: {congestionLevel}</Text>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 20 }}>
            <Text onPress={onCancel} style={{ color: 'blue' }}>Cancel</Text>
            <Text onPress={() => onSubmit(congestionLevel)} style={{ color: 'blue' }}>Submit</Text>
          </View>
        </View>
      </View>
    </Modal>
  );
};

export default TrafficCongestionPopup;