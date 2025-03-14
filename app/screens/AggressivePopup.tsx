import React from "react";
import { Modal, View, Text, StyleSheet, TouchableOpacity } from "react-native";

interface AggressivePopupProps {
  visible: boolean; // Controls whether the popup is visible
  onClose: () => void; // Callback to close the popup
  predictedClass: string; // The predicted class (e.g., "Known_leopard")
  similarityScore: number; // The similarity score (e.g., 0.9346)
}

const AggressivePopup: React.FC<AggressivePopupProps> = ({
  visible,
  onClose,
  predictedClass,
  similarityScore,
}) => {
  return (
    <Modal
      transparent={true}
      visible={visible}
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          {/* Popup Title */}
          <Text style={styles.modalTitle}>⚠️ Aggressive Animal Detected!</Text>

          {/* Popup Message */}
          <Text style={styles.modalText}>
            A {predictedClass.replace("Known_", "")} has been detected nearby.
          </Text>
          <Text style={styles.modalText}>
            Similarity Score: {(similarityScore * 100).toFixed(2)}%
          </Text>

          {/* Close Button */}
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <Text style={styles.closeButtonText}>Close</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

// Styles for the AggressivePopup component
const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.5)", // Semi-transparent background
  },
  modalContent: {
    width: "80%", // Width of the modal
    backgroundColor: "#fff", // White background
    borderRadius: 10, // Rounded corners
    padding: 20, // Inner padding
    alignItems: "center", // Center content horizontally
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#d32f2f", // Red color for warning
    marginBottom: 10, // Spacing below the title
  },
  modalText: {
    fontSize: 16,
    color: "#333", // Dark gray text
    marginBottom: 10, // Spacing below each text line
    textAlign: "center", // Center-align text
  },
  closeButton: {
    backgroundColor: "#d32f2f", // Red background for the button
    padding: 10, // Button padding
    borderRadius: 5, // Rounded corners for the button
    marginTop: 10, // Spacing above the button
  },
  closeButtonText: {
    color: "#fff", // White text
    fontSize: 16,
    fontWeight: "bold", // Bold text
  },
});

export default AggressivePopup;