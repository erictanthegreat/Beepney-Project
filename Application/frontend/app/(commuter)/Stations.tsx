import React, { Component } from "react";
import { Text, View, StyleSheet, Dimensions } from "react-native";
import { router } from "expo-router";
import "@fontsource/poppins";
import Mapbox from "@rnmapbox/maps";
import BackButton from "@/components/Backbutton";
import LocationIcon from "../../assets/images/filter.svg";
import { supabase } from "@/scripts/supabase";

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
}

const VEHICLE_COLORS: { [key: string]: string } = {
  TRICYCLE: "#FF8C00",
  JEEPNEY: "#4169E1",
  VAN: "#32CD32",
  ALL: "#0D99FF",
};

export default class Stations extends Component {
  state = {
    stations: [] as Station[],
    mapReady: false,
  };

  async componentDidMount() {
    const stations = await this.fetchStationsMobile();
    this.setState({ stations });
  }

  fetchStationsMobile = async (): Promise<Station[]> => {
    const { data, error } = await supabase.from("stations").select("*");
    if (error) {
      console.error("Error fetching stations:", error);
      return [];
    }

    return (data || [])
      .filter((s: any) => s.coordinates && s.coordinates.length === 2)
      .map((s: any) => ({
        id: s.id,
        name: s.name,
        location: s.location,
        coordinates: s.coordinates as [number, number],
        vehicleTypes: s.vehicle_types || [],
      }));
  };

  handleMapReady = () => {
    this.setState({ mapReady: true });
  };

  handleMarkerPress = (station: Station) => {
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

  render() {
    const { stations } = this.state;

    return (
      <View style={statStyles.container}>
        <Mapbox.MapView
          style={statStyles.map}
          styleURL={Mapbox.StyleURL.Street}
          onDidFinishLoadingMap={this.handleMapReady}
        >
          {this.state.mapReady && (
            <Mapbox.Camera
              zoomLevel={13}
              centerCoordinate={[123.186389, 13.624444]}
            />
          )}

          {stations.map((station) => (
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
      </View>
    );
  }
}

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
    justifyContent: "space-between",
  },
  title: {
    fontWeight: "bold",
    fontSize: 25,
    color: "#073051",
    paddingTop: 50,
    textAlign: "center",
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
    top: 150,
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
});
