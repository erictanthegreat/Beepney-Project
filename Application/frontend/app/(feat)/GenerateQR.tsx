import React, { Component } from "react";
import { Text, View, StyleSheet, TouchableOpacity } from "react-native";
import "@fontsource/poppins";
import BackButton from "@/components/Backbutton";
import GeneratePaymentIcon from "../../assets/images/payment.svg";
import GenerateProfIcon from "../../assets/images/gen prof.svg";
import { router } from "expo-router";

export default function GenerateQr() {
  return (
    <View>
      <BackButton />
      <Text style={genStyles.header}> Generate QR Code </Text>
      <Text style={genStyles.subheader}>
        Generate a QR Code to receive fare payments or view {"\n"}driver
        information.
      </Text>

      <View style={genStyles.container}>
        <TouchableOpacity
          style={genStyles.iconButton}
          onPress={() => router.push("/(result)/Payment")}
        >
          <GeneratePaymentIcon />
          <Text style={genStyles.genHeader}>
            Receive Fare Payment via QR Code
          </Text>
          <Text style={genStyles.genSub}>
            Show any of this code {"\n"} to the commuters to receive {"\n"}
            fare payments
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={genStyles.iconButton}
          onPress={() => router.push("/(result)/DriverQR")}
        >
          <GenerateProfIcon />
          <Text style={genStyles.genHeader}>Generate Driver Details</Text>
          <Text style={genStyles.genSub}>
            Show these code {"\n"} to the commuters to view {"\n"}your profile
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const genStyles = StyleSheet.create({
  container: {
    flexDirection: "row",
    gap: 10,
    marginTop: 40,
    marginLeft: 20,
  },
  genHeader: {
    fontWeight: "bold",
    textAlign: "center",
    paddingTop: 10,
    color: "#1E86DA",
  },
  genSub: {
    textAlign: "center",
    paddingTop: 5,
    color: "rgba(0, 0, 0, 0.56)",
    fontSize: 11,
  },
  header: {
    fontWeight: "bold",
    alignItems: "flex-start",
    fontSize: 25,
    marginLeft: 20,
    marginTop: 10,
    color: "#073051",
    fontFamily: "Poppins",
  },
  subheader: {
    marginLeft: 25,
    color: "#595959",
  },
  iconButton: {
    paddingVertical: 23,
    paddingHorizontal: 10,
    borderRadius: 20,
    alignItems: "center",
    backgroundColor: "#fff",
    maxWidth: "45%",
    elevation: 7,
  },
});
