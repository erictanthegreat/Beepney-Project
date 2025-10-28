import React, { useEffect, useState } from "react";
import { Text, View, StyleSheet, ActivityIndicator, Alert } from "react-native";
import "@fontsource/poppins";
import QRCode from "react-native-qrcode-svg";
import BackButton from "@/components/Backbutton";
import { supabase } from "@/scripts/supabase";

interface DriverInfo {
  id: string;
  user_name: string;
  operator_name: string;
  plate_number: string;
  phone_number?: string;
  full_address?: string;
}

export default function DriverQR() {
  const [driverInfo, setDriverInfo] = useState<DriverInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [qrValue, setQrValue] = useState<string>("");

  useEffect(() => {
    fetchCurrentDriver();
  }, []);

  const fetchCurrentDriver = async () => {
    try {
      const {
        data: { user },
        error: authError,
      } = await supabase.auth.getUser();

      if (authError || !user) {
        Alert.alert("Error", "Please login first");
        setLoading(false);
        return;
      }

      const userName =
        user.user_metadata?.name ||
        user.user_metadata?.full_name ||
        user.user_metadata?.display_name ||
        user.email ||
        "Unknown User";

    
      const { data, error } = await supabase
        .from("driverprofiles")
        .select("id, operator_name, plate_number, phone_number, full_address")
        .eq("id", user.id.trim())
        .single();

      if (error) {
        Alert.alert("Error", "Failed to load driver information");
      } else if (data) {
        setDriverInfo({
          ...data,
          user_name: userName, // ✅ store user name in state
        });

        const qrData = {
          screen: "DriverQR",
          id: data.id,
          userName,
          plateNumber: data.plate_number,
          phoneNumber: data.phone_number,
          fullAddress: data.full_address,
          generatedAt: new Date().toISOString(),
        };

        setQrValue(JSON.stringify(qrData));
      } else {
        Alert.alert("Error", "Driver profile not found");
      }
    } catch (error) {
      Alert.alert("Error", "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <View style={styles.topBar}>
          <BackButton />
          <Text style={styles.title}>Driver's QR Code</Text>
          <View style={{ width: 50 }} />
        </View>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#073051" />
          <Text style={styles.loadingText}>Generating QR Code...</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.topBar}>
        <BackButton />
        <Text style={styles.title}>Driver's QR Code</Text>
        <View style={{ width: 50 }} />
      </View>

      <View style={styles.qrContainer}>
        {qrValue ? (
          <>
            <QRCode
              value={qrValue}
              size={200}
              color="#1E86DA"
              backgroundColor="white"
            />
            {driverInfo && (
              <View style={styles.driverInfoContainer}>
                <Text style={styles.driverName}>{driverInfo.user_name}</Text>
                <Text style={styles.plateNumber}>
                  Plate: {driverInfo.plate_number}
                </Text>
                {driverInfo.phone_number && (
                  <Text style={styles.subInfo}>
                    Phone: {driverInfo.phone_number}
                  </Text>
                )}
                {driverInfo.full_address && (
                  <Text style={styles.subInfo}>
                    Address: {driverInfo.full_address}
                  </Text>
                )}
                {driverInfo.operator_name && (
                  <Text style={styles.subInfo}>
                    Operator: {driverInfo.operator_name}
                  </Text>
                )}
              </View>
            )}
            <Text style={styles.text}>
              Scan the QR to view {"\n"}Driver's Details
            </Text>
            <Text style={styles.generatedText}>
              Generated: {new Date().toLocaleTimeString()}
            </Text>
          </>
        ) : (
          <Text style={styles.errorText}>Failed to generate QR code</Text>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff" },
  topBar: {
    marginTop: 10,
    paddingHorizontal: 13,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  title: { fontWeight: "bold", fontSize: 25, color: "#073051", paddingTop: 50 },
  qrContainer: {
    top: 150,
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 20,
    paddingVertical: 30,
    width: "80%",
    marginLeft: 35,
    borderWidth: 1,
    borderColor: "#CBCBCB",
    backgroundColor: "#fff",
    elevation: 3,
    borderBottomWidth: 3,
  },
  text: {
    fontSize: 17,
    fontFamily: "Poppins",
    marginTop: 30,
    textAlign: "center",
    color: "#073051",
  },
  loadingContainer: { flex: 1, justifyContent: "center", alignItems: "center" },
  loadingText: { marginTop: 20, fontSize: 16, color: "#073051" },
  driverInfoContainer: { marginTop: 20, alignItems: "center" },
  driverName: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#073051",
    marginBottom: 5,
  },
  plateNumber: { fontSize: 14, color: "#666" },
  subInfo: { fontSize: 13, color: "#444", marginTop: 3 },
  generatedText: {
    fontSize: 12,
    color: "#999",
    marginTop: 15,
    textAlign: "center",
  },
  errorText: { color: "red", fontSize: 16, textAlign: "center" },
});
