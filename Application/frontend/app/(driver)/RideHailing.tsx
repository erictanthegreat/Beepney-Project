import React, { useEffect, useState, useCallback } from "react";
import {
  Text,
  View,
  StyleSheet,
  ActivityIndicator,
  FlatList,
  Alert,
  Modal,
  TouchableOpacity,
  RefreshControl,
  ListRenderItemInfo,
} from "react-native";
import "@fontsource/poppins";
import BackButton from "@/components/Backbutton";
import TricyCallCard from "@/components/TricyCallCard";
import EmptyStateIcon from "../../assets/images/empty.svg";
import { supabase } from "scripts/supabase";

export default function RideHailingDriver() {
  const [rides, setRides] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedRide, setSelectedRide] = useState<any | null>(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  // ✅ Fetch rides including pending and accepted rides assigned to this driver
  const fetchRidesWithUsers = useCallback(async () => {
    try {
      if (!refreshing) setLoading(true);

      // Get current logged-in user
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (userError) throw userError;
      if (!user) throw new Error("No user logged in");

      // Fetch rides: pending + accepted rides for this driver
      const { data: ridesData, error: ridesError } = await supabase
        .from("ride_requests")
        .select("id, pick_up, destination, fare_price, user_id, payment_method, status, driver_id")
        .or(`status.eq.pending,driver_id.eq.${user.id},status.eq.accepted`);

      if (ridesError) throw ridesError;

      if (!ridesData || ridesData.length === 0) {
        setRides([]);
        setLoading(false);
        return;
      }

      // Fetch usernames for the rides
      const userIds = ridesData.map((r) => r.user_id).filter(Boolean);

      let profilesData: any[] = [];
      if (userIds.length > 0) {
        const { data, error } = await supabase
          .from("profiles")
          .select("id, username")
          .in("id", userIds);
        if (error) throw error;
        profilesData = data || [];
      }

      // Merge ride data with anonymized username
      const merged = ridesData.map((ride) => {
        const fullName = profilesData.find((p) => p.id === ride.user_id)?.username;
        let anonymized = "Unknown";

        if (fullName) {
          const parts = fullName.split(" ");
          anonymized = parts.length === 1 ? parts[0] : `${parts[0]} ${parts[1][0]}.`;
        }

        return {
          ...ride,
          username: anonymized,
          payment_method_label:
            ride.payment_method === "cash"
              ? "Cash"
              : ride.payment_method === "cashless"
              ? "Cashless"
              : "Unknown",
        };
      });

      setRides(merged);
    } catch (err) {
      console.error("Error fetching rides:", err);
      Alert.alert("Error", "Failed to fetch rides. Try again later.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [refreshing]);

  // Fetch rides on mount
  useEffect(() => {
    fetchRidesWithUsers();
  }, [fetchRidesWithUsers]);

  // Real-time updates for ride_requests
  useEffect(() => {
    const channel = supabase
      .channel("ride_requests-updates")
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "ride_requests",
        },
        (payload) => {
          const updatedRide = payload.new;
          setRides((prevRides) =>
            prevRides.map((ride) =>
              ride.id === updatedRide.id ? { ...ride, ...updatedRide } : ride
            )
          );
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchRidesWithUsers();
  }, [fetchRidesWithUsers]);

  const handleCardPress = (ride: any) => {
    setSelectedRide(ride);
    setModalVisible(true);
  };

  const handleAcceptRide = async (ride: any) => {
    Alert.alert("Accept Ride", "Do you really want to accept this ride?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Yes",
        onPress: async () => {
          try {
            const { data: { user }, error: userError } = await supabase.auth.getUser();
            if (userError) throw userError;
            if (!user) throw new Error("No user logged in");

            // Insert into ride_assignments
            const { error: assignError } = await supabase
              .from("ride_assignments")
              .insert({
                ride_id: ride.id,
                driver_id: user.id,
                status: "accepted",
              });
            if (assignError) throw assignError;

            // Update ride_requests status
            const { error: updateError } = await supabase
              .from("ride_requests")
              .update({ status: "accepted", driver_id: user.id })
              .eq("id", ride.id);
            if (updateError) throw updateError;

            // Update local state
            setRides((prevRides) =>
              prevRides.map((r) =>
                r.id === ride.id ? { ...r, status: "accepted", driver_id: user.id } : r
              )
            );
            setModalVisible(false);
          } catch (err) {
            console.error(err);
            Alert.alert("Error", "Failed to accept ride.");
          }
        },
      },
    ]);
  };

  const handleCancelRide = async (ride: any) => {
    try {
      const { error } = await supabase
        .from("ride_requests")
        .update({ status: "cancelled" })
        .eq("id", ride.id);
      if (error) throw error;

      // Update local state
      setRides((prevRides) =>
        prevRides.map((r) =>
          r.id === ride.id ? { ...r, status: "cancelled" } : r
        )
      );
    } catch (err) {
      console.error("Failed to cancel ride:", err);
    }
  };

  return (
    <View style={styles.container}>
      <BackButton />
      <Text style={styles.header}>TricyCall</Text>
      <Text style={styles.subHeader}>
        Book your tricycle—fast, safe, local.
      </Text>

      {loading ? (
        <ActivityIndicator
          size="large"
          color="#073051"
          style={{ marginTop: 20 }}
        />
      ) : (
        <FlatList
          data={rides} // all rides, including accepted
          keyExtractor={(item) => item.id.toString()}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={["#073051"]}
            />
          }
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ flexGrow: 1, paddingBottom: 100 }}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <EmptyStateIcon />
              <Text style={styles.emptyText}>
                Whoops......Looks like there's {"\n"}nothing here.
              </Text>
            </View>
          }
          renderItem={({ item }) => (
            <TouchableOpacity onPress={() => handleCardPress(item)}>
              <TricyCallCard
                pickup={item.pick_up}
                destination={item.destination}
                farePrice={item.fare_price}
                name={item.username}
                status={item.status} // pass status
                onAccept={() =>
                  item.status === "pending" && handleAcceptRide(item)
                }
                onCancel={() =>
                  item.status === "accepted" && handleCancelRide(item)
                }
              />
            </TouchableOpacity>
          )}
        />
      )}

      {/* Ride Details Modal */}
      <Modal
        visible={modalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalHeader}>Ride Summary</Text>
            {selectedRide && (
              <>
                <Text style={styles.modalName}>
                  Name: {selectedRide.username}
                </Text>
                <Text style={styles.modalText}>
                  Pickup: {selectedRide.pick_up}
                </Text>
                <Text style={styles.modalText}>
                  Destination: {selectedRide.destination}
                </Text>
                <Text style={styles.modalText}>
                  Payment Method: {selectedRide.payment_method_label}
                </Text>
                <Text style={styles.modalText}>
                  Fare: ₱{selectedRide.fare_price}
                </Text>
                <Text style={styles.modalText}>
                  Status:{" "}
                  {selectedRide.status
                    ? selectedRide.status.charAt(0).toUpperCase() +
                      selectedRide.status.slice(1)
                    : "pending"}
                </Text>

                {selectedRide.status !== "accepted" &&
                  selectedRide.status !== "cancelled" && (
                    <TouchableOpacity
                      style={styles.acceptButton}
                      onPress={() => handleAcceptRide(selectedRide)}
                    >
                      <Text style={styles.acceptButtonText}>Accept Ride</Text>
                    </TouchableOpacity>
                  )}

                {/* ✅ Cancel button */}
                {selectedRide.status !== "cancelled" && (
                  <TouchableOpacity
                    style={[styles.acceptButton, { backgroundColor: "#FF4C4C" }]}
                    onPress={() => handleCancelRide(selectedRide)}
                  >
                    <Text style={styles.acceptButtonText}>Cancel Ride</Text>
                  </TouchableOpacity>
                )}
              </>
            )}
            <TouchableOpacity
              style={styles.closeButton}
              onPress={() => setModalVisible(false)}
            >
              <Text style={styles.closeButtonText}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
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
  subHeader: {
    marginLeft: 25,
    color: "#595959",
    fontFamily: "Poppins",
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
    alignItems: "flex-start",
  },
  modalHeader: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 15,
    color: "#073051",
  },
  modalName: {
    fontSize: 20,
    marginBottom: 10,
    fontFamily: "Poppins",
    color: "#1E86DA",
  },
  modalText: {
    fontSize: 16,
    marginBottom: 10,
    fontFamily: "Poppins",
  },
  closeButton: {
    alignSelf: "stretch",
    backgroundColor: "#073051",
    paddingVertical: 10,
    marginTop: 15,
    borderRadius: 10,
    alignItems: "center",
  },
  closeButtonText: {
    color: "#fff",
    fontWeight: "bold",
  },
  acceptButton: {
    alignSelf: "stretch",
    backgroundColor: "#0D99FF",
    paddingVertical: 10,
    marginTop: 10,
    borderRadius: 10,
    alignItems: "center",
  },
  acceptButtonText: {
    color: "#fff",
    fontWeight: "bold",
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
    fontFamily: "Poppins",
    color: "#595959",
  },
});