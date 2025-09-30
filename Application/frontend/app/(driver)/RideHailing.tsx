import React, { useEffect, useState } from "react";
import {
  Text,
  View,
  StyleSheet,
  ActivityIndicator,
  FlatList,
  Alert,
} from "react-native";
import "@fontsource/poppins";
import BackButton from "@/components/Backbutton";
import TricyCallCard from "@/components/TricyCallCard";
import { supabase } from "scripts/supabase";

export default function RideHailingDriver() {
  const [rides, setRides] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRidesWithUsers = async () => {
      setLoading(true);

      try {
        const { data: ridesData, error: ridesError } = await supabase
          .from("tricycall")
          .select("id, pick_up, destination, fare_price, user_id");

        if (ridesError) throw ridesError;

        if (!ridesData || ridesData.length === 0) {
          setRides([]);
          setLoading(false);
          return;
        }

        const userIds = ridesData
          .map((r) => r.user_id)
          .filter((id) => id !== null);

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
            if (parts.length === 1) {
              anonymized = parts[0]; // single name
            } else {
              anonymized = `${parts[0]} ${parts[1][0]}.`; // first name + first letter of last name
            }
          }

          return {
            ...ride,
            username: anonymized,
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
          data={rides}
          keyExtractor={(item) => item.id.toString()}
          renderItem={({ item }) => (
            <TricyCallCard
              pickup={item.pick_up}
              destination={item.destination}
              farePrice={item.fare_price}
              name={item.username}
            />
          )}
          contentContainerStyle={{ paddingBottom: 100, flexGrow: 1 }}
          showsVerticalScrollIndicator={false}
        />
      )}
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
});
