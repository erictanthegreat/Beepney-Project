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
import ContactIcon from "@/assets/images/contact.svg";
import LocationIcon from "@/assets/images/location.svg";
import VehicleIcon from "@/assets/images/vehicle type.svg";
import CRUD from "@/assets/images/crud.svg";
import Messages from "../../assets/images/receive.svg";
import { supabase } from "@/scripts/supabase";

type Rental = {
  id: string;
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

export default class Renting extends Component<{}, DriverRentingState> {
  state: DriverRentingState = {
    rentals: [],
    openDropdownIndex: null,
  };

  toggleDropdown = (index: number) => {
    this.setState((prev) => ({
      openDropdownIndex: prev.openDropdownIndex === index ? null : index,
    }));
  };

  async fetchRentals() {
    try {
      // Get the current logged-in user
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError || !user) {
        console.error("No logged-in user found:", userError?.message);
        return;
      }

      // Only fetch rentals created by this user
      const { data, error } = await supabase
        .from("rental")
        .select("*")
        .eq("user_id", user.id) // ✅ Only rentals made by this user
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Error fetching rentals:", error.message);
        return;
      }

      const rentals: Rental[] = data.map((row: any) => ({
        id: row.id,
        name: row.station_name,
        contact: row.contact_number,
        location: row.location,
        services: Array.isArray(row.service_offered)
          ? row.service_offered
          : row.service_offered
            ? row.service_offered.split(",").map((s: string) => s.trim())
            : [],
        vehicleType: row.types_of_vehicles,
      }));

      this.setState({ rentals });
    } catch (e) {
      console.error("Unexpected error fetching rentals", e);
    }
  }

  componentDidMount() {
    this.fetchRentals();
  }

  deleteRental = async (index: number) => {
    const rentals = this.state.rentals[index];
    try {
      const { error } = await supabase
        .from("rental")
        .delete()
        .eq("station_name", rentals.name)
        .eq("contact_number", rentals.contact);

      if (error) {
        console.error("Error deleting rentals:", error.message);
        return;
      }

      const newRentals = [...this.state.rentals];
      newRentals.splice(index, 1);
      this.setState({ rentals: newRentals, openDropdownIndex: null });
    } catch (e) {
      console.error("Unexpected error fetching rentals", e);
    }
  };

  updatedRental = async (index: number, updatedRental: Rental) => {
    const rentals = this.state.rentals[index];
    try {
      const { error } = await supabase
        .from("rental")
        .update({
          station_name: updatedRental.name,
          contact_number: updatedRental.contact,
          location: updatedRental.location,
          types_of_vehicle: updatedRental.vehicleType,
          service_offered: updatedRental.services,
        })
        .eq("station_name", rentals.name)
        .eq("contact_number", rentals.contact);

      if (error) {
        console.error("Error updating rentals:", error.message);
        return;
      }
      const newRentals = [...this.state.rentals];
      newRentals[index] = updatedRental;
      this.setState({ rentals: newRentals });
      this.setState({ openDropdownIndex: null });
    } catch (e) {
      console.error("Unexpected error updating rental:", e);
    }
  };

  openInbox = () => {
    router.push("/(feat)/Inbox");
  };

  render() {
    const { rentals, openDropdownIndex } = this.state;
    const isEmpty = rentals.length === 0;

    return (
      <View style={{ flex: 1 }}>
        {/* Header & Post Rental Button */}
        <View>
          <View style={rentStyles.topButtons}>
            <BackButton />
            <TouchableOpacity onPress={this.openInbox}>
              <Messages style={rentStyles.icon} />
            </TouchableOpacity>
          </View>

          <Text style={rentStyles.header}>Jeepney/Van Rental</Text>
          <Text style={rentStyles.subheader}>
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

                <View style={rentStyles.crud}>
                  <TouchableOpacity onPress={() => this.toggleDropdown(index)}>
                    <CRUD />
                  </TouchableOpacity>

                  {openDropdownIndex === index && (
                    <View style={rentStyles.dropdown}>
                      <TouchableOpacity
                        style={rentStyles.dropdownItem}
                        onPress={() =>
                          router.push({
                            pathname: "/(feat)/PostRental",
                            params: { id: item.id },
                          })
                        }
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
  topButtons: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  crud: {
    alignItems: "flex-end",
    position: "relative",
  },
  dropdown: {
    position: "absolute",
    bottom: 30,
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
  subheader: {
    marginLeft: 25,
    color: "#595959",
    fontFamily: "Poppins",
  },
  icon: {
    marginTop: 58,
    marginRight: 20,
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
    maxWidth: "50%",
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
