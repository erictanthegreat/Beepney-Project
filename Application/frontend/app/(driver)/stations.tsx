import React, { Component } from "react";
import {
  Text,
  View,
  StyleSheet,
  Dimensions,
  TextInput,
  Alert,
} from "react-native";
import { router } from "expo-router";
import "@fontsource/poppins";
import Mapbox from "@rnmapbox/maps";
import * as Location from "expo-location";
import BackButton from "@/components/Backbutton";
import LocationIcon from "../../assets/images/filter.svg";
import { supabase } from "@/scripts/supabase";
import FindIcon from "../../assets/images/find.svg";

const { width, height } = Dimensions.get("window");

Mapbox.setAccessToken(
  "pk.eyJ1IjoiZXJpY3RhbjMzMyIsImEiOiJjbWU4NTVsamswOWNuMmpwd29lZmx1OTNwIn0.1rtunFwJarUUNmyOKSdSYQ"
);

export interface Station {
  id: string;
  name: string;
  location: string;
  coordinates: [number, number];
  vehicleTypes: string[];

  destinations?: string[];
}

const VEHICLE_COLORS: { [key: string]: string } = {
  TRICYCLE: "#FF8C00",
  JEEPNEY: "#FFD54F",
  VAN: "#B8ADAD",
  ALL: "#0D99FF",
};

interface StationsState {
  stations: Station[];
  filteredStations: Station[];
  mapReady: boolean;
  searchQuery: string;
  followUser: boolean;
}

export default class Stations extends Component<{}, StationsState> {
  state: StationsState = {
    stations: [],
    filteredStations: [],
    mapReady: false,
    searchQuery: "",
    followUser: false, // Initial state for GPS tracking
  };

  // --- Location Permission Logic ---
  private requestLocationPermission = async (): Promise<boolean> => {
    let { status } = await Location.requestForegroundPermissionsAsync();

    if (status !== "granted") {
      console.error("Location permission denied");
      Alert.alert(
        "Location Required",
        "Please enable location services for this app in your device settings to see your current position."
      );
      return false;
    }
    return true;
  };

  async componentDidMount() {
    const hasPermission = await this.requestLocationPermission();

    const stations = await this.fetchStationsMobile();

    this.setState({
      stations,
      filteredStations: stations,
      // Only set followUser to true if permission was granted
      followUser: hasPermission,
    });
  }

  // --- Data Fetching Methods ---

  fetchStationsMobile = async (): Promise<Station[]> => {
    const { data: allDestinations, error: destError } = await supabase
      .from("station_destinations")
      .select("station_id, destination");

    if (destError) {
      console.error("Error fetching destinations:", destError);
      return [];
    }

    const uniqueStationIds = Array.from(
      new Set(allDestinations.map((d) => d.station_id))
    );

    const { data: stationsData, error: stationsError } = await supabase
      .from("stations")
      .select("*")
      .in("id", uniqueStationIds);

    if (stationsError) {
      console.error("Error fetching stations:", stationsError);
      return [];
    }

    const destinationsMap: { [key: string]: string[] } = {};
    (allDestinations || []).forEach((dest: any) => {
      if (!destinationsMap[dest.station_id]) {
        destinationsMap[dest.station_id] = [];
      }
      if (dest.destination) {
        destinationsMap[dest.station_id].push(dest.destination);
      }
    });

    return (stationsData || [])
      .filter((s: any) => s.coordinates && s.coordinates.length === 2)
      .map((s: any) => ({
        id: s.id,
        name: s.name,
        location: s.location,
        coordinates: s.coordinates as [number, number],
        vehicleTypes: s.vehicle_types || [],
        destinations: destinationsMap[s.id] || [],
      }));
  };

  handleSearch = async (text: string): Promise<void> => {
    this.setState({ searchQuery: text });

    if (text.trim() === "") {
      const allStations = await this.fetchStationsMobile();
      this.setState({ filteredStations: allStations });
      return;
    }

    const { data: matchingDestinations, error } = await supabase
      .from("station_destinations")
      .select("station_id, destination")
      .ilike("destination", `%${text}%`);

    if (error) {
      console.error("Error searching destinations:", error);
      return;
    }

    const matchedStationIds = matchingDestinations.map((d) => d.station_id);

    const { data: matchedStations } = await supabase
      .from("stations")
      .select("*")
      .in("id", matchedStationIds);

    const destinationsMap: { [key: string]: string[] } = {};
    (matchingDestinations || []).forEach((dest: any) => {
      if (!destinationsMap[dest.station_id]) {
        destinationsMap[dest.station_id] = [];
      }
      destinationsMap[dest.station_id].push(dest.destination);
    });

    const finalStations: Station[] = (matchedStations || [])
      .filter((s: any) => s.coordinates && s.coordinates.length === 2)
      .map((s: any) => ({
        id: s.id,
        name: s.name,
        location: s.location,
        coordinates: s.coordinates as [number, number],
        vehicleTypes: s.vehicle_types || [],
        destinations: destinationsMap[s.id] || [],
      }));

    this.setState({ filteredStations: finalStations });
  };

  // --- UI/Map Methods ---

  handleMapReady = (): void => {
    this.setState({ mapReady: true });
  };

  handleMarkerPress = (station: Station): void => {
    router.push({
      pathname: "/(result)/StationDetails",
      params: { id: station.id },
    });
  };

