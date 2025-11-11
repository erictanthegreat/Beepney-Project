import React, { Component } from "react";
import {
  Text,
  View,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  FlatList,
} from "react-native";
import * as Location from "expo-location";
import { router } from "expo-router";
import "@fontsource/poppins";
import BackButton from "@/components/Backbutton";
import DropDown from "@/components/ui/DropDown";
import FareIcon from "@/assets/images/fare.svg";
import OriginIcon from "@/assets/images/loc.svg";
import DestIcon from "@/assets/images/loc 2.svg";
import { supabase } from "scripts/supabase";

const MAPBOX_TOKEN =
  "pk.eyJ1IjoiZXJpY3RhbjMzMyIsImEiOiJjbWU4NTVsamswOWNuMmpwd29lZmx1OTNwIn0.1rtunFwJarUUNmyOKSdSYQ";

const baseFares: Record<string, number> = {
  Tricycle: 15,
  Taxi: 40,
  "E-Tricycles": 15,
  "PUJ Traditional": 13,
  "PUJ Modern": 15,
  "UVE Traditional": 25,
  "UVE Modern": 25,
  "PUB Provincional": 11,
  Pedicab: 10,
};

const discounts: Record<string, number> = {
  Regular: 0,
  Student: 20,
  "Senior Citizen": 20,
  "Solo Parent": 20,
  PWD: 20,
};

export default class FareCalculator extends Component {
  state = {
    vehicleType: "",
    openDropdown: null,
    origin: "",
    destination: "",
    originCoords: null,
    destinationCoords: null,
    originSuggestions: [],
    destinationSuggestions: [],
    IdType: "Regular",
    discountTypes: ["Regular"],
  };

  async componentDidMount() {
    await this.getCurrentLocation();
    await this.fetchDiscountTypes();
  }

  getCurrentLocation = async () => {
    try {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        console.log("Permission denied for location");
        return;
      }

      let location = await Location.getCurrentPositionAsync({});
      const { latitude, longitude } = location.coords;

      const res = await fetch(
        `https://api.mapbox.com/geocoding/v5/mapbox.places/${longitude},${latitude}.json?access_token=${MAPBOX_TOKEN}`
      );
      const data = await res.json();

      if (data.features.length > 0) {
        this.setState({
          origin: data.features[0].place_name,
          originCoords: [longitude, latitude],
        });
      }
    } catch (err) {
      console.error("Error getting location:", err);
    }
  };

  fetchSuggestions = async (query, type) => {
    if (!query.trim()) {
      this.setState({ [`${type}Suggestions`]: [] });
      return;
    }
    try {
      const res = await fetch(
        `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(
          query
        )}.json?autocomplete=true&limit=5&bbox=122.9184,13.3456,123.6199,14.3121&access_token=${MAPBOX_TOKEN}`
      );
      const data = await res.json();
      this.setState({
        [`${type}Suggestions`]: data.features || [],
      });
    } catch (err) {
      console.error("Mapbox fetch error:", err);
    }
  };

  fetchDiscountTypes = async () => {
    const allowedTypes = ["Student", "PWD", "Senior Citizen", "Solo Parent"];
    try {
      const { data, error } = await supabase
        .from("submissions")
        .select("submission_type");

      if (error) {
        console.error("Supabase fetch error:", error);
        return;
      }

      if (data) {
        const uniqueTypes = [
          ...new Set(data.map((item) => item.submission_type)),
        ];

        const filteredTypes = uniqueTypes.filter((t) =>
          allowedTypes.includes(t)
        );

        const finalTypes = ["Regular", ...filteredTypes];

        this.setState({ discountTypes: finalTypes });
      }
    } catch (err) {
      console.error("Error fetching discount types:", err);
    }
  };

  handleSelectSuggestion = (place, type) => {
    this.setState({
      [type]: place.place_name,
      [`${type}Coords`]: place.center,
      [`${type}Suggestions`]: [],
    });
  };

  handleToggle = (index, open) => {
    this.setState({
      openDropdown: open ? index : null,
    });
  };

  render() {
    return (
      <View style={{ flex: 1 }}>
        <View style={fareStyles.headerContainer}>
          <BackButton />
          <Text style={fareStyles.header}>Calculate Your Ride</Text>
          <Text style={fareStyles.subHeader}>
            Calculate your fare for a fair trip.
          </Text>
        </View>

        <FlatList
          data={[]}
          ListHeaderComponent={
            <>
              <View style={fareStyles.container}>
                <View style={fareStyles.cont}>
                  <OriginIcon style={fareStyles.icon} />
                  <TextInput
                    placeholder="Enter Origin"
                    value={this.state.origin}
                    onChangeText={(text) => {
                      this.setState({ origin: text });
                      this.fetchSuggestions(text, "origin");
                    }}
                    style={{ flex: 1 }}
                  />

                  <TouchableOpacity onPress={this.getCurrentLocation}>
                    <Text style={{ color: "#1E86DA", marginLeft: 8 }}>📍</Text>
                  </TouchableOpacity>
                </View>
                {this.state.originSuggestions.length > 0 && (
                  <FlatList
                    data={this.state.originSuggestions}
                    keyExtractor={(item) => item.id}
                    renderItem={({ item }) => (
                      <TouchableOpacity
                        style={fareStyles.suggestionItem}
                        onPress={() =>
                          this.handleSelectSuggestion(item, "origin")
                        }
                      >
                        <Text>{item.place_name}</Text>
                      </TouchableOpacity>
                    )}
                  />
                )}

                {/* DESTINATION INPUT */}
                <View style={fareStyles.cont}>
                  <DestIcon style={fareStyles.icon} />
                  <TextInput
                    placeholder="Enter Destination"
                    value={this.state.destination}
                    onChangeText={(text) => {
                      this.setState({ destination: text });
                      this.fetchSuggestions(text, "destination");
                    }}
                    style={{ flex: 1 }}
                  />
                </View>
                {this.state.destinationSuggestions.length > 0 && (
                  <FlatList
                    data={this.state.destinationSuggestions}
                    keyExtractor={(item) => item.id}
                    renderItem={({ item }) => (
                      <TouchableOpacity
                        style={fareStyles.suggestionItem}
                        onPress={() =>
                          this.handleSelectSuggestion(item, "destination")
                        }
                      >
                        <Text>{item.place_name}</Text>
                      </TouchableOpacity>
                    )}
                  />
                )}

                <DropDown
                  data={this.state.discountTypes}
                  onSelect={(value) => this.setState({ IdType: value })}
                  isOpen={this.state.openDropdown === 1}
                  onToggle={(open) => this.handleToggle(1, open)}
                  value={this.state.IdType}
                />

                <DropDown
                  data={[
                    "E-Tricycles",
                    "Tricycle",
                    "Taxi",
                    "Pedicab",
                    "PUJ Traditional",
                    "PUJ Modern",
                    "UV Express",
                    "PUB Traditional",
                    "PUB Modern",
                  ]}
                  onSelect={(value) => this.setState({ vehicleType: value })}
                  isOpen={this.state.openDropdown === 2}
                  onToggle={(open) => this.handleToggle(2, open)}
                  value={this.state.vehicleType || undefined}
                />

                <TouchableOpacity
                  style={fareStyles.button}
                  onPress={() =>
                    router.push({
                      pathname: "/(feat)/CalculatedFare",
                      params: {
                        origin: this.state.origin,
                        originCoords: JSON.stringify(this.state.originCoords),
                        destination: this.state.destination,
                        destinationCoords: JSON.stringify(
                          this.state.destinationCoords
                        ),
                        vehicleType: this.state.vehicleType,
                        baseFare: String(
                          baseFares[this.state.vehicleType] || 0
                        ),
                        discounts: String(discounts[this.state.IdType] || 0),
                      },
                    })
                  }
                >
                  <Text style={fareStyles.buttText}>Calculate Fare</Text>
                </TouchableOpacity>
              </View>

              <View
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  marginBottom: 30,
                }}
              >
                <Text style={fareStyles.fareText}>Detailed Fare Matrices</Text>
                <TouchableOpacity style={fareStyles.fareButton}>
                  <FareIcon
                    onPress={() => router.push("/FareMatrix")}
                    style={fareStyles.fareIcon}
                  />
                </TouchableOpacity>
              </View>

              <View style={{ flexDirection: "row", alignItems: "center" }}>
                <Text style={fareStyles.fareText}>Saved Calculated Fare</Text>
                <TouchableOpacity
                  onPress={() => router.push("/RideHistory")}
                  style={fareStyles.fareButton2}
                >
                  <Text style={fareStyles.fareButtonText}>See all</Text>
                </TouchableOpacity>
              </View>
            </>
          }
          renderItem={() => null}
          keyExtractor={(_, index) => index.toString()}
        />
      </View>
    );
  }
}

