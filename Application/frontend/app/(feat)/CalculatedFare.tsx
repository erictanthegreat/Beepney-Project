import React, { useState, useRef, useEffect } from "react";
import {
  Text,
  View,
  StyleSheet,
  Dimensions,
  TouchableOpacity,
} from "react-native";
import "@fontsource/poppins";
import Mapbox from "@rnmapbox/maps";
import * as Location from "expo-location";
import { router } from "expo-router";
import BackButton from "@/components/Backbutton";
import BottomSheetContainer from "@/components/BottomSheetContainer";
import CustomButton from "@/components/ui/CustomButton";
import OriginIcon from "@/assets/images/loc.svg";
import DestIcon from "@/assets/images/loc 2.svg";
import FareIcon from "@/assets/images/fare icon.svg";

const { width, height } = Dimensions.get("window");

const MAPBOX_TOKEN =
  "pk.eyJ1IjoiZXJpY3RhbjMzMyIsImEiOiJjbWU4NTVsamswOWNuMmpwd29lZmx1OTNwIn0.1rtunFwJarUUNmyOKSdSYQ";

export default function RideHailing() {
  const bottomSheetRef = useRef<any>(null); // Ref to control Bottom Sheet
  const mapCameraRef = useRef<any>(null); // Ref to control Map camera programmatically

  const [mapReady, setMapReady] = useState(false); // Checks if map has loaded
  const [pickup, setPickup] = useState<[number, number]>([
    123.186389, 13.624444,
  ]); // Pickup coordinates
  const [destination, setDestination] = useState<[number, number]>([
    123.19, 13.63,
  ]); // Destination coordinates
  const [activeSelection, setActiveSelection] = useState<
    "pickup" | "destination" | null
  >(null); // Which marker user selected in bottom sheet
  const [selectedRide, setSelectedRide] = useState<"solo" | "group" | null>(
    null
  ); // Type of ride selected

  const [pickupAddress, setPickupAddress] = useState<string>(""); // Human-readable pickup
  const [destinationAddress, setDestinationAddress] = useState<string>(""); // Human-readable destination

  const [routeCoords, setRouteCoords] = useState<[number, number][]>([]); // Coordinates for route line
  const [distance, setDistance] = useState<number>(0); // Distance of route
  const [eta, setETA] = useState<number>(0); // Estimated time of arrival in minutes

  // --- Get user location and set as pickup ---
  useEffect(() => {
    (async () => {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        console.log("Location permission denied");
        return;
      }

      // Get current GPS location
      let location = await Location.getCurrentPositionAsync({});
      const coords: [number, number] = [
        location.coords.longitude,
        location.coords.latitude,
      ];

      setPickup(coords); // Update pickup to current location
      fetchAddress(coords, "pickup"); // Fetch human-readable pickup address

      // Center map camera on user's location
      mapCameraRef.current?.setCamera({
        centerCoordinate: coords,
        zoomLevel: 16,
        animationDuration: 500,
      });
    })();
  }, []);

  // --- Fetch route from Mapbox Directions API ---
  const fetchRoute = async (start: [number, number], end: [number, number]) => {
    try {
      const url = `https://api.mapbox.com/directions/v5/mapbox/driving/${start[0]},${start[1]};${end[0]},${end[1]}?geometries=geojson&access_token=${MAPBOX_TOKEN}`;
      const res = await fetch(url);
      const data = await res.json();
      if (data.routes && data.routes.length > 0) {
        const route = data.routes[0];
        setRouteCoords(route.geometry.coordinates); // Set polyline coordinates
        setDistance(route.distance / 1000); // Distance in km
        setETA(Math.ceil(route.duration / 60)); // ETA in minutes
      }
    } catch (err) {
      console.log("Error fetching route:", err);
    }
  };

  // Fetch route whenever pickup or destination changes
  useEffect(() => {
    fetchRoute(pickup, destination);
  }, [pickup, destination]);

  // --- Fetch address using Mapbox Geocoding API ---
  const fetchAddress = async (
    coords: [number, number],
    type: "pickup" | "destination"
  ) => {
    try {
      const url = `https://api.mapbox.com/geocoding/v5/mapbox.places/${coords[0]},${coords[1]}.json?access_token=${MAPBOX_TOKEN}`;
      const res = await fetch(url);
      const data = await res.json();
      if (data.features && data.features.length > 0) {
        const placeName = data.features[0].place_name;
        if (type === "pickup") setPickupAddress(placeName);
        else setDestinationAddress(placeName);
      }
    } catch (err) {
      console.log("Error fetching address:", err);
    }
  };

  // Fetch initial destination address on mount
  useEffect(() => {
    fetchAddress(destination, "destination");
  }, []);

  // --- Handle marker drag event ---
  const handleDragEnd = (
    coords: [number, number],
    marker: "pickup" | "destination"
  ) => {
    if (marker === "pickup") {
      setPickup(coords);
      fetchAddress(coords, "pickup");
    } else {
      setDestination(coords);
      fetchAddress(coords, "destination");
    }

    // Update route after dragging marker
    fetchRoute(
      marker === "pickup" ? coords : pickup,
      marker === "destination" ? coords : destination
    );
  };

  // --- Focus map camera on selected marker ---
  const focusOnMarker = (marker: "pickup" | "destination") => {
    const coords = marker === "pickup" ? pickup : destination;
    mapCameraRef.current?.setCamera({
      centerCoordinate: coords,
      zoomLevel: 16,
      animationDuration: 500,
    });
    setActiveSelection(marker);
    bottomSheetRef.current?.close(); // Close bottom sheet after selection
  };

  return (
    <View style={calcStyles.container}>
      {/* Map */}
      <Mapbox.MapView
        style={calcStyles.map}
        styleURL={Mapbox.StyleURL.Street}
        onDidFinishLoadingMap={() => setMapReady(true)}
      >
        {mapReady && (
          <Mapbox.Camera
            ref={mapCameraRef}
            zoomLevel={13}
            centerCoordinate={pickup}
          />
        )}

        {/* Draw route line */}
        {routeCoords.length > 0 && (
          <Mapbox.ShapeSource
            id="routeSource"
            shape={{
              type: "Feature",
              geometry: { type: "LineString", coordinates: routeCoords },
              properties: {},
            }}
          >
            <Mapbox.LineLayer
              id="routeFill"
              style={{
                lineColor: "#0D99FF",
                lineWidth: 4,
                lineCap: "round",
                lineJoin: "round",
              }}
            />
          </Mapbox.ShapeSource>
        )}

        {/* Pickup Marker */}
        <Mapbox.PointAnnotation
          id="pickup"
          coordinate={pickup}
          draggable={true}
          onDragEnd={(e) =>
            handleDragEnd(e.geometry.coordinates as [number, number], "pickup")
          }
        >
          <OriginIcon width={30} height={30} />
        </Mapbox.PointAnnotation>

        {/* Destination Marker */}
        <Mapbox.PointAnnotation
          id="destination"
          coordinate={destination}
          draggable={true}
          onDragEnd={(e) =>
            handleDragEnd(
              e.geometry.coordinates as [number, number],
              "destination"
            )
          }
        >
          <DestIcon width={30} height={30} />
        </Mapbox.PointAnnotation>
      </Mapbox.MapView>
      <BackButton />

      {/* Bottom Sheet */}
      <BottomSheetContainer ref={bottomSheetRef}>
        <View style={calcStyles.bsCont}>
          {/* Pickup info */}
          <TouchableOpacity
            style={calcStyles.tripPoint}
            onPress={() => focusOnMarker("pickup")}
          >
            <OriginIcon style={calcStyles.icon2} />
            <View>
              <Text style={calcStyles.pickText}>Where are you?</Text>
              <Text style={calcStyles.poinText}>
                {pickupAddress
                  ? pickupAddress.length > 30
                    ? pickupAddress.slice(0, 30) + "..."
                    : pickupAddress
                  : "Fetching..."}
              </Text>
            </View>
          </TouchableOpacity>

          {/* Destination info */}
          <TouchableOpacity
            style={calcStyles.tripPoint}
            onPress={() => focusOnMarker("destination")}
          >
            <DestIcon style={calcStyles.icon2} />
            <View>
              <Text style={calcStyles.destText}>Destination</Text>
              <Text style={calcStyles.poinText2}>
                {destinationAddress
                  ? destinationAddress.length > 30
                    ? destinationAddress.slice(0, 30) + "..."
                    : destinationAddress
                  : "Fetching..."}
              </Text>
            </View>
          </TouchableOpacity>

          <Text
            style={{ color: "#737F83", fontFamily: "Poppins", marginLeft: 24 }}
          >
            Estimated Kilometer (km): {distance.toFixed(2)} km{" "}
          </Text>

          <View style={calcStyles.line}></View>

          {/* Ride selection */}
          <View style={{ flexDirection: "row" }}>
            <FareIcon />
            <Text style={calcStyles.label}>Fare Calculation</Text>
          </View>

          <View style={calcStyles.rideCont}>
            <View style={calcStyles.row}>
              <Text style={calcStyles.typeFare}>Regular Fare:</Text>
              <Text style={calcStyles.fee}>₱ 13.00</Text>
            </View>
            <View style={calcStyles.row}>
              <Text style={calcStyles.typeFare}>Distance Fee:</Text>
              <Text style={calcStyles.fee}>₱ 0.00</Text>
            </View>
            <View style={calcStyles.row}>
              <Text style={calcStyles.typeFare}>Discount:</Text>
              <Text style={calcStyles.fee}>20%</Text>
            </View>
          </View>

          <View style={calcStyles.line}></View>
          <View style={calcStyles.rideCont}>
            <View style={calcStyles.row}>
              <Text style={calcStyles.typeFare}>Total Fare:</Text>
              <Text style={calcStyles.fee}>₱ 11.00</Text>
            </View>
          </View>

          {/* Confirm button */}
          <CustomButton
            title="Pay Cashless"
            backgroundColor="#1E86DA"
            onPress={() =>
              console.log("Pickup:", pickup, "Destination:", destination)
            }
            style={{
              width: "95%",
              alignItems: "center",
              marginTop: 40,
            }}
          />
          <Text style={calcStyles.divider}>or</Text>
          <CustomButton
            title="Done"
            backgroundColor="#073051"
            onPress={() => router.push("/(feat)/FareCalculator")}
            style={{
              width: "95%",
              alignItems: "center",

              marginTop: 1,
            }}
          />
        </View>
      </BottomSheetContainer>
    </View>
  );
}

