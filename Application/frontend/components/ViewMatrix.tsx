import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import React from "react";

type ViewMatrixProps = {
  label: string;
};

export default function ViewMatrix({ label }: ViewMatrixProps) {
  return (
    <View style={matrixStyles.container}>
      <Text style={matrixStyles.label}>{label}</Text>
      <TouchableOpacity style={matrixStyles.file}></TouchableOpacity>
    </View>
  );
}

const matrixStyles = StyleSheet.create({
  container: {
    marginTop: 5,
  },
  file: {
    flexDirection: "row",
    alignItems: "flex-start",
    backgroundColor: "#fff",
    padding: 70,
    width: "90%",
    marginLeft: 20,
    borderRadius: 15,
    borderWidth: 1,
    borderColor: "#e0e0e0",
    marginBottom: 10,
  },
  label: {
    fontSize: 18,
    color: "#073051",
    marginLeft: 20,
    marginBottom: 10,
    fontWeight: "bold",
  },
});
