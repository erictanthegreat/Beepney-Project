import React, { Component } from "react";
import {
  Text,
  View,
  StyleSheet,
  Dimensions,
  TouchableOpacity,
} from "react-native";
import "@fontsource/poppins";
import BackButton from "@/components/Backbutton";
import Mapbox from "@rnmapbox/maps";
import FindIcon from "../../assets/images/find.svg";
import BottomSheet from "@gorhom/bottom-sheet";
import { useMemo } from "react";
const { width, height } = Dimensions.get("window");
Mapbox.setAccessToken(
  "pk.eyJ1IjoiZXJpY3RhbjMzMyIsImEiOiJjbWU4NTVsamswOWNuMmpwd29lZmx1OTNwIn0.1rtunFwJarUUNmyOKSdSYQ"
);
export default class RideHailing extends Component {
  state = { mapReady: false };
  handleMapReady = () => {
    this.setState({ mapReady: true });
  };
  render() {
    const snapPoints = useMemo(() => ["25%", "50%", "75%"], []);

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
          <BackButton /> <Text style={hailStyles.header}> TricyCall </Text>
          <Text
            style={{ marginLeft: 25, color: "#595959", fontFamily: "Poppins" }}
          >
            Book your tricycle—fast, safe, local.
          </Text>
        </View>
        <View style={hailStyles.bttContainer}>
          <TouchableOpacity style={hailStyles.button}>
            <FindIcon style={hailStyles.icon} />
            <Text style={hailStyles.btext}>Where to go?</Text>
          </TouchableOpacity>
        </View>

        <BottomSheet snapPoints={snapPoints} children={"25%"}></BottomSheet>
      </View>
    );
  }
}
const hailStyles = StyleSheet.create({
  bttContainer: { top: 520, alignItems: "center", justifyContent: "center" },
  button: {
    flexDirection: "row",
    backgroundColor: "white",
    paddingVertical: 15,
    borderRadius: 15,
    width: "85%",
  },
  btext: {
    marginTop: 3,
    marginLeft: 10,
    color: "#737F83",
    fontFamily: "Poppins",
  },
  container: { flex: 1, backgroundColor: "#fff" },
  header: {
    fontWeight: "bold",
    alignItems: "flex-start",
    fontSize: 25,
    marginLeft: 20,
    marginTop: 10,
    color: "#073051",
  },
  icon: { marginLeft: 20 },
  map: { position: "absolute", top: 0, left: 0, width: width, height: height },
});
