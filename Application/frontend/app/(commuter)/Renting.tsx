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
import EmptyStateIcon from "../../assets/images/empty.svg";

export default class Renting extends Component {
  state = {
    rentals: [],
  };

  render() {
    const { rentals } = this.state;
    const isEmpty = rentals.length === 0;

    return (
      <View style={{ flex: 1 }}>
        <View>
          <BackButton />
          <Text style={styles.header}> Jeepney/Van Rental </Text>
          <Text
            style={{ marginLeft: 25, color: "#595959", fontFamily: "Poppins" }}
          >
            Book Your Barkada Trip with Beepney
          </Text>
        </View>

        {isEmpty ? (
          // Empty State
          <View style={styles.emptyContainer}>
            <EmptyStateIcon />
            <Text style={styles.emptyText}>
              Whoops......Looks like there's {"\n"}nothing here.
            </Text>
          </View>
        ) : (
          // Non-empty rental list
          <ScrollView
            contentContainerStyle={{
              marginLeft: 25,
              marginTop: 20,
              paddingBottom: 100,
            }}
          >
            <Text style={styles.subHeader}>Available for Renting</Text>
            {rentals.map((item, index) => (
              <Text key={index}>{item.title}</Text>
            ))}
          </ScrollView>
        )}
      </View>
    );
  }
}

const styles = StyleSheet.create({
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
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    marginBottom: 100,
    alignItems: "center",
  },
  emptyText: {
    textAlign: "center",
    fontSize: 15,
    marginTop: 15,
  },
});
