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
  const options: { value: VehicleType; Icon: any }[] = [
    { value: "Jeep", Icon: JeepIcon },
    { value: "Van", Icon: VanIcon },
    { value: "Jeep & Van", Icon: BothIcon },
  ];

  return (
    <View style={styles.container}>
      {options.map((option) => {
        const isSelected = value === option.value;
        const iconColor = isSelected ? "#fff" : "#CBCBCB";
        const OptionIcon = option.Icon;

        return (
          <TouchableOpacity
            key={option.value}
            style={[styles.button, isSelected && styles.selectedButton]}
            onPress={() => onChange(option.value)}
          >
            <OptionIcon
              width={option.value === "Jeep & Van" ? 50 : 28}
              height={option.value === "Jeep & Van" ? 40 : 28}
              color={iconColor}
            />
          </TouchableOpacity>
        );
      })}
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
