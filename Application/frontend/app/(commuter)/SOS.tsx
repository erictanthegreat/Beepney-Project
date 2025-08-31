import React, { Component } from "react";
import { Text, View, StyleSheet, ScrollView } from "react-native";
import "@fontsource/poppins";
import BackButton from "@/components/Backbutton";
import HotlineCard from "@/components/HotlineCard";

export default function SOS() {
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
          type="BFP Naga City"
          number="0908-626-2396"
          address="J. Miranda Ave., Zone 5, Brgy. Concepcion Pequeña, Naga City, Camarines Sur"
        />
        <HotlineCard
          name="Ambulance Hotline 2"
          address="Carnation St., Zone 4, Brgy. Triangulo, Naga City, Camarines Sur"
          type="Chin Po Tong Volunteer Fire Brigade"
          number="09XX-XXX-XXX"
        />

        <Text style={soStyles.label}>Police Station</Text>
        <HotlineCard
          name="Police Hotline 1"
          type="Station 1"
          number="09XX-XXX-XXX"
          address="General Luna St., Zone 1, Brgy. Sta. Cruz, Naga City, Camarines Sur"
        />
        <HotlineCard
          name="Polic Hotline 2"
          type="Station 2"
          number="09XX-XXX-XXX"
          address="Panganiban Drive cor. Roxas Ave., Zone 6, Concepcion Pequena, Naga City, Camarines Sur"
        />
        <Text style={soStyles.label}>LTFRB</Text>
        <HotlineCard
          name="LTFRB Hotline 1"
          type="Naga City"
          number="09XX-XXX-XXX"
          address={""}
        />
        <HotlineCard
          name="Ambulance Hotline 1"
          type="NICC"
          number="09XX-XXX-XXX"
          address={""}
        />
      </ScrollView>
    </View>
  );
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
