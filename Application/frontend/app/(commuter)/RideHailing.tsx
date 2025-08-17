import React, { useState, useRef } from "react";
import {
  Text,
  View,
  StyleSheet,
  Dimensions,
  TouchableOpacity,
} from "react-native";
import "@fontsource/poppins";
import BackButton from "@/components/Backbutton";
import BottomSheetContainer from "@/components/BottomSheetContainer";
import Mapbox from "@rnmapbox/maps";
import FindIcon from "../../assets/images/find.svg";

const { width, height } = Dimensions.get("window");

export default function RideHailing() {
  const [mapReady, setMapReady] = useState(false);
  const bottomSheetRef = useRef(null);

  return (
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

      {/* Button */}
      <View style={styles.bttContainer}>
        <TouchableOpacity
          style={styles.button}
          onPress={() => bottomSheetRef.current?.open()} // 👈 open bottom sheet
        >
          <FindIcon style={styles.icon} />
          <Text style={styles.btext}>Where to go?</Text>
        </TouchableOpacity>
      </View>

      {/* Bottom Sheet */}
      <BottomSheetContainer ref={bottomSheetRef} />
    </View>
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
  subHeader: { marginLeft: 25, color: "#595959", fontFamily: "Poppins" },
  map: { position: "absolute", top: 0, left: 0, width, height },
  bttContainer: { top: 520, alignItems: "center", justifyContent: "center" },
  button: {
    flexDirection: "row",
    backgroundColor: "white",
    paddingVertical: 15,
    borderRadius: 15,
    width: "85%",
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 3,
  },
  btext: {
    marginTop: 3,
    marginLeft: 10,
    color: "#737F83",
    fontFamily: "Poppins",
  },
  icon: { marginLeft: 20 },
});
