import React, { Component } from "react";
import { Text, View, StyleSheet } from "react-native";
import "@fontsource/poppins";
import QRCode from "react-native-qrcode-svg";
import BackButton from "@/components/Backbutton";

export default function DriverDetails() {
  return (
    <View style={statStyles.container}>
      <View style={statStyles.topBar}>
        <BackButton />
        <Text style={statStyles.title}>Driver's Details QR</Text>
        <View style={{ width: 50 }} />
      </View>
      <View style={statStyles.qrContainer}>
        <QRCode value="http://facebook.com" size={200} color={"#1E86DA"} />
        <Text style={statStyles.text}>
          Scan the QR to view {"\n"}Driver's Details
        </Text>
      </View>
    </View>
  );
}

const statStyles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },

  topBar: {
    marginTop: 10,
    paddingHorizontal: 13,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  title: {
    fontWeight: "bold",
    fontSize: 25,
    marginLeft: 1,
    color: "#073051",
    paddingTop: 50,
  },
  qrContainer: {
    top: 150,
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 20,
    paddingVertical: 30,
    width: "80%",
    marginLeft: 35,
    borderWidth: 1,
    borderColor: "#CBCBCB",
    backgroundColor: "#fff",
    elevation: 3,
    borderBottomWidth: 3,
  },
  text: {
    fontSize: 17,
    fontFamily: "Poppins",
    marginTop: 30,
    textAlign: "center",
    color: "#073051",
  },
});