const calcStyles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  map: {
    position: "absolute",
    top: 0,
    left: 0,
    width,
    height,
  },
  bttContainer: {
    top: 520,
    alignItems: "center",
    justifyContent: "center",
  },
  bsCont: {
    marginLeft: 20,
  },
  rideCont: {
    marginLeft: 20,
    marginRight: 20,
  },
  tripPoint: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 5,
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 8,
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
  rideButton: {
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#CBCBCB",
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 15,
  },
  selectedButton: {
    borderColor: "#0D99FF",
  },

  btext: {
    marginTop: 3,
    marginLeft: 10,
    color: "#737F83",
    fontFamily: "Poppins",
  },
  label: {
    color: "#0D99FF",
    fontWeight: "bold",
    fontSize: 17,
    marginBottom: 10,
    marginLeft: 10,
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
  },
  poinText2: {
    color: "#737F83",
    fontFamily: "Poppins",
    fontSize: 15,
    marginBottom: 5,
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
  typeFare: {
    color: "#737F83",
    marginBottom: 5,
    fontFamily: "Poppins",
  },
  fee: {
    color: "#737F83",
    fontFamily: "Poppins",
    marginRight: 20,
  },
  text: {
    color: "#CBCBCB",
    marginTop: 5,
  },
  divider: {
    fontFamily: "Poppins",
    textAlign: "center",
    paddingVertical: 5,
    color: "#737F83",
  },

  icon: {
    marginLeft: 20,
  },
  icon2: {
    marginRight: 10,
    marginBottom: 20,
  },
  iconCont: {
    flexDirection: "row",
    justifyContent: "space-around",
    gap: 40,
    marginTop: 10,
    marginRight: 20,
  },
  iconWithText: {
    alignItems: "center",
  },
});
