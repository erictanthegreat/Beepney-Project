import React, { Component } from "react";
import {
  Text,
  View,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  FlatList,
  ActivityIndicator,
} from "react-native";
import * as Location from "expo-location";
import { router } from "expo-router";
import "@fontsource/poppins";
import BackButton from "@/components/Backbutton";
import DropDown from "@/components/ui/DropDown";
import FareIcon from "@/assets/images/fare.svg";
import OriginIcon from "@/assets/images/loc.svg";
import DestIcon from "@/assets/images/loc 2.svg";
import GPS from "@/assets/images/gps.svg";
import { supabase } from "scripts/supabase";

const MAPBOX_TOKEN =
  "pk.eyJ1IjoiZXJpY3RhbjMzMyIsImEiOiJjbWU4NTVsamswOWNuMmpwd29lZmx1OTNwIn0.1rtunFwJarUUNmyOKSdSYQ";

// REMOVED: hardcoded baseFares object - now fetched from database

const discounts: Record<string, number> = {
  Regular: 0,
  Student: 20,
  "Senior Citizen": 20,
  "Solo Parent": 20,
  PWD: 20,
};

interface FareRule {
  vehicle_type: string;
  base_fare: number | null;
  threshold_km: number | null;
  excess_rate: number | null;
  rate_per_km: number | null;
  add_per_km_after: number | null;
  add_amount: number | null;
  is_active: boolean;
}

export default class FareCalculator extends Component {
  state = {
    vehicleType: null,
    openDropdown: null,
    origin: "",
    destination: "",
    originCoords: null,
    destinationCoords: null,
    originSuggestions: [],
    destinationSuggestions: [],
    IdType: null,
    discountTypes: ["Regular"],
    recentFare: null,
    loadingRecentFare: true,
    fareRules: {} as Record<string, FareRule>,
    loadingFareRules: true,
  };

  async componentDidMount() {
    await this.getCurrentLocation();
    await this.fetchFareRules();
    await this.fetchDiscountTypes();
    await this.fetchRecentFare();
  }

  fetchFareRules = async () => {
    this.setState({ loadingFareRules: true });
    try {
      const { data, error } = await supabase
        .from("fare_rules")
        .select("*")
        .eq("is_active", true);

      if (error) {
        console.error("Error fetching fare rules:", error);
        return;
      }

      if (data) {
        const rulesMap: Record<string, FareRule> = {};
        data.forEach((rule: FareRule) => {
          rulesMap[rule.vehicle_type] = rule;
        });
        this.setState({ fareRules: rulesMap });
      }
    } catch (err) {
      console.error("Unexpected error fetching fare rules:", err);
    } finally {
      this.setState({ loadingFareRules: false });
    }
  };

  fetchRecentFare = async () => {
    this.setState({ loadingRecentFare: true });
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        this.setState({ recentFare: null, loadingRecentFare: false });
        return;
      }

