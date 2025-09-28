import React, { useEffect, useState } from "react";
import { Text, View, StyleSheet, ActivityIndicator } from "react-native";
import "@fontsource/poppins";
import BackButton from "@/components/Backbutton";
import ProfileIcon from "../../assets/images/prof.svg";
import DriverDetailsCard from "@/components/DriverDetailsCard";
import { supabase } from "@/scripts/supabase";
import { useLocalSearchParams } from "expo-router";

interface DriverProfile {
  contact_number: string;
  plate_number: string;
  operator_name: string;
  operator_address: string;
  eligible: string;
}

export default function DriverDets() {
  const { id } = useLocalSearchParams();
  const [driver, setDriver] = useState<DriverProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchDriver = async () => {
      if (!id) {
        setError("Driver ID not provided");
        setLoading(false);
        return;
      }

      setLoading(true);
      setError(null);

      try {
        const { data, error } = await supabase
          .from("driverprofiles")
          .select(
            "phone_number, plate_number, operator_name, operator_address, verified"
          )
          .eq("id", id)
          .single();

        if (error) setError("Driver not found or invalid ID");
        else if (data)
          setDriver({
            contact_number: data.phone_number,
            plate_number: data.plate_number,
            operator_name: data.operator_name,
            operator_address: data.operator_address,
            eligible: data.verified ? "yes" : "no",
          });
        else setError("Driver not found");
      } catch (err) {
        setError("An unexpected error occurred");
      } finally {
        setLoading(false);
      }
    };

    fetchDriver();
  }, [id]);

  return (
    <View style={styles.mainContainer}>
      <View style={styles.container}>
        <BackButton />
        <Text style={styles.header}> Driver Details </Text>
      </View>

      <View style={styles.profile}>
        <ProfileIcon />
        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#073051" />
            <Text style={styles.loadingText}>Loading driver details...</Text>
          </View>
        ) : driver ? (
          <>
            <Text style={styles.name}>{driver.operator_name}</Text>
            <DriverDetailsCard
              operatorName={driver.operator_name}
              plateNumber={driver.plate_number}
              contactNumber={driver.contact_number}
              operatorAddress={driver.operator_address}
              eligible={driver.eligible}
            />
          </>
        ) : (
          <View style={styles.errorContainer}>
            <Text style={styles.errorText}>{error || "Driver not found"}</Text>
            <Text style={styles.errorSubText}>
              Please check the QR code and try again
            </Text>
          </View>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  mainContainer: { flex: 1, backgroundColor: "#fff" },
  header: {
    fontWeight: "bold",
    fontSize: 25,
    marginTop: 50,
    alignSelf: "center",
    color: "#073051",
    fontFamily: "Poppins",
    textAlign: "center",
  },
  container: { flexDirection: "row", alignItems: "center" },
  profile: { alignItems: "center", marginTop: 40, paddingHorizontal: 20 },
  name: {
    fontWeight: "bold",
    color: "#073051",
    fontSize: 25,
    paddingTop: 20,
    marginBottom: 20,
    textAlign: "center",
  },
  loadingContainer: { alignItems: "center", marginTop: 20 },
  loadingText: { marginTop: 10, color: "#073051", fontSize: 16 },
  errorContainer: {
    alignItems: "center",
    marginTop: 20,
    paddingHorizontal: 20,
  },
  errorText: {
    color: "red",
    fontSize: 18,
    fontWeight: "bold",
    textAlign: "center",
  },
  errorSubText: {
    color: "#666",
    fontSize: 14,
    textAlign: "center",
    marginTop: 10,
  },
});
