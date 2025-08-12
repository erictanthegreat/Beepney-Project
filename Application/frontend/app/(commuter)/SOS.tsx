import React, { Component } from "react";
import { Text, View, StyleSheet, ScrollView } from "react-native";
import "@fontsource/poppins";
import BackButton from "@/components/Backbutton";
import HotlineCard from "@/components/HotlineCard";

export default class SOS extends Component {
  render() {
    return (
      <View style={{ flex: 1 }}>
        {/* Static Header */}
        <View>
          <BackButton />
          <Text style={soStyles.header}> SOS Call/Report </Text>
          <Text style={soStyles.subheader}>
            Make your commuter experience safe.
          </Text>
        </View>

        {/* Scrollable Content */}
        <ScrollView contentContainerStyle={{ paddingBottom: 100 }}>
          <Text style={soStyles.label}>Ambulance</Text>
          <HotlineCard
            name="Ambulance Hotline 1"
            type="NICC"
            number="09XX-XXX-XXX"
          />
          <HotlineCard
            name="Ambulance Hotline 2"
            type="Test"
            number="09XX-XXX-XXX"
          />

          <Text style={soStyles.label}>Police Station</Text>
          <HotlineCard
            name="Police Hotline 1"
            type="NICC"
            number="09XX-XXX-XXX"
          />
          <HotlineCard
            name="Ambulance Hotline 1"
            type="NICC"
            number="09XX-XXX-XXX"
          />
          <Text style={soStyles.label}>LTFRB</Text>
          <HotlineCard
            name="Ambulance Hotline 1"
            type="NICC"
            number="09XX-XXX-XXX"
          />
          <HotlineCard
            name="Ambulance Hotline 1"
            type="NICC"
            number="09XX-XXX-XXX"
          />
        </ScrollView>
      </View>
    );
  }
}

const soStyles = StyleSheet.create({
  header: {
    fontWeight: "bold",
    alignItems: "flex-start",
    fontSize: 25,
    marginLeft: 20,
    marginTop: 10,
    color: "#073051",
  },
  label: {
    fontSize: 16,
    marginBottom: 6,
    color: "#073051",
    fontFamily: "Poppins",
    marginLeft: 25,
    marginTop: 10,
  },
  subheader: {
    marginLeft: 25,
    color: "#595959",
    fontFamily: "Poppins",
    marginBottom: 15,
  },
});
