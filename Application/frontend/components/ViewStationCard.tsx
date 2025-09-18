import { View, Text, StyleSheet } from "react-native";
import React from "react";
import LocationIcon from "../assets/images/loc 3.svg";
import OpStartIcon from "../assets/images/opstart.svg";
import VehicleTypeIcon from "../assets/images/vehicletype.svg";

interface StationCardProps {
  location?: string;
  operation_time_am?: string;
  operation_time_pm?: string;
  vehicle_types?: string[];
}

export default function ViewStationCard({
  location,
  operation_time_am,
  operation_time_pm,
  vehicle_types,
}: StationCardProps) {
  return (
    <View style={cardStyle.container}>
      {/* Location */}
      <View style={cardStyle.subcontainer}>
        <LocationIcon width={20} height={20} />
        <Text style={cardStyle.label}>Location:</Text>
      </View>
      <Text style={cardStyle.sublabel}>
        {location || "No location available"}
      </Text>

      {/* Operation Time */}
      <View style={cardStyle.subcontainer}>
        <OpStartIcon />
        <Text style={cardStyle.label}>Operation Time (Start - End):</Text>
      </View>
      <Text style={cardStyle.sublabel}>
        {operation_time_am && operation_time_pm
          ? `${operation_time_am} - ${operation_time_pm}`
          : "No operation time set"}
      </Text>

      {/* Vehicle Types */}
      <View style={cardStyle.subcontainer}>
        <VehicleTypeIcon />
        <Text style={cardStyle.label}>Types of Vehicles:</Text>
      </View>
      <Text style={cardStyle.sublabel}>
        {vehicle_types && vehicle_types.length > 0
          ? vehicle_types.join(", ")
          : "No vehicles listed"}
      </Text>
    </View>
  );
}

const cardStyle = StyleSheet.create({
  container: {
    alignContent: "center",
    borderWidth: 1,
    width: "90%",
    borderRadius: 10,
    paddingVertical: 10,
    paddingBottom: 20,
    paddingHorizontal: 10,
    backgroundColor: "white",
    borderColor: "#CBCBCB",
  },
  label: {
    fontWeight: "bold",
    fontSize: 17,
    marginLeft: 10,
    color: "#073051",
  },
  subcontainer: {
    marginTop: 10,
    flexDirection: "row",
  },
  sublabel: {
    fontFamily: "Poppins",
    marginLeft: 30,
  },
});
