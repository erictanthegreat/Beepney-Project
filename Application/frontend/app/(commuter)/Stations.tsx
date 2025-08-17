import React, { Component } from "react";
import { Text, View, StyleSheet, Dimensions } from "react-native";
import "@fontsource/poppins";
import Mapbox from "@rnmapbox/maps";
import BackButton from "@/components/Backbutton";

const { width, height } = Dimensions.get("window");

Mapbox.setAccessToken(
  "pk.eyJ1IjoiZXJpY3RhbjMzMyIsImEiOiJjbWU4NTVsamswOWNuMmpwd29lZmx1OTNwIn0.1rtunFwJarUUNmyOKSdSYQ"
);

export default class Stations extends Component {
  state = {
    mapReady: false,
  };

  handleMapReady = () => {
    this.setState({ mapReady: true });
  };

  render() {
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
        </Mapbox.MapView>

        <View style={statStyles.topBar}>
          <BackButton />
          <Text style={statStyles.title}>Stations</Text>
          <View style={{ width: 50 }} />
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
});
