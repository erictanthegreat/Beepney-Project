import React, { useMemo, useState } from "react";
import { Text, View, StyleSheet, Dimensions } from "react-native";
import "@fontsource/poppins";
import BackButton from "@/components/Backbutton";
import Mapbox from "@rnmapbox/maps";
import BottomSheet from "@gorhom/bottom-sheet";
import { GestureHandlerRootView } from "react-native-gesture-handler";

const { width, height } = Dimensions.get("window");

Mapbox.setAccessToken(
  "pk.eyJ1IjoiZXJpY3RhbjMzMyIsImEiOiJjbWU4NTVsamswOWNuMmpwd29lZmx1OTNwIn0.1rtunFwJarUUNmyOKSdSYQ"
);

export default function RideHailing() {
  const [mapReady, setMapReady] = useState(false);
  const snapPoints = useMemo(() => ["25%", "50%", "75%"], []);

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <View style={styles.container}>
        {/* Map */}
        <Mapbox.MapView
          style={styles.map}
          styleURL={Mapbox.StyleURL.Street}
          onDidFinishLoadingMap={() => setMapReady(true)}
        >
          {mapReady && (
            <Mapbox.Camera
              zoomLevel={13}
              centerCoordinate={[123.186389, 13.624444]}
            />
          )}
        </Mapbox.MapView>

        {/* Header */}
        <View>
          <BackButton />
          <Text style={styles.header}>TricyCall</Text>
          <Text style={styles.subHeader}>
            Book your tricycle—fast, safe, local.
          </Text>
        </View>
      </View>

      {/* Persistent Bottom Sheet */}
      <BottomSheet
        index={0} // start opened at 25%
        snapPoints={snapPoints}
        enablePanDownToClose={true}
        backgroundStyle={{ backgroundColor: "white" }}
      >
        <View style={{ padding: 20 }}>
          <Text style={{ fontSize: 16, fontFamily: "Poppins" }}>
            Pick a destination...
          </Text>
        </View>
      </BottomSheet>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff" },
  header: {
    fontWeight: "bold",
    fontSize: 25,
    marginLeft: 20,
    marginTop: 10,
    color: "#073051",
  },
  subHeader: {
    marginLeft: 25,
    color: "#595959",
    fontFamily: "Poppins",
  },
  map: {
    position: "absolute",
    top: 0,
    left: 0,
    width: width,
    height: height,
  },
});
