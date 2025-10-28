import React, { useEffect, useState } from "react";
import { Text, View, StyleSheet, ActivityIndicator, Alert } from "react-native";
import "@fontsource/poppins";
import BackButton from "@/components/Backbutton";
import ProfileIcon from "../../assets/images/prof.svg";
import DriverDetails from "@/components/DriverDetailsCard";
import CustomButton from "@/components/ui/CustomButton";
import { supabase } from "@/scripts/supabase";
import { router, useLocalSearchParams } from "expo-router";

interface DriverProfile {
  contact_number: string;
  plate_number: string;
  user_name: string;
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
      setLoading(true);
      setError(null);

      let driverId = Array.isArray(id) ? id[0] : id;

      if (!driverId) {
        setError("No driver ID provided");
        setLoading(false);
        return;
      }

      try {
        // Try to parse QR JSON (may contain userName or id)
        let parsedData: any = null;
        try {
          parsedData = JSON.parse(driverId);
          if (parsedData && parsedData.id) driverId = parsedData.id;
        } catch {}

        // Extract userName from QR if present
        let qrUserName = parsedData?.userName || null;

        // Fetch from driverprofiles
        const { data, error } = await supabase
          .from("driverprofiles")
          .select("phone_number, plate_number, operator_name, operator_address, status")
          .eq("id", driverId)
          .maybeSingle();

        if (error) throw error;

        if (!data) {
          setError("Driver not found. Please check if the QR code is valid.");
          return;
        }

        // If QR didn’t have userName, try getting from Auth metadata
        let userName = qrUserName;
        if (!userName) {
          const { data: userData } = await supabase.auth.getUser();
          const user = userData?.user;
          if (user && user.id === driverId) {
            userName =
              user.user_metadata?.name ||
              user.user_metadata?.full_name ||
              user.user_metadata?.display_name ||
              user.email ||
              "Unknown User";
          } else {
            userName = data.operator_name || "Unknown User";
          }
        }

        setDriver({
          contact_number: data.phone_number,
          plate_number: data.plate_number,
          user_name: userName,
          operator_address: data.operator_address,
          eligible: data.status,
        });
      } catch (err: any) {
        console.error("Error fetching driver:", err);
        setError("Failed to load driver details.");
      } finally {
        setLoading(false);
      }
    };

    fetchDriver();
  }, [id]);

  useEffect(() => {
    if (error) {
      Alert.alert("Error", error, [{ text: "OK", onPress: () => setError(null) }]);
    }
  }, [error]);

  return (
    <View style={styles.mainContainer}>
      <View style={styles.container}>
        <BackButton />
        <Text style={styles.header}>Driver Details</Text>
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
            <Text style={styles.name}>{driver.user_name}</Text>
            <DriverDetails
              contactNumber={driver.contact_number}
              plateNumber={driver.plate_number}
              operatorName={driver.user_name}
              operatorAddress={driver.operator_address}
              eligible={driver.eligible}
            />
            <CustomButton
              title="Report this Driver"
              style={styles.report}
              onPress={() => router.push("/(feat)/Complaints")}
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
    marginLeft: 50,
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
  errorContainer: { alignItems: "center", marginTop: 20, paddingHorizontal: 20 },
  errorText: {
    color: "red",
    fontSize: 18,
    fontWeight: "bold",
    textAlign: "center",
  },
  errorSubText: { color: "#666", fontSize: 14, textAlign: "center", marginTop: 10 },
  report: { backgroundColor: "#E53935" },
});