const fareStyles = StyleSheet.create({
  headerContainer: {
    paddingTop: 10,
    paddingBottom: 5,
    borderBottomColor: "#e0e0e0",
  },
  subHeader: {
    marginTop: 2,
    marginBottom: 5,
    color: "#595959",
    fontFamily: "Poppins",
    marginLeft: 25,
  },
  header: {
    fontWeight: "bold",
    fontSize: 25,
    marginLeft: 20,
    marginTop: 10,
    color: "#073051",
    fontFamily: "Poppins",
  },
  button: {
    backgroundColor: "#073051",
    paddingVertical: 14,
    paddingHorizontal: 32,
    borderRadius: 20,
    marginTop: 40,
    width: "100%",
    alignItems: "center",
  },
  buttText: {
    color: "white",
    fontSize: 16,
    fontFamily: "Poppins",
  },
  container: {
    backgroundColor: "#fff",
    padding: 20,
    margin: 20,
    borderRadius: 10,
    elevation: 2,
  },
  cont: {
    borderWidth: 1,
    borderRadius: 15,
    marginBottom: 10,
    height: 60,
    borderColor: "#073051",
    paddingHorizontal: 15,
    flexDirection: "row",
    alignItems: "center",
  },
  fareText: {
    fontWeight: "bold",
    fontSize: 20,
    color: "#073051",
    marginLeft: 20,
    fontFamily: "Poppins",
  },
  fareIcon: {
    width: 24,
    height: 24,
  },
  fareButton: {
    backgroundColor: "#FFFFFF",
    borderColor: "#CBCBCB",
    borderWidth: 1,
    paddingVertical: 10,
    paddingHorizontal: 40,
    marginLeft: 30,
    borderRadius: 15,
  },
  fareButton2: {
    backgroundColor: "#FFFFFF",
    borderColor: "#CBCBCB",
    borderWidth: 1,
    paddingVertical: 10,
    paddingHorizontal: 30,
    marginLeft: 30,
    borderRadius: 15,
  },
  fareButtonText: {
    color: "#1E86DA",
    fontFamily: "Poppins",
  },
  icon: {
    width: 24,
    height: 24,
    marginRight: 10,
  },
  suggestionItem: {
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
    backgroundColor: "#f9f9f9",
  },
});
