import React, { useEffect, useState } from "react";
import { Text, View, StyleSheet, ActivityIndicator, Alert } from "react-native";
import "@fontsource/poppins";
import BackButton from "@/components/Backbutton";
import ProfileIcon from "../../assets/images/prof.svg";
import DriverDetails from "@/components/DriverDetailsCard";
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
      console.log("Fetching driver with id:", id);
      setLoading(true);
      setError(null);

      // Handle the ID from route params
      let driverId = Array.isArray(id) ? id[0] : id;

      if (!driverId) {
        console.warn("No ID provided in route params");
        setError("No driver ID provided");
        setLoading(false);
        return;
      }

      // If the QR contains JSON data, parse it to get the actual ID
      try {
        const parsedData = JSON.parse(driverId);
        if (parsedData && parsedData.id) {
          driverId = parsedData.id;
          console.log("Extracted ID from QR JSON:", driverId);
        }
      } catch (parseError) {
        // If parsing fails, assume driverId is the actual ID (simple string)
        console.log("QR contains simple ID:", driverId);
      }

      // Convert to appropriate types for testing
      const stringId = String(driverId);
      const numberId = isNaN(Number(driverId)) ? null : Number(driverId);

      try {
        console.log("Querying database with driver ID:", driverId);
        console.log("String version:", stringId, "Number version:", numberId);

        // First try with the original ID
        let { data, error } = await supabase
          .from("driverprofiles")
          .select(
            "phone_number, plate_number, operator_name, operator_address, status"
          )
          .eq("id", driverId);

        if ((!data || data.length === 0) && numberId !== null) {
          console.log("Retrying with number ID:", numberId);
          const result = await supabase
            .from("driverprofiles")
            .select(
              "phone_number, plate_number, operator_name, operator_address, status"
            )
            .eq("id", numberId);

          data = result.data;
          error = result.error;
        }

        // If still no results, try with string version
        if ((!data || data.length === 0) && stringId !== String(driverId)) {
          console.log("Retrying with string ID:", stringId);
          const result = await supabase
            .from("driverprofiles")
            .select(
              "phone_number, plate_number, operator_name, operator_address, status"
            )
            .eq("id", stringId);

          data = result.data;
          error = result.error;
        }

        if (error) {
          console.error("Supabase error:", error);
          console.log("Error details:", {
            message: error.message,
            code: error.code,
            hint: error.hint,
          });

          // Debug: Check if the table exists and has data
          console.log("Attempting to fetch sample data for debugging...");
          const { data: allDrivers, error: allError } = await supabase
            .from("driverprofiles")
            .select("id, operator_name")
            .limit(10);

          if (allDrivers && allDrivers.length > 0) {
            console.log("Sample driver records:", allDrivers);
            console.log("Looking for ID:", driverId, "Type:", typeof driverId);

            // Check if any ID matches when converted to string/number
            const matches = allDrivers.filter(
              (d) =>
                String(d.id) === String(driverId) ||
                d.id === driverId ||
                (numberId !== null && Number(d.id) === numberId)
            );
            console.log("Potential matches:", matches);

            console.log(
              "Available IDs:",
              allDrivers.map((d) => ({
                id: d.id,
                type: typeof d.id,
                stringVersion: String(d.id),
                numberVersion: Number(d.id),
              }))
            );
          } else if (allError) {
            console.error("Error fetching sample data:", allError);
          } else {
            console.log("No drivers found in database");
          }

          setError(`Database error: ${error.message}`);
        } else if (data && data.length > 0) {
          console.log("Driver data found:", data[0]);
          const driverData = data[0];
          setDriver({
            contact_number: driverData.phone_number,
            plate_number: driverData.plate_number,
            operator_name: driverData.operator_name,
            operator_address: driverData.operator_address,
            eligible: driverData.status,
          });
        } else {
          console.log("No driver found with ID:", driverId);

          // Additional debug info when no driver is found
          console.log("Attempting to fetch all driver IDs for comparison...");
          const { data: allDrivers, error: debugError } = await supabase
            .from("driverprofiles")
            .select("id, operator_name")
            .limit(20);

          if (allDrivers && allDrivers.length > 0) {
            console.log(
              "All driver IDs in database:",
              allDrivers.map((d) => ({
                id: d.id,
                name: d.operator_name,
                type: typeof d.id,
              }))
            );
            console.log("Searched for ID:", driverId, "Type:", typeof driverId);
          }

          setError(
            "Driver not found. Please check if the QR code is valid and the driver profile exists."
          );
        }
      } catch (err) {
        console.error("Unexpected error:", err);
        setError("An unexpected error occurred while fetching driver details");
      } finally {
        setLoading(false);
      }
    };

    fetchDriver();
  }, [id]);

  useEffect(() => {
    if (error) {
      Alert.alert("Error", error, [
        { text: "OK", onPress: () => setError(null) },
      ]);
    }
  }, [error]);

  return (
    <View style={rentStyles.mainContainer}>
      <View style={rentStyles.container}>
        <BackButton />
        <Text style={rentStyles.header}> Driver Details </Text>
      </View>

      <View style={rentStyles.profile}>
        <ProfileIcon />
        {loading ? (
          <View style={rentStyles.loadingContainer}>
            <ActivityIndicator size="large" color="#073051" />
            <Text style={rentStyles.loadingText}>
              Loading driver details...
            </Text>
          </View>
        ) : driver ? (
          <>
            <Text style={rentStyles.name}>{driver.operator_name}</Text>
            <DriverDetails
              contactNumber={driver.contact_number}
              plateNumber={driver.plate_number}
              operatorName={driver.operator_name}
              operatorAddress={driver.operator_address}
              eligible={driver.eligible}
            />
          </>
        ) : (
          <View style={rentStyles.errorContainer}>
            <Text style={rentStyles.errorText}>
              {error || "Driver not found"}
            </Text>
            <Text style={rentStyles.errorSubText}>
              Please check the QR code and try again
            </Text>
          </View>
        )}
      </View>
    </View>
  );
}

const rentStyles = StyleSheet.create({
  mainContainer: {
    flex: 1,
    backgroundColor: "#fff",
  },
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
  container: {
    flexDirection: "row",
    alignItems: "center",
  },
  profile: {
    alignItems: "center",
    marginTop: 40,
    paddingHorizontal: 20,
  },
  name: {
    fontWeight: "bold",
    color: "#073051",
    fontSize: 25,
    paddingTop: 20,
    marginBottom: 20,
    textAlign: "center",
  },
  loadingContainer: {
    alignItems: "center",
    marginTop: 20,
  },
  loadingText: {
    marginTop: 10,
    color: "#073051",
    fontSize: 16,
  },
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
