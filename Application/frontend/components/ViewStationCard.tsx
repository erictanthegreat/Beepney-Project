import { View, Text, StyleSheet } from "react-native";
import React from "react";
import LocationIcon from "../assets/images/loc 3.svg";
import OpStartIcon from "../assets/images/opstart.svg";
import VehicleTypeIcon from "../assets/images/vehicletype.svg";

//backend here

export default function ViewStationCard() {
  return (
    <View style={cardStyle.container}>
      <View style={cardStyle.subcontainer}>
        <LocationIcon width={20} height={20} />
        <Text style={cardStyle.label}>Location:</Text>
      </View>
      <Text style={cardStyle.sublabel}>
        Carnation St, Naga City, Camarines Sur
      </Text>

      <View style={cardStyle.subcontainer}>
        <OpStartIcon />
        <Text style={cardStyle.label}>Operation Time (Start - End): </Text>
      </View>
      <Text style={cardStyle.sublabel}>6:00 AM-9:00 PM</Text>

      <View style={cardStyle.subcontainer}>
        <VehicleTypeIcon />
        <Text style={cardStyle.label}>Types of Vehicles: </Text>
      </View>

      <Text style={cardStyle.sublabel}> Jeepneys & UVExpress</Text>
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
