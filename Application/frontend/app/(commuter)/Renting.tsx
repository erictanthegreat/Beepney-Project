import React, { useState, useCallback, useEffect } from "react";
import {
  Text,
  View,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Platform,
  Linking,
  RefreshControl,
  ActivityIndicator,
} from "react-native";
import "@fontsource/poppins";
import BackButton from "@/components/Backbutton";
import EmptyStateIcon from "../../assets/images/empty.svg";
import { useFocusEffect } from "@react-navigation/native";
import ContactIcon from "@/assets/images/contact.svg";
import LocationIcon from "@/assets/images/location.svg";
import VehicleIcon from "@/assets/images/vehicle type.svg";
import Call from "@/assets/images/call-rental.svg";
import Chat from "@/assets/images/chat.svg";
import { useLocalSearchParams, router } from "expo-router";
import { supabase } from "@/scripts/supabase";

type Rental = {
  id: string; // Added ID for chat navigation
  name: string;
  contact: string;
  location: string;
  services: string[];
  vehicleType: "jeep" | "van" | "both";
};

export default function Renting() {
  const { contact } = useLocalSearchParams<{ contact: string }>();

  const [rentals, setRentals] = useState<Rental[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState<string | null>(null);

  // Get current user ID
  useEffect(() => {
    const getCurrentUser = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (user) {
        setUserId(user.id);
      }
    };
    getCurrentUser();
  }, []);

  const fetchRentals = async () => {
    try {
      if (!refreshing) setLoading(true);

      const { data, error } = await supabase
        .from("rental")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Error fetching rentals:", error.message);
        return;
      }

      if (data) {
        const rentals: Rental[] = data.map((row: any) => ({
          id: row.id, // Include the rental ID
          name: row.station_name,
          contact: row.contact_number,
          location: row.location,
          services: Array.isArray(row.service_offered)
            ? row.service_offered
            : row.service_offered
              ? row.service_offered.split(",").map((s: string) => s.trim())
              : [],
          vehicleType: row.types_of_vehicles,
        }));
        setRentals(rentals);
      }
    } catch (e) {
      console.error("Unexpected error fetching rentals", e);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchRentals();
    }, [])
  );

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchRentals();
  }, []);

  const makeaPhonecall = (phoneNumber: string) => {
    if (!phoneNumber) return;
    const url =
      Platform.OS === "android"
        ? `tel:${phoneNumber}`
        : `telprompt:${phoneNumber}`;
    Linking.openURL(url).catch((err) =>
      console.error("Error making call:", err)
    );
  };

  const openChat = (rental: Rental) => {
    if (!userId) {
      console.error("User not logged in");
      // Optional: Show an alert to the user
      // Alert.alert("Error", "Please log in to start a chat");
      return;
    }

    // Navigate to chat screen with rental info
    router.push({
      pathname: "/(feat)/Chat",
      params: {
        rentalId: rental.id,
        rentalName: rental.name,
        userId: userId,
      },
    });
  };

  const isEmpty = !loading && rentals.length === 0;

  return (
    <View style={{ flex: 1 }}>
      <View>
        <BackButton />
        <Text style={rentStyles.header}> Jeepney/Van Rental </Text>
        <Text
          style={{ marginLeft: 25, color: "#595959", fontFamily: "Poppins" }}
        >
          Book Your Barkada Trip with Beepney
        </Text>
      </View>

      {loading ? (
        <ActivityIndicator
          size="large"
          color="#073051"
          style={{ marginTop: 20 }}
        />
      ) : isEmpty ? (
        <ScrollView
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={["#073051"]}
            />
          }
          contentContainerStyle={rentStyles.emptyContainer}
        >
          <EmptyStateIcon />
          <Text style={rentStyles.emptyText}>
            Whoops......Looks like there's {"\n"}nothing here.
          </Text>
        </ScrollView>
      ) : (
        <ScrollView
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={["#073051"]}
            />
          }
          contentContainerStyle={{
            marginLeft: 25,
            marginTop: 20,
            paddingBottom: 100,
          }}
        >
          <Text style={rentStyles.subHeader}>Available for Renting</Text>
          {rentals.map((item, index) => (
            <View key={index} style={rentStyles.rentalCard}>
              <Text style={rentStyles.rentalName}>{item.name}</Text>
              <Text style={rentStyles.label}>
                <ContactIcon width={17} height={17} /> Contact No.
                <Text style={rentStyles.content}> {item.contact}</Text>
              </Text>
              <Text style={rentStyles.label}>
                <VehicleIcon width={17} height={17} /> Types of Vehicle(s):
                <Text style={rentStyles.content}> {item.vehicleType}</Text>
              </Text>
              <Text style={rentStyles.label}>
                <LocationIcon width={17} height={17} /> Location:
                <Text style={rentStyles.content}> {item.location}</Text>
              </Text>

              <Text style={rentStyles.label}>Services Offered: </Text>
              {item.services && item.services.length > 0 ? (
                item.services.map((service, idx) => (
                  <View
                    key={idx}
                    style={{
                      flexDirection: "row",
                      alignItems: "flex-start",
                      marginLeft: 15,
                      marginTop: 2,
                    }}
                  >
                    <Text style={{ fontSize: 20, color: "#0D99FF" }}>
                      {"\u2022"}
                    </Text>
                    <Text
                      style={[
                        rentStyles.content,
                        { marginLeft: 2, fontSize: 18 },
                      ]}
                    >
                      {service}
                    </Text>
                  </View>
                ))
              ) : (
                <Text style={[rentStyles.content, { marginLeft: 15 }]}>
                  No services listed
                </Text>
              )}
              <View style={rentStyles.contacts}>
                <TouchableOpacity onPress={() => makeaPhonecall(item.contact)}>
                  <Call />
                </TouchableOpacity>
                <TouchableOpacity onPress={() => openChat(item)}>
                  <Chat />
                </TouchableOpacity>
              </View>
            </View>
          ))}
        </ScrollView>
      )}
    </View>
  );
}

const rentStyles = StyleSheet.create({
  header: {
    fontWeight: "bold",
    alignItems: "flex-start",
    fontSize: 25,
    marginLeft: 20,
    marginTop: 10,
    color: "#073051",
  },
  subHeader: {
    color: "#073051",
    fontWeight: "bold",
    fontSize: 17,
    marginBottom: 10,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    marginBottom: 100,
    alignItems: "center",
  },
  emptyText: {
    textAlign: "center",
    fontSize: 15,
    marginTop: 15,
  },
  rentalCard: {
    backgroundColor: "white",
    padding: 12,
    borderRadius: 10,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#CCCCCC",
    width: "90%",
  },
  rentalName: {
    fontWeight: "bold",
    fontSize: 18,
    marginBottom: 5,
  },
  label: {
    color: "#073051",
    fontSize: 17,
    fontWeight: "bold",
    marginLeft: 5,
  },
  content: {
    color: "#0D99FF",
    fontFamily: "Poppins",
    fontWeight: "bold",
  },
  contacts: {
    flexWrap: "wrap",
    flexDirection: "row",
    justifyContent: "flex-end",
    gap: 5,
  },
});
