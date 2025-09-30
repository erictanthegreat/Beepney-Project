import React, { useEffect, useState } from "react";
import {
  Text,
  View,
  StyleSheet,
  ActivityIndicator,
  FlatList,
  Alert,
  Modal,
  TouchableOpacity,
} from "react-native";
import "@fontsource/poppins";
import BackButton from "@/components/Backbutton";
import TricyCallCard from "@/components/TricyCallCard";
import { supabase } from "scripts/supabase";

export default function RideHailingDriver() {
  const [rides, setRides] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedRide, setSelectedRide] = useState<any | null>(null);
  const [modalVisible, setModalVisible] = useState(false);

  useEffect(() => {
    const fetchRidesWithUsers = async () => {
      setLoading(true);
      try {
        const { data: ridesData, error: ridesError } = await supabase
          .from("tricycall")
          .select(
            "id, pick_up, destination, fare_price, user_id, payment_method, status"
          );

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
      }
    };

    fetchRidesWithUsers();
  }, []);

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
              .update({ status: "accepted" })
              .eq("id", ride.id);

            if (error) throw error;

            setRides((prev) =>
              prev.map((r) =>
                r.id === ride.id ? { ...r, status: "accepted" } : r
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
        <Text style={{ textAlign: "center", marginTop: 20 }}>
          No rides available
        </Text>
      ) : (
        <FlatList
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
});
