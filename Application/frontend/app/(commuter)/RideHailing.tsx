import React, { Component } from "react";
import { Text, View, StyleSheet } from "react-native";
import "@fontsource/poppins";
import BackButton from "@/components/Backbutton";

export default class RideHailing extends Component {
  render() {
    return (
      <View style={rentStyles.container}>
        <BackButton />
        <Text style={rentStyles.header}> TricyCall </Text>
        <Text
          style={{ marginLeft: 25, color: "#595959", fontFamily: "Poppins" }}
        >
          Book your tricycle—fast, safe, local.
        </Text>
      </View>
    );
  }
}

const rentStyles = StyleSheet.create({
  header: {
    fontWeight: "bold",
    alignItems: "flex-start",
    fontSize: 25,
    marginLeft: 20,
    marginTop: 10,
    color: "#073051",
  },
  container: {},
});
