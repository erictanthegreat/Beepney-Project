import React, { useState } from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";

import SoloIcon from "../assets/images/solo.svg";
import GroupIcon from "../assets/images/group.svg";

interface RideSelectorProps {
  onSelect?: (ride: "solo" | "group") => void;
}

export default function RideSelector({ onSelect }: RideSelectorProps) {
  const [selectedRide, setSelectedRide] = useState<"solo" | "group" | null>(
    null
  );

  const handleSelect = (ride: "solo" | "group") => {
    setSelectedRide(ride);
    onSelect?.(ride);
  };

  return (
    <View style={styles.container}>
      {["solo", "group"].map((ride) => {
        const isSelected = selectedRide === ride;
        const Icon = ride === "solo" ? SoloIcon : GroupIcon;

        return (
          <TouchableOpacity
            key={ride}
            style={[styles.rideButton, isSelected && styles.selectedButton]}
            onPress={() => handleSelect(ride as "solo" | "group")}
          >
            <Icon
              width={50}
              height={50}
              fill={isSelected ? "#0D99FF" : "#CBCBCB"}
            />
            <Text style={[styles.text, isSelected && { color: "#0D99FF" }]}>
              {ride.charAt(0).toUpperCase() + ride.slice(1)}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    gap: 40,
    justifyContent: "flex-start",
    marginTop: 10,
  },
  rideButton: {
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#CBCBCB",
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 15,
  },
  selectedButton: {
    borderColor: "#0D99FF",
  },
  text: {
    color: "#CBCBCB",
    marginTop: 5,
  },
});
