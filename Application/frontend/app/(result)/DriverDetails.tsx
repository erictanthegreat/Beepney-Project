import React, { Component } from "react";
import { Text, View, StyleSheet } from "react-native";
import "@fontsource/poppins";
import BackButton from "@/components/Backbutton";
import ProfileIcon from "../../assets/images/prof.svg";
import DriverDetails from "@/components/DriverDetailsCard";
export default class DriverQr extends Component {
  render() {
    return (
      <View>
        <View style={rentStyles.container}>
          <BackButton />
          <Text style={rentStyles.header}> Driver Details </Text>
        </View>

        <View style={rentStyles.profile}>
          <ProfileIcon />
          <Text style={rentStyles.name}>Test C.</Text>

          <DriverDetails
            contactNumber={undefined}
            plateNumber={undefined}
            operatorName={undefined}
            operatorAddress={undefined}
            eligible={undefined}
          ></DriverDetails>
        </View>
      </View>
    );
  }
}
const rentStyles = StyleSheet.create({
  header: {
    fontWeight: "bold",
    fontSize: 25,
    marginTop: 50,
    marginLeft: 50,
    alignSelf: "center",
    color: "#073051",
    fontFamily: "Poppins",
    textAlign: "center",
  },
  container: {
    flexDirection: "row",
    alignItems: "center",
  },
  profile: {
    alignItems: "center",
    marginTop: 40,
  },
  name: {
    fontWeight: "bold",
    color: "#073051",
    fontSize: 25,
    paddingTop: 20,
    marginBottom: 20,
  },
});
