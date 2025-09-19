// components/LabeledInput.tsx
import React from "react";
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TextInputProps,
  ViewStyle,
} from "react-native";

interface LabeledInputProps extends TextInputProps {
  label: string;
  containerStyle?: ViewStyle;
}

export default function LabeledInput({
  label,
  containerStyle,
  ...textInputProps
}: LabeledInputProps) {
  return (
    <View style={[styles.inputGroup, containerStyle]}>
      <Text style={styles.label}>{label}</Text>
      <TextInput
        style={styles.input}
        placeholderTextColor="#B6B6B6"
        {...textInputProps}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  inputGroup: {
    width: "43.3%",
    gap: 5,
  },
  label: {
    fontSize: 18,
    marginBottom: 6,
    fontWeight: "bold",
    color: "#073051",
    fontFamily: "Poppins",
    marginTop: 5,
  },
  input: {
    height: 45,
    borderColor: "#ccc",
    borderWidth: 1,
    borderRadius: 8,
    paddingLeft: 10,
    fontSize: 13,
    backgroundColor: "#fff",
    fontFamily: "Poppins",
  },
});
