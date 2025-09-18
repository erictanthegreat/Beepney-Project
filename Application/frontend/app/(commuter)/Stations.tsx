import React, { Component } from "react";
import {
  Text,
  View,
  StyleSheet,
  Dimensions,
  TouchableOpacity,
} from "react-native";
import { router } from "expo-router";
import "@fontsource/poppins";
import Mapbox from "@rnmapbox/maps";
import BackButton from "@/components/Backbutton";
import LocationIcon from "../../assets/images/loc.svg";
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
            <Mapbox.PointAnnotation
              key={station.id}
              id={station.id}
              coordinate={station.coordinates}
            >
              <View style={statStyles.marker} />
              <Mapbox.Callout title={station.name} />
            </Mapbox.PointAnnotation>
          ))}
        </Mapbox.MapView>

        <View style={statStyles.topBar}>
          <BackButton />
          <Text style={statStyles.title}>Stations</Text>
          <TouchableOpacity
            onPress={() => router.push("/(result)/stationdetails")}
          >
            <LocationIcon />
          </TouchableOpacity>
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
    marginLeft: 1,
    color: "#073051",
    paddingTop: 50,
  },
  marker: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: "#1E86DA",
    borderColor: "#fff",
    borderWidth: 2,
  },
});