      const { data, error } = await supabase
        .from("saved_fares")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Error fetching recent fare:", error);
        this.setState({ recentFare: null });
      } else {
        this.setState({ recentFare: data && data.length > 0 ? data[0] : null });
      }
    } catch (err) {
      console.error("Unexpected error fetching recent fare:", err);
      this.setState({ recentFare: null });
    } finally {
      this.setState({ loadingRecentFare: false });
    }
  };

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

        const finalTypes = [
          "Select Discount",
          "Regular",
          ...filteredTypes,
        ].filter((item, index, self) => self.indexOf(item) === index);

        this.setState({
          discountTypes: finalTypes,
          IdType: null,
        });
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

  getBaseFare = (vehicleType: string): number => {
    const { fareRules } = this.state;
    const rule = fareRules[vehicleType];

    if (!rule) return 0;

    return rule.base_fare || rule.rate_per_km || 0;
  };

  render() {
    const {
      origin,
      destination,
      vehicleType,
      IdType,
      originCoords,
      destinationCoords,
      discountTypes,
      recentFare,
      loadingRecentFare,
      fareRules,
      loadingFareRules,
    } = this.state;

    const isCalculateDisabled =
      !origin ||
      !destination ||
      !vehicleType ||
      vehicleType === "Select Vehicle" ||
      !IdType ||
      IdType === "Select Discount" ||
      !originCoords ||
      !destinationCoords ||
      loadingFareRules;

    const selectedIdType = IdType === "Select Discount" ? "" : IdType;
    const selectedVehicleType =
      vehicleType === "Select Vehicle" ? "" : vehicleType;

    const activeVehicleTypes = Object.keys(fareRules).filter(
      (type) => fareRules[type].is_active
    );

    const vehicleOptions = [
      "Select Vehicle",
      ...activeVehicleTypes.sort(),
    ].filter((item, index, self) => self.indexOf(item) === index);

    const RecentFareCard = () => {
      if (loadingRecentFare) {
        return (
          <ActivityIndicator
            size="small"
            color="#073051"
            style={{ marginVertical: 10, alignSelf: "center" }}
          />
        );
      }

      if (!recentFare) {
        return (
          <View style={fareStyles.recentCard}>
            <Text style={fareStyles.noFareText}>No recent saved fares.</Text>
          </View>
        );
      }

      const { origin, destination, total_fare, created_at, vehicle_type } =
        recentFare;
      const formattedDate = new Date(created_at).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      });

      return (
        <View style={fareStyles.recentCard}>
          <View style={fareStyles.cardRow}>
            <OriginIcon style={fareStyles.cardIcon} />
            <Text style={fareStyles.cardText} numberOfLines={1}>
              {origin || "Start Point"}
            </Text>
          </View>
          <View style={[fareStyles.cardRow, { marginTop: 5 }]}>
            <DestIcon style={fareStyles.cardIcon} />
            <Text style={fareStyles.cardText} numberOfLines={1}>
              {destination || "End Point"}
            </Text>
          </View>

          <View style={fareStyles.fareSummary}>
            <Text style={fareStyles.fareDate}>{formattedDate}</Text>
            <Text style={fareStyles.fareType}>{vehicle_type}</Text>
            <Text style={fareStyles.fareTotal}>
              ₱ {total_fare ? total_fare.toFixed(2) : "0.00"}
            </Text>
          </View>
        </View>
      );
    };

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
          contentContainerStyle={{ paddingBottom: 30 }}
          ListHeaderComponent={
            <>
              <View style={fareStyles.container}>
                {/* NEW: Show loading indicator while fare rules are loading */}
                {loadingFareRules && (
                  <View style={fareStyles.loadingContainer}>
                    <ActivityIndicator size="small" color="#073051" />
                    <Text style={fareStyles.loadingText}>
                      Loading fare information...
                    </Text>
                  </View>
                )}

                <View style={fareStyles.cont}>
                  <OriginIcon style={fareStyles.icon} />
                  <TextInput
                    placeholder="Enter Origin"
                    value={origin}
                    onChangeText={(text) => {
                      this.setState({ origin: text });
                      this.fetchSuggestions(text, "origin");
                    }}
                    style={{ flex: 1 }}
                  />

                  <TouchableOpacity onPress={this.getCurrentLocation}>
                    <GPS />
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

                <View style={fareStyles.cont}>
                  <DestIcon style={fareStyles.icon} />
                  <TextInput
                    placeholder="Enter Destination"
                    value={destination}
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
                  data={discountTypes}
                  onSelect={(value) => this.setState({ IdType: value })}
                  isOpen={this.state.openDropdown === 1}
                  onToggle={(open) => this.handleToggle(1, open)}
                  value={selectedIdType}
                  placeholder="Select Discount"
                />

                <DropDown
                  data={vehicleOptions}
                  onSelect={(value) => this.setState({ vehicleType: value })}
                  isOpen={this.state.openDropdown === 2}
                  onToggle={(open) => this.handleToggle(2, open)}
                  value={selectedVehicleType}
                  placeholder="Select Vehicle"
                />

                <TouchableOpacity
                  style={[
                    fareStyles.button,
                    isCalculateDisabled && fareStyles.disabledButton,
                  ]}
                  onPress={() =>
                    router.push({
                      pathname: "/(feat)/CalculatedFare",
                      params: {
                        origin: origin,
                        originCoords: JSON.stringify(originCoords),
                        destination: destination,
                        destinationCoords: JSON.stringify(destinationCoords),
                        vehicleType: vehicleType,
                        baseFare: String(this.getBaseFare(vehicleType)), // UPDATED: Use dynamic base fare
                        discounts: String(discounts[IdType] || 0),
                      },
                    })
                  }
                  disabled={isCalculateDisabled}
                >
                  <Text style={fareStyles.buttText}>
                    {loadingFareRules
                      ? "Loading..."
                      : isCalculateDisabled
                        ? "Fill All Fields"
                        : "Calculate Fare"}
                  </Text>
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

              <View
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  justifyContent: "space-between",
                  marginRight: 20,
                  marginBottom: 10,
                }}
              >
                <Text style={fareStyles.fareText}>Recent Calculated Fare</Text>
              </View>

              <View style={{ marginHorizontal: 20 }}>
                <RecentFareCard />
              </View>
              <TouchableOpacity
                onPress={() => router.push("/SavedFares")}
                style={fareStyles.fareButton2}
              >
                <Text style={fareStyles.fareButtonText}>
                  See all saved fares
                </Text>
              </TouchableOpacity>
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
  disabledButton: {
    backgroundColor: "#b0b0b0",
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
    justifyContent: "center",
    borderRadius: 15,
    width: "90%",
    alignSelf: "center",
  },
  fareButtonText: {
    color: "#1E86DA",
    fontFamily: "Poppins",
    alignSelf: "center",
    justifyContent: "center",
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
  // NEW: Loading styles
  loadingContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 10,
    padding: 10,
    backgroundColor: "#F0F8FF",
    borderRadius: 8,
  },
  loadingText: {
    marginLeft: 10,
    color: "#073051",
    fontFamily: "Poppins",
    fontSize: 14,
  },
  recentCard: {
    backgroundColor: "#F8F9FB",
    borderRadius: 12,
    padding: 15,
    marginBottom: 15,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  cardRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 5,
  },
  cardIcon: {
    width: 20,
    height: 20,
    marginRight: 8,
  },
  cardText: {
    fontWeight: "600",
    fontSize: 14,
    color: "#073051",
    flexShrink: 1,
    fontFamily: "Poppins",
  },
  fareSummary: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 10,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: "#e0e0e0",
  },
  fareDate: {
    color: "#999",
    fontSize: 11,
    fontFamily: "Poppins",
  },
  fareType: {
    color: "#073051",
    fontSize: 12,
    fontFamily: "Poppins",
  },
  fareTotal: {
    color: "#0D99FF",
    fontWeight: "bold",
    fontSize: 16,
    fontFamily: "Poppins",
  },
  noFareText: {
    textAlign: "center",
    color: "#737F83",
    fontFamily: "Poppins",
    fontSize: 14,
  },
});
