import React, { Component } from "react";
import {
  Text,
  View,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from "react-native";
import "@fontsource/poppins";
import BackButton from "@/components/Backbutton";
import PostIcon from "../../assets/images/add.svg";
import { Button } from "@react-navigation/elements";
import { router } from "expo-router";

export default class DriverRenting extends Component {
  render() {
    return (
      <View style={{ flex: 1 }}>
        <View>
          <BackButton />
          <Text style={rentStyles.header}> Jeepney/Van Rental </Text>
          <Text
            style={{ marginLeft: 25, color: "#595959", fontFamily: "Poppins" }}
          >
            Book Your Barkada Trip with Beepney
          </Text>
          <TouchableOpacity
            onPress={() => router.push("/(feat)/PostRental")}
            style={rentStyles.Button}
          >
            <Text style={rentStyles.postHeader}>Post Rental Info</Text>
            <PostIcon />
          </TouchableOpacity>
        </View>

        <ScrollView
          contentContainerStyle={{
            marginLeft: 25,
            marginTop: 20,
            paddingBottom: 100,
          }}
        >
          <Text style={rentStyles.subHeader}>Available for Renting</Text>
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
  },
  Button: {
    borderWidth: 1.5,
    flexDirection: "row",
    marginTop: 20,
    marginLeft: 20,
    borderRadius: 15,
    height: 40,
    alignItems: "center",
    maxWidth: "47%",
    borderColor: "#073051",
  },
  postHeader: {
    fontWeight: "bold",
    fontSize: 20,
    marginLeft: 10,
    marginRight: 5,
    fontFamily: "Poppins",
  },
  subHeader: {
    color: "#073051",
    fontWeight: "bold",
    fontSize: 17,
  },
});
