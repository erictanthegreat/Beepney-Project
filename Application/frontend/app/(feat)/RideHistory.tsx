import React, { useEffect, useState } from "react";
import {
  Text,
  View,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
} from "react-native";
import "@fontsource/poppins";
import { supabase } from "@/scripts/supabase";
import BackButton from "@/components/Backbutton";
import EmptyStateIcon from "../../assets/images/empty.svg";
import OriginIcon from "@/assets/images/loc.svg";
import DestIcon from "@/assets/images/loc 2.svg";
export default function RideHistory() {
  const [rides, setRides] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchSavedFares = async () => {
    setLoading(true);
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        console.log("No user logged in");
        setRides([]);
        setLoading(false);
        return;
      }

      const { data, error } = await supabase
        .from("ride_history")
        .select("*")
        .or(`user_id.eq.${user.id},driver_id.eq.${user.id}`)
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Error fetching fares:", error);
      } else {
        setRides(data || []);
      }
    } catch (err) {
      console.error("Unexpected error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSavedFares();
  }, []);

  const isEmpty = !loading && rides.length === 0;

  return (
    <View style={styles.container}>
      <BackButton />
      <Text style={styles.header}>Ride History</Text>
      <Text style={styles.subHeader}>
        {isEmpty
          ? "Book Your Barkada Trip with Beepney."
          : "This is where your ride history are listed."}
      </Text>

      {loading ? (
        <ActivityIndicator
          size="large"
          color="#1E86DA"
          style={{ marginTop: 100 }}
        />
      ) : isEmpty ? (
        <View style={styles.emptyContainer}>
          <EmptyStateIcon />
          <Text style={styles.emptyText}>
            Whoops......Looks like there's {"\n"}nothing here.
          </Text>
        </View>
      ) : (
        <ScrollView style={styles.listContainer}>
          {rides.map((ride, index) => (
            <View key={ride.id || index} style={styles.card}>
              <View style={styles.rowBetween}>
                <OriginIcon />
                <Text style={styles.routeText}>
                  {ride.origin || "Unknown Origin"}
                </Text>
              </View>

              <View style={styles.rowBetween}>
                <DestIcon />
                <Text style={styles.routeText}>
                  {ride.destination || "Unknown Destination"}
                </Text>
              </View>
              <View style={styles.details}>
                <Text style={styles.detailText}>
                  Distance: {ride.distance_km?.toFixed(2)} km
                </Text>
                <Text style={styles.detailText}>
                  Base Fare: ₱ {ride.base_fare?.toFixed(2)}
                </Text>
                <Text style={styles.detailText}>
                  Discount: {ride.discount_percent} %
                </Text>
                <Text style={styles.totalText}>
                  Total Fare: ₱ {ride.total_fare?.toFixed(2)}
                </Text>
                <Text style={styles.dateText}>
                  {new Date(ride.created_at).toLocaleString()}
                </Text>
              </View>
            </View>
          ))}
        </ScrollView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  header: {
    fontWeight: "bold",
    fontSize: 25,
    marginLeft: 20,
    marginTop: 10,
    color: "#073051",
    fontFamily: "Poppins",
  },
  subHeader: {
    marginLeft: 25,
    color: "#595959",
    fontFamily: "Poppins",
  },
  listContainer: {
    marginTop: 20,
  },
  card: {
    backgroundColor: "#F8F9FB",
    borderRadius: 12,
    padding: 15,
    marginHorizontal: 20,
    marginBottom: 15,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  rowBetween: {
    justifyContent: "space-between",
    flexDirection: "row",
    gap: 10,
  },
  routeText: {
    fontWeight: "bold",
    fontSize: 14,
    color: "#073051",
    flex: 1,
    flexWrap: "wrap",
    fontFamily: "Poppins",
    marginBottom: 10,
  },

  detailText: {
    color: "#737F83",
    fontFamily: "Poppins",
    fontSize: 13,
    marginTop: 4,
  },
  totalText: {
    color: "#0D99FF",
    fontWeight: "bold",
    fontSize: 14,
    marginTop: 5,
    fontFamily: "Poppins",
  },
  dateText: {
    color: "#999",
    fontSize: 11,
    marginTop: 6,
    textAlign: "right",
    fontFamily: "Poppins",
  },
  emptyContainer: {
    alignItems: "center",
    marginTop: 150,
  },
  emptyText: {
    textAlign: "center",
    fontSize: 15,
    marginTop: 15,
    fontFamily: "Poppins",
  },
  details: {
    marginLeft: 20,
  },
});
