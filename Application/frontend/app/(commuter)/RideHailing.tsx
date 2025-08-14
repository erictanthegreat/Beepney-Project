import React, { Component } from "react";
import { Text, View, StyleSheet, Dimensions } from "react-native";
import "@fontsource/poppins";
import BackButton from "@/components/Backbutton";
import Mapbox from "@rnmapbox/maps";

const { width, height } = Dimensions.get("window");

Mapbox.setAccessToken(
  "pk.eyJ1IjoiZXJpY3RhbjMzMyIsImEiOiJjbWU4NTVsamswOWNuMmpwd29lZmx1OTNwIn0.1rtunFwJarUUNmyOKSdSYQ"
);

export default class RideHailing extends Component {
  state = {
    mapReady: false,
  };

  handleMapReady = () => {
    this.setState({ mapReady: true });
  };
  render() {
    return (
      <View style={hailStyles.container}>
        <Mapbox.MapView
          style={hailStyles.map}
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

        <View>
          <BackButton />
          <Text style={hailStyles.header}> TricyCall </Text>
          <Text
            style={{ marginLeft: 25, color: "#595959", fontFamily: "Poppins" }}
          >
            Book your tricycle—fast, safe, local.
          </Text>
        </View>
      </View>
    );
  }
}

const hailStyles = StyleSheet.create({
  header: {
    fontWeight: "bold",
    alignItems: "flex-start",
    fontSize: 25,
    marginLeft: 20,
    marginTop: 10,
    color: "#073051",
  },
  container: { flex: 1, backgroundColor: "#fff" },
  topBar: {},
  map: {
    position: "absolute",
    top: 0,
    left: 0,
    width: width,
    height: height,
  },
});
