import React, { Component } from "react";
import { Text, View, StyleSheet, ScrollView } from "react-native";
import "@fontsource/poppins";
import BackButton from "@/components/Backbutton";
import ViewMatrix from "@/components/ViewMatrix";

export default class Renting extends Component {
  render() {
    return (
      <View style={rentStyles.container}>
        <BackButton />
        <Text style={rentStyles.header}> Fare Matrix </Text>
        <Text style={{ marginLeft: 25, color: "#595959", marginBottom: 20 }}>
          Get updated with the latest fare matrix in you area!
        </Text>
        <ScrollView
          contentContainerStyle={{
            paddingBottom: 200,
          }}
        >
          <ViewMatrix label="PUB (City)" />
          <ViewMatrix label="PUB (Provincial)" />
          <ViewMatrix label="PUJ" />
          <ViewMatrix label="Tricyle" />
          <ViewMatrix label="E-Tricycle" />
        </ScrollView>
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
    fontFamily: "Poppins",
  },
  container: {},
});
