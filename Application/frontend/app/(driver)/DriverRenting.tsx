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
import EmptyStateIcon from "../../assets/images/empty.svg";
import { router } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";
import ContactIcon from "@/assets/images/contact.svg";
import LocationIcon from "@/assets/images/location.svg";
import VehicleIcon from "@/assets/images/vehicle type.svg";

// ✅ Rental type
type Rental = {
  name: string;
  contact: string;
  location: string;
  services: string[];
  vehicleType: "jeep" | "van" | "both";
};

type DriverRentingState = {
  rentals: Rental[];
};

export default class DriverRenting extends Component<{}, DriverRentingState> {
  state: DriverRentingState = {
    rentals: [],
  };

  async componentDidMount() {
    try {
      const stored = await AsyncStorage.getItem("rentals");
      if (stored) {
        this.setState({ rentals: JSON.parse(stored) });
      }
    } catch (e) {
      console.error("Error loading rentals:", e);
    }
  }

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

          <TouchableOpacity
            onPress={() => router.push("/(feat)/PostRental")}
            style={styles.Button}
          >
            <Text style={styles.postHeader}>Post Rental Info</Text>
            <PostIcon />
          </TouchableOpacity>
        </View>

        {isEmpty ? (
          <View style={styles.emptyContainer}>
            <EmptyStateIcon />
            <Text style={styles.emptyText}>
              Whoops......Looks like there's {"\n"}nothing here.
            </Text>
          </View>
        ) : (
          <ScrollView
            contentContainerStyle={{
              marginLeft: 25,
              marginTop: 20,
              paddingBottom: 100,
            }}
          >
            <Text style={styles.subHeader}>Available for Renting</Text>
            {rentals.map((item, index) => (
              <View key={index} style={styles.rentalCard}>
                <Text style={styles.rentalName}>{item.name}</Text>
                <Text style={styles.label}>
                  <ContactIcon width={17} height={17} /> Contact No.
                  <Text style={styles.content}>{item.contact}</Text>
                </Text>
                <Text style={styles.label}>
                  <VehicleIcon width={17} height={17} /> Types of Vehicle(s):
                  <Text>{item.vehicleType}</Text>
                </Text>
                <Text style={styles.label}>
                  <LocationIcon width={17} height={17} /> Location:
                  <Text style={styles.content}> {item.location}</Text>
                </Text>

                <Text style={styles.label}>Services Offered:</Text>
                {item.services && item.services.length > 0 ? (
                  item.services.map((service, idx) => (
                    <View
                      key={idx}
                      style={{
                        flexDirection: "row",
                        alignItems: "flex-start",
                        marginLeft: 15,
                        marginTop: 2,
                      }}
                    >
                      <Text style={{ fontSize: 20, color: "#0D99FF" }}>
                        {"\u2022"}
                      </Text>
                      <Text
                        style={[
                          styles.content,
                          { marginLeft: 6, fontSize: 18 },
                        ]}
                      >
                        {service}
                      </Text>
                    </View>
                  ))
                ) : (
                  <Text style={[styles.content, { marginLeft: 15 }]}>
                    No services listed
                  </Text>
                )}
              </View>
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
  label: {
    color: "#073051",
    fontSize: 17,
    fontWeight: "bold",
    marginLeft: 5,
  },
  content: {
    color: "#0D99FF",
    fontFamily: "Poppins",
    fontWeight: "bold",
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
  rentalCard: {
    backgroundColor: "#f5f5f5",
    padding: 12,
    borderRadius: 10,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#CCCCCC",
    width: "90%",
  },
  rentalName: {
    fontWeight: "bold",
    fontSize: 18,
    marginBottom: 5,
  },
});
