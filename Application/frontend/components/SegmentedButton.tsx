import React from "react";
import { View, TouchableOpacity, StyleSheet } from "react-native";

import JeepIcon from "@/assets/images/jeep.svg";
import VanIcon from "@/assets/images/bus.svg";
import BothIcon from "@/assets/images/both.svg";

export type VehicleType = "Jeep" | "Van" | "Jeep & Van";

type Props = {
  value: VehicleType;
  onChange: (value: VehicleType) => void;
};

export default function VehicleSegmentedButton({ value, onChange }: Props) {
  const options: { value: VehicleType; icon: React.ReactNode }[] = [
    { value: "Jeep", icon: <JeepIcon width={28} height={28} /> },
    { value: "Van", icon: <VanIcon width={28} height={28} /> },
    { value: "Jeep & Van", icon: <BothIcon width={50} height={40} /> },
  ];

  return (
    <View style={styles.container}>
      {options.map((option) => (
        <TouchableOpacity
          key={option.value}
          style={[
            styles.button,
            value === option.value && styles.selectedButton,
          ]}
          onPress={() => onChange(option.value)}
        >
          {option.icon}
        </TouchableOpacity>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    borderWidth: 1,
    borderColor: "#CBCBCB",
    borderRadius: 12,
    overflow: "hidden",
    marginVertical: 10,
    width: "80%",
  },
  button: {
    paddingVertical: 5,
    paddingHorizontal: 15,
    flex: 1,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
  },
  selectedButton: {
    backgroundColor: "#1E86DA",
  },
});
