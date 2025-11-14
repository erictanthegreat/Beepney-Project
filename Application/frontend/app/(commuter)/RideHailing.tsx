import React, { useState, useRef, useEffect } from "react";
import {
  Text,
  View,
  StyleSheet,
  Dimensions,
  TouchableOpacity,
  TextInput,
  Animated,
  Modal,
  ScrollView,
  RefreshControl,
} from "react-native";
import { useNavigation } from "@react-navigation/native";

import { supabase } from "scripts/supabase";
import "@fontsource/poppins";
import Mapbox from "@rnmapbox/maps";
import * as Location from "expo-location";

import BackButton from "@/components/Backbutton";
import BottomSheetContainer from "@/components/BottomSheetContainer";
import CustomButton from "@/components/ui/CustomButton";
import PaymentMethod from "@/assets/images/payment method.svg";
import FindIcon from "../../assets/images/find.svg";
import OriginIcon from "@/assets/images/loc.svg";
import DestIcon from "@/assets/images/loc 2.svg";
import SoloIcon from "@/assets/images/solo.svg";
import GroupIcon from "../../assets/images/group.svg";
import KmIcon from "@/assets/images/km.svg";
import ETAIcon from "../../assets/images/eta.svg";
import FareIcon from "../../assets/images/money.svg";

const { width, height } = Dimensions.get("window");

const MAPBOX_TOKEN =
  "pk.eyJ1IjoiZXJpY3RhbjMzMyIsImEiOiJjbWU4NTVsamswOWNuMmpwd29lZmx1OTNwIn0.1rtunFwJarUUNmyOKSdSYQ";

const calculateTricycleFare = (
  distanceInKm: number,
  selectedRide: string | null
) => {
  const BASE_DISTANCE_KM = 4;
  const BASE_FARE_PESOS = 15;
  const SUCCEEDING_FARE_PER_KM = 15;
  const GROUP_FARE_ADDITIONAL = 5;
  const SEATS = 4;

  if (distanceInKm <= 0) return 0;

  let baseFare = BASE_FARE_PESOS;
  if (distanceInKm > BASE_DISTANCE_KM) {
    const additionalDistance = distanceInKm - BASE_DISTANCE_KM;
    const additionalFare =
      Math.ceil(additionalDistance) * SUCCEEDING_FARE_PER_KM;
    baseFare += additionalFare;
  }

  if (selectedRide === "solo") {
    return parseFloat((baseFare * SEATS).toFixed(2));
  } else if (selectedRide === "group") {
    return parseFloat(((baseFare + GROUP_FARE_ADDITIONAL) * SEATS).toFixed(2));
  }

  return parseFloat(BASE_FARE_PESOS.toFixed(2));
};

