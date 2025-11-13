import React, { Component } from "react";
import { Text, View, StyleSheet } from "react-native";
import "@fontsource/poppins";
import BackButton from "@/components/Backbutton";
import EmptyStateIcon from "../../assets/images/empty.svg";

export default class RideHistory extends Component {
  state = {
    rides: [],
  };

  render() {
    const { rides } = this.state;
    const isEmpty = rides.length === 0;

    return (
      <View>
        <BackButton />
        <Text style={styles.header}> Ride History </Text>
        <Text style={{ marginLeft: 25, color: "#595959" }}>
          {isEmpty
            ? "Book Your Barkada Trip with Beepney."
            : "This is where your rides are saved for transparency."}
        </Text>

        {isEmpty ? (
          <View style={styles.emptyContainer}>
            <EmptyStateIcon />
            <Text style={styles.emptyText}>
              Whoops......Looks like there's {"\n"}nothing here.
            </Text>
          </View>
        ) : (
          <View style={{ margin: 20 }}>
            <Text>Ride #1 - Example</Text>
            <Text>Ride #2 - Example</Text>
          </View>
        )}
      </View>
    );
  }
}

const styles = StyleSheet.create({
  header: {
    fontWeight: "bold",
    fontSize: 25,
    marginLeft: 20,
    marginTop: 10,
    color: "#073051",
    fontFamily: "Poppins",
  },
  emptyContainer: {
    alignItems: "center",
    marginTop: 150,
  },
  emptyText: {
    textAlign: "center",
    fontSize: 15,
    marginTop: 15,
  },
});
