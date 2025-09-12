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
import CRUD from "@/assets/images/crud.svg";

type Rental = {
  name: string;
  contact: string;
  location: string;
  services: string[];
  vehicleType: "jeep" | "van" | "both";
};

type DriverRentingState = {
  rentals: Rental[];
  openDropdownIndex: number | null;
};

export default class DriverRenting extends Component<{}, DriverRentingState> {
  state: DriverRentingState = {
    rentals: [],
    openDropdownIndex: null,
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

  // Toggle dropdown for CRUD
  toggleDropdown = (index: number) => {
    this.setState((prev) => ({
      openDropdownIndex: prev.openDropdownIndex === index ? null : index,
    }));
  };

  // Edit rental
  editRental = (index: number) => {
    const rentalToEdit = this.state.rentals[index];
    router.push({
      pathname: "/(feat)/postrental",
      params: {
        rentalIndex: index.toString(),
        rentalData: JSON.stringify(rentalToEdit),
      },
    });
    this.setState({ openDropdownIndex: null });
  };

  // Delete rental
  deleteRental = async (index: number) => {
    try {
      const newRentals = [...this.state.rentals];
      newRentals.splice(index, 1);
      this.setState({ rentals: newRentals, openDropdownIndex: null });
      await AsyncStorage.setItem("rentals", JSON.stringify(newRentals));
    } catch (e) {
      console.error("Error deleting rental:", e);
    }
  };

  updateRental = async (index: number, updatedRental: Rental) => {
    try {
      const newRentals = [...this.state.rentals];
      newRentals[index] = updatedRental;
      this.setState({ rentals: newRentals });
      await AsyncStorage.setItem("rentals", JSON.stringify(newRentals));
    } catch (e) {
      console.error("Error updating rental:", e);
    }
  };

  render() {
    const { rentals, openDropdownIndex } = this.state;
    const isEmpty = rentals.length === 0;

    return (
      <View style={{ flex: 1 }}>
        {/* Header & Post Rental Button */}
        <View>
          <BackButton />
          <Text style={rentStyles.header}>Jeepney/Van Rental</Text>
          <Text
            style={{ marginLeft: 25, color: "#595959", fontFamily: "Poppins" }}
          >
            Book Your Barkada Trip with Beepney
          </Text>
          <TouchableOpacity
            onPress={() => router.push("/(feat)/postrental")}
            style={rentStyles.Button}
          >
            <Text style={rentStyles.postHeader}>Post Rental Info</Text>
            <PostIcon />
          </TouchableOpacity>
        </View>

        {/* Empty State */}
        {isEmpty ? (
          <View style={rentStyles.emptyContainer}>
            <EmptyStateIcon />
            <Text style={rentStyles.emptyText}>
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
            <Text style={rentStyles.subHeader}>Available for Renting</Text>
            {rentals.map((item, index) => (
              <View key={index} style={rentStyles.rentalCard}>
                <Text style={rentStyles.rentalName}>{item.name}</Text>
                <Text style={rentStyles.label}>
                  <ContactIcon width={17} height={17} /> Contact No.
                  <Text style={rentStyles.content}> {item.contact}</Text>
                </Text>
                <Text style={rentStyles.label}>
                  <VehicleIcon width={17} height={17} /> Types of Vehicle(s):
                  <Text style={rentStyles.content}> {item.vehicleType}</Text>
                </Text>
                <Text style={rentStyles.label}>
                  <LocationIcon width={17} height={17} /> Location:
                  <Text style={rentStyles.content}> {item.location}</Text>
                </Text>

                <Text style={rentStyles.label}>Services Offered: </Text>
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
                          rentStyles.content,
                          { marginLeft: 6, fontSize: 18 },
                        ]}
                      >
                        {service}
                      </Text>
                    </View>
                  ))
                ) : (
                  <Text style={[rentStyles.content, { marginLeft: 15 }]}>
                    No services listed
                  </Text>
                )}

                {/* CRUD Dropdown */}
                <View style={rentStyles.crud}>
                  <TouchableOpacity onPress={() => this.toggleDropdown(index)}>
                    <CRUD />
                  </TouchableOpacity>

                  {openDropdownIndex === index && (
                    <View style={rentStyles.dropdown}>
                      <TouchableOpacity
                        style={rentStyles.dropdownItem}
                        onPress={() => this.editRental(index)}
                      >
                        <Text style={rentStyles.dropdownText}>Edit</Text>
                      </TouchableOpacity>
                      <TouchableOpacity
                        style={rentStyles.dropdownItem}
                        onPress={() => this.deleteRental(index)}
                      >
                        <Text
                          style={[rentStyles.dropdownText, { color: "red" }]}
                        >
                          Delete
                        </Text>
                      </TouchableOpacity>
                    </View>
                  )}
                </View>
              </View>
            ))}
          </ScrollView>
        )}
      </View>
    );
  }
}

const rentStyles = StyleSheet.create({
  crud: { alignItems: "flex-end", position: "relative" },
  dropdown: {
    position: "absolute",
    bottom: 30, // position above the button (button height + some spacing)
    right: 0,
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 5,
    width: 100,
    zIndex: 10,
    elevation: 5,
  },
  dropdownItem: {
    padding: 10,
  },
  dropdownText: {
    fontSize: 16,
    color: "#073051",
  },
  header: {
    fontWeight: "bold",
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
    marginBottom: 10,
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
    backgroundColor: "white",
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
