import React, { Component } from "react";
import { Text, View, StyleSheet } from "react-native";
import "@fontsource/poppins";
import BackButton from "@/components/Backbutton";

export default class Renting extends Component {
  render() {
    return (
      
      <View style={rentStyles.container}>
        <BackButton />
        <Text style={rentStyles.header}> Stations </Text>
        
      </View>
    );
  }
}

const rentStyles = StyleSheet.create({
  header: {
    fontWeight: "bold",
    fontSize: 25,
    marginLeft: 75,
    color: "#073051",
    paddingTop: 50,

  },
  container: {
    flexDirection: "row",
    alignItems: "center",
  }
});
