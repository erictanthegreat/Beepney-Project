import React from "react";
import { TouchableOpacity, Text, StyleSheet, ViewStyle } from "react-native";

type CustomButtonProps = {
  title: string;
  onPress: () => void;
  style?: ViewStyle;
  backgroundColor?: string;
};

export default function CustomButton({
  title,
  onPress,
  style,
  backgroundColor = "#208FCB",
}: CustomButtonProps) {
  return (
    <TouchableOpacity
      style={[styles.button, { backgroundColor }, style]}
      onPress={onPress}
      activeOpacity={0.5}
    >
      <Text style={styles.text}>{title}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    paddingVertical: 12,
    paddingHorizontal: 32,
    borderRadius: 15,
    marginTop: 40,
    width: "80%",
    alignItems: "center",
  },
  text: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 16,
  },
});
