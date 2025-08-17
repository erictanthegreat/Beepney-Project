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
import OriginIcon from "@/assets/images/loc.svg";
import DestIcon from "@/assets/images/loc 2.svg";
import SoloIcon from "@/assets/images/solo.svg";
import GroupIcon from "@/assets/images/group.svg";
import KmIcon from "@/assets/images/km.svg";
import ETAIcon from "@/assets/images/eta.svg";
import FareIcon from "@/assets/images/money.svg";
import CustomButton from "@/components/ui/CustomButton";

const { width, height } = Dimensions.get("window");

export default function RideHailing() {
  const [mapReady, setMapReady] = useState(false);
  const bottomSheetRef = useRef<any>(null);

  const [selectedRide, setSelectedRide] = useState<"solo" | "group" | null>(
    null
  );

  return (
    <View style={rideStyles.container}>
      {/* Map */}
      <Mapbox.MapView
        style={rideStyles.map}
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
        <Text style={rideStyles.header}>TricyCall</Text>
        <Text style={rideStyles.subHeader}>
          Book your tricycle—fast, safe, local.
        </Text>
      </View>

      {/* Open Bottom Sheet Button */}
      <View style={rideStyles.bttContainer}>
        <TouchableOpacity
          style={rideStyles.button}
          onPress={() => bottomSheetRef.current?.open()}
        >
          <FindIcon style={rideStyles.icon} />
          <Text style={rideStyles.btext}>Where to go?</Text>
        </TouchableOpacity>
      </View>

      {/* Bottom Sheet */}
      <BottomSheetContainer ref={bottomSheetRef}>
        <View style={rideStyles.bsCont}>
          <View>
            <Text style={rideStyles.label}>Your Trip</Text>

            {/* PICK UP */}
            <View style={rideStyles.tripPoint}>
              <OriginIcon style={rideStyles.icon2} />
              <View>
                <Text style={rideStyles.pickText}>Pick Up</Text>
                <Text style={rideStyles.poinText}>Point A</Text>
              </View>
            </View>

            {/* DESTINATION */}
            <View style={rideStyles.tripPoint}>
              <DestIcon style={rideStyles.icon2} />
              <View>
                <Text style={rideStyles.destText}>Destination</Text>
                <Text style={rideStyles.poinText}>Point B</Text>
              </View>
            </View>

            <View style={rideStyles.line}></View>
          </View>

          {/* Ride Selector */}
          <View>
            <Text style={rideStyles.label}>Select Ride</Text>
            <View style={rideStyles.rideCont}>
              {/* Solo */}
              <TouchableOpacity
                style={[
                  rideStyles.rideButton,
                  selectedRide === "solo" && rideStyles.selectedButton,
                ]}
                onPress={() => setSelectedRide("solo")}
              >
                <SoloIcon
                  width={50}
                  height={50}
                  fill={selectedRide === "solo" ? "#0D99FF" : "#CBCBCB"}
                />
                <Text
                  style={[
                    rideStyles.text,
                    selectedRide === "solo" && { color: "#0D99FF" },
                  ]}
                >
                  Solo
                </Text>
              </TouchableOpacity>

              {/* Group */}
              <TouchableOpacity
                style={[
                  rideStyles.rideButton,
                  selectedRide === "group" && rideStyles.selectedButton,
                ]}
                onPress={() => setSelectedRide("group")}
              >
                <GroupIcon
                  width={50}
                  height={50}
                  fill={selectedRide === "group" ? "#0D99FF" : "#CBCBCB"}
                />
                <Text
                  style={[
                    rideStyles.text,
                    selectedRide === "group" && { color: "#0D99FF" },
                  ]}
                >
                  Group
                </Text>
              </TouchableOpacity>
            </View>
          </View>
          <View style={rideStyles.line}></View>
          <View style={rideStyles.iconCont}>
            <KmIcon />
            <ETAIcon />
            <FareIcon />
          </View>
          <CustomButton
            title={"Confirm Hailing"}
            backgroundColor="#073051"
            onPress={() => console.log("hh")}
            style={{ alignItems: "center", marginLeft: 20, marginTop: 60 }}
          ></CustomButton>
        </View>
      </BottomSheetContainer>
    </View>
  );
}

const rideStyles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff" },
  map: { position: "absolute", top: 0, left: 0, width, height },
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
  bttContainer: {
    top: 520,
    alignItems: "center",
    justifyContent: "center",
  },
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
  icon: {
    marginLeft: 20,
  },
  iconCont: {
    flexDirection: "row",
    justifyContent: "center",
    gap: 110,
    marginTop: 10,
    marginRight: 50,
  },
  btext: {
    marginTop: 3,
    marginLeft: 10,
    color: "#737F83",
    fontFamily: "Poppins",
  },
  bsCont: { marginLeft: 20 },
  label: {
    color: "#073051",
    fontWeight: "bold",
    fontSize: 17,
    marginBottom: 10,
  },
  line: {
    width: "95%",
    height: 1,
    backgroundColor: "#CBCBCB",
    marginVertical: 15,
  },
  poinText: {
    color: "#737F83",
    fontFamily: "Poppins",
    fontSize: 15,
    marginLeft: 0,
  },
  pickText: {
    color: "#1E86DA",
    fontWeight: "bold",
    fontSize: 16,
  },
  destText: {
    color: "#073051",
    fontWeight: "bold",
    fontSize: 16,
  },
  icon2: {
    marginRight: 10,
  },
  tripPoint: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
  },
  rideCont: {
    flexDirection: "row",
    gap: 40,
    justifyContent: "flex-start",
  },
  rideButton: {
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#CBCBCB",
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 15,
  },
  selectedButton: { borderColor: "#0D99FF" },
  text: { color: "#CBCBCB", marginTop: 5 },
});
