import React, { Component } from "react";
import {
  Text,
  View,
  StyleSheet,
  ScrollView,
  Pressable,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import "@fontsource/poppins";
import AsyncStorage from "@react-native-async-storage/async-storage";

import BackButton from "@/components/Backbutton";
import Input from "../../components/Input";
import CustomButton from "../../components/ui/CustomButton";
import SegmentedButton from "../../components/SegmentedButton";

type RentingState = {
  services: string[];
  name: string;
  contact: string;
  location: string;
  vehicleType: "Jeep" | "Van" | "Jeep & Van";
};

export default class PostRental extends Component<{}, RentingState> {
  constructor(props: {}) {
    super(props);
    this.state = {
      services: [""],
      name: "",
      contact: "",
      location: "",
      vehicleType: "Jeep",
    };
  }

  addService = () => {
    this.setState((prevState) => ({
      services: [...prevState.services, ""],
    }));
  };

  updateService = (text: string, index: number) => {
    const updatedServices = [...this.state.services];
    updatedServices[index] = text;
    this.setState({ services: updatedServices });
  };

  removeService = (index: number) => {
    const updatedServices = [...this.state.services];
    updatedServices.splice(index, 1);
    this.setState({ services: updatedServices });
  };

  saveRental = async () => {
    const { name, contact, location, services, vehicleType } = this.state;
    const newRental = { name, contact, location, services, vehicleType };

    try {
      const existing = await AsyncStorage.getItem("rentals");
      const rentals = existing ? JSON.parse(existing) : [];

      rentals.push(newRental);

      await AsyncStorage.setItem("rentals", JSON.stringify(rentals));

      router.push("/(driver)/Renting");
    } catch (e) {
      console.error("Error saving rental:", e);
    }
  };

  render() {
    return (
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        keyboardVerticalOffset={Platform.OS === "ios" ? 60 : 0}
      >
        <View style={rentStyles.container}>
          <BackButton />
          <Text style={rentStyles.header}>Jeepney/Van Rental</Text>
          <Text style={{ marginLeft: 25, color: "#595959" }}>
            Post your rental info.
          </Text>

          <ScrollView
            contentContainerStyle={{
              marginLeft: 25,
              marginTop: 20,
              paddingBottom: 70,
            }}
            keyboardShouldPersistTaps="handled"
          >
            <Input
              label="Name"
              placeholder="E.g Kevin's Rental"
              keyboardType="default"
              containerStyle={{ width: "90%" }}
              value={this.state.name}
              onChangeText={(text) => this.setState({ name: text })}
            />

            <Text style={rentStyles.label}>Types of Vehicles</Text>
            <SegmentedButton
              value={this.state.vehicleType}
              onChange={(val) => this.setState({ vehicleType: val })}
            />

            <Input
              label="Contact Number"
              placeholder="E.g 09XX-XXX-XXXX"
              keyboardType="numeric"
              containerStyle={{ width: "90%" }}
              value={this.state.contact}
              onChangeText={(text) => this.setState({ contact: text })}
            />

            <Input
              label="Location"
              placeholder="E.g To Vigan"
              keyboardType="default"
              containerStyle={{ width: "90%" }}
              value={this.state.location}
              onChangeText={(text) => this.setState({ location: text })}
            />

            {this.state.services.map((service, index) => (
              <View style={rentStyles.inputWrapper} key={index}>
                <Input
                  label="Services Offered"
                  placeholder="E.g Private Transport"
                  keyboardType="default"
                  containerStyle={{ width: "100%" }}
                  value={service}
                  onChangeText={(text) => this.updateService(text, index)}
                />

                {index > 0 && (
                  <Pressable
                    style={rentStyles.deleteInside}
                    onPress={() => this.removeService(index)}
                  >
                    <Ionicons name="close-circle" size={22} color="#FF4D4F" />
                  </Pressable>
                )}
              </View>
            ))}

            <Pressable style={rentStyles.addButton} onPress={this.addService}>
              <Ionicons name="add-circle" size={32} color="#0D99FF" />
            </Pressable>

            <CustomButton
              title="Done"
              onPress={this.saveRental}
              style={rentStyles.custButton}
            />
          </ScrollView>
        </View>
      </KeyboardAvoidingView>
    );
  }
}

const rentStyles = StyleSheet.create({
  header: {
    fontWeight: "bold",
    fontSize: 25,
    marginLeft: 20,
    marginTop: 10,
    color: "#073051",
    fontFamily: "Poppins",
  },
  container: {
    flex: 1,
  },

  addButton: {
    alignItems: "center",
    marginTop: 8,
    marginRight: 2,
  },
  inputWrapper: {
    width: "90%",
    position: "relative",
    marginBottom: 8,
  },
  deleteInside: {
    position: "absolute",
    right: 10,
    top: 55,
    zIndex: 1,
  },
  custButton: {
    marginLeft: 20,
  },
  label: {
    fontSize: 16,
    marginBottom: 6,
    fontWeight: "bold",
    color: "#073051",
    fontFamily: "Poppins",
    marginTop: 10,
  },
});
