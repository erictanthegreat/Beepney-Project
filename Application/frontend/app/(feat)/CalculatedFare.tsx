import React, { useState, useRef, useEffect } from "react";
import {
  Text,
  View,
  StyleSheet,
  Dimensions,
  TouchableOpacity,
  TextInput,
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
import { useLocalSearchParams } from "expo-router";

const { width, height } = Dimensions.get("window");

const MAPBOX_TOKEN =
  "pk.eyJ1IjoiZXJpY3RhbjMzMyIsImEiOiJjbWU4NTVsamswOWNuMmpwd29lZmx1OTNwIn0.1rtunFwJarUUNmyOKSdSYQ";

export default function Cacl() {
  const bottomSheetRef = useRef<any>(null);
  const mapCameraRef = useRef<any>(null);

  // Parameters to sync the enter origin and destination from fare calculator
  const params = useLocalSearchParams<{
    origin?: string;
    originCoords?: string;
    destination?: string;
    destinationCoords?: string;
    vehicleType?: string;
  }>();

  // Parse coords if available
  const initialPickup = params.originCoords
    ? (JSON.parse(params.originCoords) as [number, number])
    : [123.186389, 13.624444];

  const initialDestination = params.destinationCoords
    ? (JSON.parse(params.destinationCoords) as [number, number])
    : [123.19, 13.63];

  const [mapReady, setMapReady] = useState(false);
  const [pickup, setPickup] = useState<[number, number]>([
    123.186389, 13.624444,
  ]);
  const [destination, setDestination] = useState<[number, number]>([
    123.19, 13.63,
  ]);
  const [activeSelection, setActiveSelection] = useState<
    "pickup" | "destination" | null
  >(null);
  const [selectedRide, setSelectedRide] = useState<"solo" | "group" | null>(
    null
  );

  const [pickupAddress, setPickupAddress] = useState<string>(
    params.origin || ""
  );
  const [destinationAddress, setDestinationAddress] = useState<string>(
    params.destination || ""
  );

  const [pickupInput, setPickupInput] = useState(params.origin || "");
  const [destinationInput, setDestinationInput] = useState(
    params.destination || ""
  );

  const [pickupSuggestions, setPickupSuggestions] = useState<any[]>([]);
  const [destinationSuggestions, setDestinationSuggestions] = useState<any[]>(
    []
  );

  const [routeCoords, setRouteCoords] = useState<[number, number][]>([]);
  const [distance, setDistance] = useState<number>(0);
  const [eta, setETA] = useState<number>(0);
  const [fare, setFare] = useState<number>(0);

  // Debounce timer
  const debounceRef = useRef<NodeJS.Timeout | null>(null);

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

  // --- Fetch autocomplete suggestions ---
  const fetchSuggestions = async (
    query: string,
    type: "pickup" | "destination"
  ) => {
    if (!query) {
      type === "pickup"
        ? setPickupSuggestions([])
        : setDestinationSuggestions([]);
      return;
    }

    try {
      const url = `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(
        query
      )}.json?autocomplete=true&limit=5&bbox=122.8946,13.4011,123.7439,14.3504&access_token=${MAPBOX_TOKEN}`;

      const res = await fetch(url);
      const data = await res.json();

      if (data.features) {
        if (type === "pickup") {
          setPickupSuggestions(data.features);
        } else {
          setDestinationSuggestions(data.features);
        }
      }
    } catch (err) {
      console.log("Error fetching suggestions:", err);
    }
  };

  // --- Handle suggestion select ---
  const handleSuggestionSelect = (
    place: any,
    type: "pickup" | "destination"
  ) => {
    const coords: [number, number] = place.center;
    if (type === "pickup") {
      setPickup(coords);
      setPickupAddress(place.place_name);
      setPickupInput(place.place_name);
      setPickupSuggestions([]);
    } else {
      setDestination(coords);
      setDestinationAddress(place.place_name);
      setDestinationInput(place.place_name);
      setDestinationSuggestions([]);
    }

    mapCameraRef.current?.setCamera({
      centerCoordinate: coords,
      zoomLevel: 16,
      animationDuration: 500,
    });
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
            </View>
          </TouchableOpacity>
          <View style={calcStyles.tripPoint}>
            <TextInput
              style={[
                calcStyles.textInput,
                activeSelection === "pickup" && calcStyles.activeInput,
              ]}
              placeholder="Enter pickup address"
              value={pickupInput}
              onChangeText={(text) => {
                setPickupInput(text);
                if (debounceRef.current) clearTimeout(debounceRef.current);
                debounceRef.current = setTimeout(
                  () => fetchSuggestions(text, "pickup"),
                  300
                );
              }}
              onFocus={() => setActiveSelection("pickup")}
            />
          </View>
          {pickupSuggestions.map((sug, idx) => (
            <TouchableOpacity
              key={idx}
              style={calcStyles.suggestionItem}
              onPress={() => handleSuggestionSelect(sug, "pickup")}
            >
              <Text style={calcStyles.suggestionText}>{sug.place_name}</Text>
            </TouchableOpacity>
          ))}

          {/* Destination info */}
          <TouchableOpacity
            style={calcStyles.tripPoint}
            onPress={() => focusOnMarker("destination")}
          >
            <DestIcon style={calcStyles.icon2} />
            <View>
              <Text style={calcStyles.destText}>Destination</Text>
            </View>
          </TouchableOpacity>
          <View style={calcStyles.tripPoint}>
            <TextInput
              style={[
                calcStyles.textInput,
                activeSelection === "destination" && calcStyles.activeInput2,
              ]}
              placeholder="Enter destination address"
              value={destinationInput}
              onChangeText={(text) => {
                setDestinationInput(text);
                if (debounceRef.current) clearTimeout(debounceRef.current);
                debounceRef.current = setTimeout(
                  () => fetchSuggestions(text, "destination"),
                  300
                );
              }}
              onFocus={() => setActiveSelection("destination")}
            />
          </View>
          {destinationSuggestions.map((sug, idx) => (
            <TouchableOpacity
              key={idx}
              style={calcStyles.suggestionItem}
              onPress={() => handleSuggestionSelect(sug, "destination")}
            >
              <Text style={calcStyles.suggestionText}>{sug.place_name}</Text>
            </TouchableOpacity>
          ))}

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
              marginTop: 20,
            }}
          />
          <Text style={calcStyles.divider}>or</Text>
          <CustomButton
            title="Done"
            backgroundColor="#073051"
            onPress={() => router.push("/(feat)/farecalculator")}
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
    marginRight: 5,
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
  textInput: {
    borderWidth: 1,
    borderColor: "#CBCBCB",
    borderRadius: 10,
    padding: 10,
    width: "95%",
    marginBottom: 5,
    fontFamily: "Poppins",
    color: "#737F83",
  },
  activeInput: {
    borderColor: "#0D99FF",
    borderWidth: 2,
  },
  activeInput2: {
    borderColor: "#073051",
    borderWidth: 2,
  },
  suggestionItem: {
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
    width: "95%",
  },
  suggestionText: {
    fontSize: 14,
    color: "#333",
    fontFamily: "Poppins",
  },
});
