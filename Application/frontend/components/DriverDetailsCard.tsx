import React from "react";
import { View, Text, StyleSheet } from "react-native";

export default function DriverInfoCard({
  contactNumber,
  plateNumber,
  operatorName,
  operatorAddress,
  eligible,
}) {
  return (
    <View style={styles.card}>
      <Text style={styles.row}>
        <Text style={styles.label}>Contact Number: </Text>
        {contactNumber}
      </Text>
      <Text style={styles.row}>
        <Text style={styles.label}>Plate Number: </Text>
        {plateNumber}
      </Text>
      <Text style={styles.row}>
        <Text style={styles.label}>Operator’s Name/Company: </Text>
        {operatorName}
      </Text>
      <Text style={styles.row}>
        <Text style={styles.label}>Operator’s Address: </Text>
        {operatorAddress}
      </Text>
      <Text style={styles.row}>
        <Text style={styles.label}>Eligible for Renting: </Text>
        {eligible}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderWidth: 1,
    borderColor: "#CBCBCB",
    borderRadius: 12,
    padding: 15,
    width: "90%",
    marginVertical: 10,
    backgroundColor: "#fff",
    paddingVertical: 30,
  },
  row: {
    marginBottom: 10,
    fontSize: 16,
    color: "#073051",
  },
  label: {
    fontWeight: "bold",
  },
});
