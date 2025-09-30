import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import React from "react";
import OriginIcon from "@/assets/images/loc.svg";
import DestIcon from "@/assets/images/loc 2.svg";
import { router } from "expo-router";

export default function TricyCallCard({
  pickup,
  destination,
  farePrice,
  name,
  onAccept,
}) {
  return (
    <View style={styles.card}>
      <View style={styles.row2}>
        <Text style={styles.label}>
          {name} - ₱{farePrice}
        </Text>
        <TouchableOpacity style={styles.button} onPress={onAccept}>
          <Text style={styles.buttonText}>Accept</Text>
        </TouchableOpacity>
      </View>
      <View style={styles.row}>
        <OriginIcon />
        <Text style={styles.text1}> Pick up From</Text>
      </View>
      <Text style={styles.dest}>{pickup}</Text>
      <View style={styles.row}>
        <DestIcon />
        <Text style={styles.text2}> Destination</Text>
      </View>
      <Text style={styles.dest}>{destination}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  button: {
    backgroundColor: "#073051",
    borderRadius: 40,
    paddingVertical: 8,
    paddingHorizontal: 35,
    justifyContent: "center",
    alignItems: "center",
    marginLeft: 10,
  },
  buttonText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 14,
  },
  card: {
    borderWidth: 1,
    borderColor: "#CBCBCB",
    borderRadius: 15,
    padding: 15,
    width: "90%",
    marginVertical: 10,
    backgroundColor: "#fff",
    alignSelf: "center",
    marginTop: 10,
  },
  label: {
    fontWeight: "bold",
    fontSize: 17,
    color: "#073051",
  },
  row: {
    flexDirection: "row",
    marginTop: 10,
  },
  row2: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  text1: {
    color: "#1E86DA",
    fontSize: 15,
    fontWeight: "bold",
  },
  text2: {
    fontSize: 15,
    color: "#073051",
    fontWeight: "bold",
  },
  dest: {
    color: "#737F83",
    fontFamily: "Poppins",
  },
});
