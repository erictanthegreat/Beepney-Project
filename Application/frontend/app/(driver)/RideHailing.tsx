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

  const fetchRidesWithUsers = useCallback(async () => {
    try {
      if (!refreshing) setLoading(true);

      const { data: ridesData, error: ridesError } = await supabase
        .from("tricycall")
        .select(
          "id, pick_up, destination, fare_price, user_id, payment_method, status"
        )
        .eq("status", "Pending");

      if (ridesError) throw ridesError;

      if (!ridesData || ridesData.length === 0) {
        setRides([]);
        setLoading(false);
        return;
      }

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

      const merged = ridesData.map((ride) => {
        const fullName = profilesData.find(
          (p) => p.id === ride.user_id
        )?.username;
        let anonymized = "Unknown";

        if (fullName) {
          const parts = fullName.split(" ");
          anonymized =
            parts.length === 1 ? parts[0] : `${parts[0]} ${parts[1][0]}.`;
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

  useEffect(() => {
    fetchRidesWithUsers();
  }, [fetchRidesWithUsers]);

  useEffect(() => {
    const channel = supabase
      .channel("tricycall-updates")
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "tricycall",
        },
        (payload) => {
          if (payload.new.status === "Accepted") {
            setRides((prev) => prev.filter((r) => r.id !== payload.new.id));
          }
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
            const { error } = await supabase
              .from("tricycall")
              .update({ status: "Accepted" })
              .eq("id", ride.id);

            if (error) throw error;

            setRides((prev) => prev.filter((r) => r.id !== ride.id));

            setModalVisible(false);
          } catch (err) {
            console.error(err);
            Alert.alert("Error", "Failed to accept ride.");
          }
        },
      },
    ]);
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
      ) : rides.length === 0 ? (
        <FlatList
          data={[]} 
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={["#073051"]}
            />
          }
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <EmptyStateIcon />
              <Text style={styles.emptyText}>
                Whoops......Looks like there's {"\n"}nothing here.
              </Text>
            </View>
          }
          contentContainerStyle={{ flexGrow: 1 }}
          renderItem={function (
            info: ListRenderItemInfo<any>
          ): React.ReactElement | null {
            throw new Error("Function not implemented.");
          }}
        />
      ) : (
        <FlatList
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={["#073051"]}
            />
          }
          data={rides}
          keyExtractor={(item) => item.id.toString()}
          renderItem={({ item }) => (
            <TouchableOpacity onPress={() => handleCardPress(item)}>
              <TricyCallCard
                pickup={item.pick_up}
                destination={item.destination}
                farePrice={item.fare_price}
                name={item.username}
                onAccept={() => handleAcceptRide(item)}
              />
            </TouchableOpacity>
          )}
          contentContainerStyle={{ paddingBottom: 100, flexGrow: 1 }}
          showsVerticalScrollIndicator={false}
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
                    : "Pending"}
                </Text>

                {selectedRide.status !== "accepted" && (
                  <TouchableOpacity
                    style={styles.acceptButton}
                    onPress={() => handleAcceptRide(selectedRide)}
                  >
                    <Text style={styles.acceptButtonText}>Accept Ride</Text>
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