export default function RideHailing() {
  const navigation = useNavigation();
  const contentAnim = useRef(new Animated.Value(0)).current;
  const bottomSheetRef = useRef<any>(null);
  const mapCameraRef = useRef<any>(null);

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

  const [pickupAddress, setPickupAddress] = useState<string>("");
  const [destinationAddress, setDestinationAddress] = useState<string>("");
  const [pickupInput, setPickupInput] = useState<string>("");
  const [destinationInput, setDestinationInput] = useState<string>("");
  const [rideStatus, setRideStatus] = useState<
    "booking" | "waiting" | "toPickUp"
  >("booking");
  const [pickupSuggestions, setPickupSuggestions] = useState<any[]>([]);
  const [destinationSuggestions, setDestinationSuggestions] = useState<any[]>(
    []
  );
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<
    "cash" | "cashless" | null
  >(null);

  const [routeCoords, setRouteCoords] = useState<[number, number][]>([]);
  const [distance, setDistance] = useState<number>(0);
  const [eta, setETA] = useState<number>(0);
  const [fare, setFare] = useState<number>(0);

  const [waitingModalVisible, setWaitingModalVisible] = useState(false);
  const [currentRideId, setCurrentRideId] = useState<string | null>(null);
  const [paymentModalVisible, setPaymentModalVisible] = useState(false);
  const debounceRef = useRef<NodeJS.Timeout | null>(null);
  const [assignedDriver, setAssignedDriver] = useState<any | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  // Get user location
  useEffect(() => {
    (async () => {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        console.log("Location permission denied");
        return;
      }

      let location = await Location.getCurrentPositionAsync({});
      const coords: [number, number] = [
        location.coords.longitude,
        location.coords.latitude,
      ];

      setPickup(coords);
      fetchAddress(coords, "pickup");

      mapCameraRef.current?.setCamera({
        centerCoordinate: coords,
        zoomLevel: 16,
        animationDuration: 500,
      });
    })();
  }, []);

  // Fetch route
  const fetchRoute = async (start: [number, number], end: [number, number]) => {
    try {
      const url = `https://api.mapbox.com/directions/v5/mapbox/driving/${start[0]},${start[1]};${end[0]},${end[1]}?geometries=geojson&access_token=${MAPBOX_TOKEN}`;
      const res = await fetch(url);
      const data = await res.json();
      if (data.routes && data.routes.length > 0) {
        const route = data.routes[0];
        const calculatedDistance = route.distance / 1000;
        setRouteCoords(route.geometry.coordinates);
        setDistance(calculatedDistance);
        setETA(Math.ceil(route.duration / 60));
        setFare(calculateTricycleFare(calculatedDistance, selectedRide));
      }
    } catch (err) {
      console.log("Error fetching route:", err);
    }
  };

  useEffect(() => {
    Animated.timing(contentAnim, {
      toValue: waitingModalVisible ? 1 : 0,
      duration: 300,
      useNativeDriver: false,
    }).start();
  }, [waitingModalVisible]);

  useEffect(() => {
    if (pickup && destination) fetchRoute(pickup, destination);
  }, [pickup, destination, selectedRide]);

  // Fetch address
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
        if (type === "pickup") {
          setPickupAddress(placeName);
          setPickupInput(placeName);
        } else {
          setDestinationAddress(placeName);
          setDestinationInput(placeName);
        }
      }
    } catch (err) {
      console.log("Error fetching address:", err);
    }
  };

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
        type === "pickup"
          ? setPickupSuggestions(data.features)
          : setDestinationSuggestions(data.features);
      }
    } catch (err) {
      console.log("Error fetching suggestions:", err);
    }
  };

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
    fetchRoute(
      marker === "pickup" ? coords : pickup,
      marker === "destination" ? coords : destination
    );
  };

  const focusOnMarker = (marker: "pickup" | "destination") => {
    const coords = marker === "pickup" ? pickup : destination;
    mapCameraRef.current?.setCamera({
      centerCoordinate: coords,
      zoomLevel: 16,
      animationDuration: 500,
    });
    setActiveSelection(marker);
    bottomSheetRef.current?.close();
  };

  const handleConfirmHailing = async () => {
    if (!pickupAddress || !destinationAddress || !selectedRide) {
      alert("Please fill in all fields and select a ride.");
      return;
    }

    setTimeout(() => {
      setPaymentModalVisible(true);
    }, 200);
  };

  const handlePaymentSelection = async (method: "cash" | "cashless") => {
    setPaymentModalVisible(false);
    setSelectedPaymentMethod(method);

    setTimeout(async () => {
      try {
        const {
          data: { user },
        } = await supabase.auth.getUser();

        const { data, error } = await supabase
          .from("ride_requests")
          .insert([
            {
              pick_up: pickupAddress,
              destination: destinationAddress,
              selected_ride: selectedRide,
              fare_price: fare,
              user_id: user.id,
              payment_method: method,
              status: "pending",
            },
          ])
          .select();

        if (error) {
          console.error("Error inserting ride:", error);
          alert("Failed to book ride. Please try again.");
        } else if (data && data.length > 0) {
          setCurrentRideId(data[0].id);
          setWaitingModalVisible(true);
        }
      } catch (err) {
        console.error("Unexpected error:", err);
        alert("Something went wrong.");
      }
    }, 300);
  };

  const handleCancelRide = async () => {
    if (!currentRideId) return;
    const { error } = await supabase
      .from("ride_requests")
      .delete()
      .eq("id", currentRideId);
    if (error) {
      alert("Failed to cancel ride.");
    } else {
      setWaitingModalVisible(false);
      setCurrentRideId(null);
      setRideStatus("booking");
      setAssignedDriver(null);
      alert("Ride canceled.");
    }
  };

  const checkRideStatus = async () => {
    if (!currentRideId) return;

    // Fetch ride status from ride_requests
    const { data: rideData, error } = await supabase
      .from("ride_requests")
      .select("status")
      .eq("id", currentRideId)
      .single();

    if (error) {
      console.log(error);
      return;
    }

    // Fetch assigned driver from ride_assignments
    if (rideData) {
      const { data: assignmentData, error: assignmentError } = await supabase
        .from("ride_assignments")
        .select("driver_id")
        .eq("ride_id", currentRideId)
        .single();

      if (assignmentData?.driver_id) {
        const { data: driverData, error: driverError } = await supabase
          .from("profiles")
          .select("username, phone_number")
          .eq("id", assignmentData.driver_id)
          .single();

        if (!driverError && driverData) setAssignedDriver(driverData);
        setRideStatus("toPickUp");
        setWaitingModalVisible(false);
      }
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await checkRideStatus();
    setRefreshing(false);
  };

  useEffect(() => {
    if (!currentRideId) return;

    const channel = supabase
      .channel(`ride-status-${currentRideId}`)
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "ride_requests",
          filter: `id=eq.${currentRideId}`,
        },
        async (payload) => {
          console.log("Realtime payload:", payload.new);

          const { status, driver_id } = payload.new;

          if (status === "accepted" && driver_id) {
            try {
              // Fetch driver username
              const { data: profileData, error: profileError } = await supabase
                .from("profiles")
                .select("username")
                .eq("id", driver_id)
                .maybeSingle();

              if (profileError) console.error("Error fetching driver profile:", profileError);

              // Fetch driver phone
              const { data: driverProfileData, error: driverProfileError } = await supabase
                .from("driverprofiles")
                .select("phone_number")
                .eq("profile_id", driver_id) // <-- make sure this column is correct
                .maybeSingle();

              if (driverProfileError) console.error("Error fetching driver phone:", driverProfileError);

              // Combine safely
              const driverData = {
                username: profileData?.username || "Unknown",
                phone_number: driverProfileData?.phone_number || "N/A",
              };

              setAssignedDriver(driverData);
              setRideStatus("toPickUp");
              setWaitingModalVisible(false);
            } catch (err) {
              console.error("Error fetching driver data:", err);
            }
          }

          if (status === "cancelled") {
            alert("Your ride has been cancelled by the driver.");
            setRideStatus("booking");
            setWaitingModalVisible(false);
            setCurrentRideId(null);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [currentRideId]);

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
            ref={mapCameraRef}
            zoomLevel={13}
            centerCoordinate={pickup}
          />
        )}

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

        <Mapbox.PointAnnotation
          id="pickup"
          coordinate={pickup}
          draggable
          onDragEnd={(e) =>
            handleDragEnd(e.geometry.coordinates as [number, number], "pickup")
          }
        >
          <OriginIcon width={30} height={30} />
        </Mapbox.PointAnnotation>

        <Mapbox.PointAnnotation
          id="destination"
          coordinate={destination}
          draggable
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

      {/* Header */}
      <View>
        <BackButton />
        <Text style={rideStyles.header}>TricyCall</Text>
        <Text style={rideStyles.subHeader}>
          Book your tricycle—fast, safe, local.
        </Text>
      </View>

      {/* Floating button */}
      <View style={rideStyles.bttContainer}>
        <TouchableOpacity
          style={rideStyles.button}
          onPress={() => bottomSheetRef.current?.open()}
        >
          <FindIcon style={rideStyles.icon} />
          <Text style={rideStyles.btext}>Where to go?</Text>
        </TouchableOpacity>
      </View>

      <Modal
        visible={paymentModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setPaymentModalVisible(false)}
      >
        <View style={rideStyles.modalOverlay}>
          <View style={rideStyles.modalContent}>
            <Text style={rideStyles.modalHeader}>Choose Payment Method</Text>
            <TouchableOpacity
              style={rideStyles.paymentButton}
              onPress={() => handlePaymentSelection("cash")}
            >
              <Text style={rideStyles.paymentText}>Cash</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={rideStyles.paymentButton}
              onPress={() => handlePaymentSelection("cashless")}
            >
              <Text style={rideStyles.paymentText}>Pay Cashless</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[rideStyles.paymentButton, { backgroundColor: "#CBCBCB" }]}
              onPress={() => setPaymentModalVisible(false)}
            >
              <Text style={rideStyles.paymentText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Bottom Sheet */}
      <BottomSheetContainer ref={bottomSheetRef}>
        <ScrollView
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
        >
          <Animated.View
            style={{
              height: contentAnim.interpolate({
                inputRange: [0, 1],
                outputRange: [1000, 1000],
              }),
              overflow: "hidden",
            }}
          >
            {waitingModalVisible ? (
              <View style={rideStyles.waitcontainer}>
                <Text
                  style={{ fontSize: 20, fontWeight: "bold", color: "#073051" }}
                >
                  Waiting for a driver...
                </Text>

                <View style={rideStyles.line}></View>
                <View style={rideStyles.waitcont}>
                  <OriginIcon style={rideStyles.icon2} />
                  <Text style={rideStyles.pickText}>Pickup: </Text>
                </View>
                <Text style={rideStyles.waitText}>{pickupAddress}</Text>

                <View style={{ flexDirection: "row" }}>
                  <DestIcon style={rideStyles.icon2} />
                  <Text style={rideStyles.destText}>Destination:</Text>
                </View>
                <Text style={rideStyles.waitText}> {destinationAddress}</Text>

                <View style={{ flexDirection: "row" }}>
                  <PaymentMethod style={rideStyles.icon2} />
                  <Text style={rideStyles.destText}>Payment Method</Text>
                </View>
                <Text style={rideStyles.waitText2}>
                  {selectedPaymentMethod === "cash" ? "Cash" : "Cashless"}
                </Text>
                <View style={rideStyles.line}></View>

                <View style={rideStyles.waitSumm}>
                  <View style={rideStyles.iconWithText}>
                    <KmIcon />
                    <Text style={rideStyles.text2}>
                      {distance.toFixed(2)} km
                    </Text>
                  </View>

                  <View style={rideStyles.iconWithText}>
                    <FareIcon />
                    <Text style={rideStyles.waitSumText}>
                      ₱{fare.toFixed(2)}
                    </Text>
                  </View>

                  <View style={rideStyles.iconWithText}>
                    <SoloIcon width={20} height={15} color={"#CBCBCB"} />
                    <Text style={rideStyles.waitSumText}> {selectedRide}</Text>
                  </View>
                </View>

                <CustomButton
                  title="Cancel Ride"
                  backgroundColor="#FF4D4F"
                  onPress={handleCancelRide}
                  style={{ marginTop: 80, alignSelf: "center" }}
                />
              </View>
            ) : rideStatus === "toPickUp" && assignedDriver ? (
              <View style={rideStyles.waitcontainer}>
                <Text
                  style={{ fontSize: 20, fontWeight: "bold", color: "#073051" }}
                >
                  Driver on the way!
                </Text>

                <View style={rideStyles.line}></View>
                <Text>Driver Details</Text>

                <View>
                  <Text>Name:</Text>
                  <Text>{assignedDriver.username || "N/A"}</Text>
                </View>

                <View>
                  <Text>Contact:</Text>
                  <Text>{assignedDriver.phone_number || "N/A"}</Text>
                </View>

                <View style={rideStyles.line}></View>

                <View style={rideStyles.waitcont}>
                  <OriginIcon style={rideStyles.icon2} />
                  <Text style={rideStyles.pickText}>Pickup: </Text>
                </View>
                <Text style={rideStyles.waitText}>{pickupAddress}</Text>

                <View style={{ flexDirection: "row" }}>
                  <DestIcon style={rideStyles.icon2} />
                  <Text style={rideStyles.destText}>Destination:</Text>
                </View>
                <Text style={rideStyles.waitText}> {destinationAddress}</Text>

                <View style={{ flexDirection: "row" }}>
                  <PaymentMethod style={rideStyles.icon2} />
                  <Text style={rideStyles.destText}>Payment Method</Text>
                </View>
                <Text style={rideStyles.waitText2}>
                  {selectedPaymentMethod === "cash" ? "Cash" : "Cashless"}
                </Text>
                <View style={rideStyles.line}></View>

                <View style={rideStyles.waitSumm}>
                  <View style={rideStyles.iconWithText}>
                    <KmIcon />
                    <Text style={rideStyles.text2}>
                      {distance.toFixed(2)} km
                    </Text>
                  </View>

                  <View style={rideStyles.iconWithText}>
                    <FareIcon />
                    <Text style={rideStyles.waitSumText}>
                      ₱{fare.toFixed(2)}
                    </Text>
                  </View>

                  <View style={rideStyles.iconWithText}>
                    <SoloIcon width={20} height={15} color={"#CBCBCB"} />
                    <Text style={rideStyles.waitSumText}> {selectedRide}</Text>
                  </View>
                </View>
              </View>
            ) : (
              <View style={rideStyles.bsCont}>
                <Text style={rideStyles.label}>Your Trip</Text>

                <TouchableOpacity
                  style={rideStyles.tripPoint}
                  onPress={() => focusOnMarker("pickup")}
                >
                  <OriginIcon style={rideStyles.icon2} />
                  <Text style={rideStyles.pickText}>Pick Up</Text>
                </TouchableOpacity>
                <TextInput
                  style={[
                    rideStyles.textInput,
                    activeSelection === "pickup" && rideStyles.activeInput,
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
                {pickupSuggestions.map((sug, idx) => (
                  <TouchableOpacity
                    key={idx}
                    onPress={() => handleSuggestionSelect(sug, "pickup")}
                  >
                    <Text>{sug.place_name}</Text>
                  </TouchableOpacity>
                ))}

                <TouchableOpacity
                  style={rideStyles.tripPoint}
                  onPress={() => focusOnMarker("destination")}
                >
                  <DestIcon style={rideStyles.icon2} />
                  <Text style={rideStyles.destText}>Destination</Text>
                </TouchableOpacity>
                <TextInput
                  style={[
                    rideStyles.textInput,
                    activeSelection === "destination" &&
                      rideStyles.activeInput2,
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
                {destinationSuggestions.map((sug, idx) => (
                  <TouchableOpacity
                    key={idx}
                    onPress={() => handleSuggestionSelect(sug, "destination")}
                  >
                    <Text>{sug.place_name}</Text>
                  </TouchableOpacity>
                ))}

                <View style={rideStyles.line}></View>
                <Text style={rideStyles.label}>Select Ride</Text>
                <View style={rideStyles.rideCont}>
                  <TouchableOpacity
                    style={[
                      rideStyles.rideButton,
                      selectedRide === "solo" && rideStyles.selectedButton,
                    ]}
                    onPress={() => setSelectedRide("solo")}
                  >
                    <SoloIcon
                      width={30}
                      height={30}
                      color={selectedRide === "solo" ? "#0D99FF" : "#CBCBCB"}
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

                  <TouchableOpacity
                    style={[
                      rideStyles.rideButton,
                      selectedRide === "group" && rideStyles.selectedButton,
                    ]}
                    onPress={() => setSelectedRide("group")}
                  >
                    <GroupIcon
                      width={30}
                      height={30}
                      color={selectedRide === "group" ? "#0D99FF" : "#CBCBCB"}
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

                <View style={rideStyles.line}></View>

                <View style={rideStyles.iconCont}>
                  <View style={rideStyles.iconWithText}>
                    <KmIcon />
                    <Text style={rideStyles.text2}>
                      {distance.toFixed(2)} km
                    </Text>
                  </View>
                  <View style={rideStyles.iconWithText}>
                    <ETAIcon />
                    <Text style={rideStyles.text2}>{eta} min</Text>
                  </View>
                  <View style={rideStyles.iconWithText}>
                    <FareIcon />
                    <Text style={rideStyles.text2}>₱{fare.toFixed(2)}</Text>
                  </View>
                </View>

                <CustomButton
                  title="Confirm Hailing"
                  backgroundColor="#073051"
                  onPress={handleConfirmHailing}
                  style={{ marginTop: 30, alignSelf: "center" }}
                />
              </View>
            )}
          </Animated.View>
        </ScrollView>
      </BottomSheetContainer>
    </View>
  );
}

const rideStyles = StyleSheet.create({
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
    top: 640,
    alignItems: "center",
    justifyContent: "center",
    position: "absolute",
    width: "100%",
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
    alignItems: "center",
  },
  icon: { marginLeft: 20 },
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
  pickText: {
    color: "#1E86DA",
    fontWeight: "bold",
    fontSize: 16,
  },
  destText: {
    color: "#073051",
    fontWeight: "bold",
    fontSize: 16,
    marginBottom: 5,
  },
  icon2: {
    marginRight: 10,
  },
  tripPoint: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 2,
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
  selectedButton: {
    borderColor: "#0D99FF",
    borderWidth: 2,
  },
  text: {
    fontSize: 13,
    color: "#CBCBCB",
    marginTop: 5,
  },
  iconCont: {
    flexDirection: "row",
    justifyContent: "space-around",
  },
  iconWithText: {
    alignItems: "center",
    flexDirection: "row",
  },
  text2: {
    marginLeft: 5,
    fontFamily: "Poppins",
    color: "#737F83",
    marginTop: 5,
  },
  waitcontainer: {
    padding: 20,
  },
  waitcont: {
    flexDirection: "row",
  },
  waitText: {
    color: "#737F83",
    fontFamily: "Poppins",
    textAlign: "left",
    marginLeft: 25,
    marginBottom: 10,
  },
  waitText2: {
    color: "#737F83",
    fontFamily: "Poppins",
    textAlign: "left",
    marginLeft: 35,
    marginBottom: 10,
  },
  waitSumm: {
    flexDirection: "row",
    justifyContent: "space-around",
  },
  waitSumText: {
    color: "#737F83",
    fontFamily: "Poppins",
    marginLeft: 5,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContent: {
    width: "85%",
    backgroundColor: "#fff",
    borderRadius: 15,
    padding: 20,
    alignItems: "center",
  },
  modalHeader: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 20,
    color: "#073051",
  },
  paymentButton: {
    width: "100%",
    padding: 15,
    backgroundColor: "#0D99FF",
    borderRadius: 10,
    alignItems: "center",
    marginBottom: 15,
  },
  paymentText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 16,
  },
});