  getStationColor = (station: Station): string => {
    if (station.vehicleTypes && station.vehicleTypes.length >= 3) {
      const hasAllThree =
        station.vehicleTypes.includes("TRICYCLE") &&
        station.vehicleTypes.includes("JEEPNEY") &&
        station.vehicleTypes.includes("VAN");

      if (hasAllThree) {
        return VEHICLE_COLORS["ALL"];
      }
    }

    if (station.vehicleTypes && station.vehicleTypes.length > 0) {
      return VEHICLE_COLORS[station.vehicleTypes[0]] || "#808080";
    }
    return "#808080";
  };

  // --- Render Method ---
  render() {
    const { filteredStations, followUser } = this.state;

    return (
      <View style={statStyles.container}>
        <Mapbox.MapView
          style={statStyles.map}
          styleURL={Mapbox.StyleURL.Street}
          onDidFinishLoadingMap={this.handleMapReady}
          // onUserTrackingModeChange is now correctly on Mapbox.Camera
        >
          {this.state.mapReady && (
            <Mapbox.Camera
              zoomLevel={13}
              centerCoordinate={[123.186389, 13.624444]} // Default area center
              followUserLocation={followUser}
              // 1. FIX: onUserTrackingModeChange moved from Mapbox.MapView to here
              onUserTrackingModeChange={(e) => {
                this.setState({
                  followUser: e.nativeEvent.payload.followUserLocation,
                });
              }}
              // 2. FIX: Replaced "compass" string with Mapbox constant for type safety
              followUserMode={Mapbox.UserTrackingMode.FollowWithHeading}
              maxZoomLevel={18}
            />
          )}

          {/* Displays the user's current location (blue dot) */}
          <Mapbox.UserLocation
            visible={followUser}
            showsUserHeadingIndicator={true}
          />

          {filteredStations.map((station) => (
            <React.Fragment key={station.id}>
              <Mapbox.PointAnnotation
                id={station.id}
                coordinate={station.coordinates}
                onSelected={() => this.handleMarkerPress(station)}
              >
                <View
                  style={[
                    statStyles.markerContainer,
                    { backgroundColor: this.getStationColor(station) },
                  ]}
                >
                  <LocationIcon width={24} height={24} fill="white" />
                </View>
              </Mapbox.PointAnnotation>

              <Mapbox.MarkerView
                id={`label-${station.id}`}
                coordinate={station.coordinates}
                anchor={{ x: 0.5, y: -0.8 }}
              >
                <View style={statStyles.labelContainer}>
                  <Text style={statStyles.labelText}>{station.name}</Text>
                </View>
              </Mapbox.MarkerView>
            </React.Fragment>
          ))}
        </Mapbox.MapView>

        {/* --- UI Components --- */}

        <View style={statStyles.topBar}>
          <BackButton />
          <Text style={statStyles.title}>Stations</Text>
        </View>

        <View style={statStyles.legendContainer}>
          <Text style={statStyles.legendTitle}>Vehicle Types</Text>
          {Object.entries(VEHICLE_COLORS).map(([vehicle, color]) => (
            <View key={vehicle} style={statStyles.legendItem}>
              <View
                style={[statStyles.legendDot, { backgroundColor: color }]}
              />
              <Text style={statStyles.legendText}>{vehicle}</Text>
            </View>
          ))}
        </View>

        <View style={statStyles.search}>
          <FindIcon />
          <TextInput
            style={statStyles.text}
            placeholder="Where to go?"
            value={this.state.searchQuery}
            onChangeText={this.handleSearch}
            returnKeyType="search"
            blurOnSubmit={true}
          />
        </View>
      </View>
    );
  }
}

// --- Stylesheet ---

const statStyles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  map: {
    position: "absolute",
    top: 0,
    left: 0,
    width: width,
    height: height,
  },
  topBar: {
    marginTop: 10,
    paddingHorizontal: 13,
    flexDirection: "row",
    alignItems: "center",
    gap: 70,
  },
  title: {
    fontWeight: "bold",
    fontSize: 25,
    color: "#073051",
    paddingTop: 50,
    alignItems: "center",
    flex: 1,
  },
  labelContainer: {
    backgroundColor: "white",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: "#ddd",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  labelText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#073051",
  },
  markerContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
    borderColor: "white",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
    elevation: 5,
  },
  legendContainer: {
    position: "absolute",
    top: 200,
    right: 15,
    backgroundColor: "white",
    borderRadius: 8,
    padding: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  legendTitle: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#073051",
    marginBottom: 8,
  },
  legendItem: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: 4,
  },
  legendDot: {
    width: 16,
    height: 16,
    borderRadius: 8,
    marginRight: 8,
    borderWidth: 1,
    borderColor: "white",
  },
  legendText: {
    fontSize: 12,
    color: "#073051",
  },
  search: {
    borderWidth: 1,
    backgroundColor: "white",
    borderColor: "#CBCBCB",
    elevation: 5,
    borderRadius: 15,
    width: "90%",
    alignSelf: "center",
    position: "absolute",
    top: 120,
    height: 50,
    paddingHorizontal: 15,
    gap: 10,
    flexDirection: "row",
    alignItems: "center",
  },
  text: {
    fontFamily: "Poppins",
    width: "90%",
  },
});
