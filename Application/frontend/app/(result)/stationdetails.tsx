import React from "react";
import { Text, View, StyleSheet, ScrollView } from "react-native";
import "@fontsource/poppins";
import BackButton from "@/components/Backbutton";
import StationDetailsCard from "@/components/ViewStationCard";
import ViewStationTable from "@/components/ViewStationTable";

export default function StationDetails() {
  const vehicleData = [
    { image: "Jeep", destination: "Manila", count: 5 },
    { image: "Jeep", destination: "Quezon City", count: 2 },
    { image: "Van", destination: "Pasig", count: 7 },
    { image: "Jeep", destination: "Taguig", count: 3 },
    { image: "Jeep", destination: "Makati", count: 4 },
  ];

  return (
    <View style={{ flex: 1, backgroundColor: "white" }}>
      {/* Static header */}
      <BackButton />
      <Text style={stationStyles.header}>East Bound Van {"\n"} Terminal</Text>

      {/* Scrollable content */}
      <ScrollView contentContainerStyle={{ paddingBottom: 20 }}>
        <View style={stationStyles.container}>
          <StationDetailsCard />
        </View>

        <Text style={stationStyles.subheader}>
          Destinations & Current Available Vehicles
        </Text>

        <View>
          <ViewStationTable data={vehicleData} />
        </View>
      </ScrollView>
    </View>
  );
}

const stationStyles = StyleSheet.create({
  header: {
    fontWeight: "bold",
    fontSize: 25,
    marginLeft: 20,
    marginTop: 10,
    color: "#073051",
    fontFamily: "Poppins",
    marginBottom: 20,
  },
  container: {
    alignItems: "center",
  },
  subheader: {
    color: "#073051",
    fontSize: 17,
    margin: 20,
    fontWeight: "bold",
  },
});
