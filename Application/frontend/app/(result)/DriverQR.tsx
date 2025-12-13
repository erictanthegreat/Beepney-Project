import React, { useEffect, useState, useRef } from "react";
import {
  Text,
  View,
  StyleSheet,
  ActivityIndicator,
  Alert,
  TouchableOpacity,
} from "react-native";
import "@fontsource/poppins";
import QRCode from "react-native-qrcode-svg";
import BackButton from "@/components/Backbutton";
import { supabase } from "@/scripts/supabase";
import * as FileSystem from "expo-file-system";
import * as MediaLibrary from "expo-media-library";
import ViewShot from "react-native-view-shot";

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
  const viewShotRef = useRef<ViewShot>(null);

  useEffect(() => {
    fetchCurrentDriver();
    requestPermissions();
  }, []);

  const requestPermissions = async () => {
    const { status } = await MediaLibrary.requestPermissionsAsync();
    if (status !== "granted") {
      Alert.alert(
        "Permission required",
        "Please grant media library permission to save the QR code"
      );
    }
  };

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

      if (error || !data) {
        Alert.alert("Error", "Failed to load driver information");
        return;
      }

      setDriverInfo({
        ...data,
        user_name: userName,
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
    } catch (err) {
      Alert.alert("Error", "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  const downloadQRCode = async () => {
    try {
      if (!viewShotRef.current) {
        Alert.alert("Error", "QR Code not ready");
        return;
      }

      // Capture QR view
      const tempUri = await viewShotRef.current.capture();

      const filename = `Driver_QR_${driverInfo?.plate_number}_${Date.now()}.png`;
      const localUri = FileSystem.cacheDirectory + filename;

      // Move file to local cache
      await FileSystem.moveAsync({
        from: tempUri,
        to: localUri,
      });

      // Save to device gallery
      const { status } = await MediaLibrary.requestPermissionsAsync();
      if (status !== "granted") {
        Alert.alert("Error", "Gallery permission denied");
        return;
      }

      const asset = await MediaLibrary.createAssetAsync(localUri);
      await MediaLibrary.createAlbumAsync("Beepney QR Codes", asset, false);

      Alert.alert("Success", "QR Code saved to gallery!");
    } catch (error) {
      console.error(error);
      Alert.alert("Error", "Failed to save QR code");
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
            <ViewShot
              ref={viewShotRef}
              options={{ format: "png", quality: 1 }}
              style={styles.captureContainer}
            >
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
            </ViewShot>

            <TouchableOpacity
              style={styles.downloadButton}
              onPress={downloadQRCode}
            >
              <Text style={styles.downloadButtonText}>Save to Gallery</Text>
            </TouchableOpacity>
          </>
        ) : (
          <Text style={styles.errorText}>Failed to generate QR code</Text>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  topBar: {
    marginTop: 10,
    paddingHorizontal: 13,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  title: {
    fontWeight: "bold",
    fontSize: 25,
    color: "#073051",
    paddingTop: 50,
  },
  qrContainer: {
    top: 100,
    justifyContent: "center",
    alignSelf: "center",
    alignItems: "center",
    borderRadius: 20,
    paddingVertical: 30,
    width: "80%",
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
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    marginTop: 20,
    fontSize: 16,
    color: "#073051",
  },
  driverInfoContainer: {
    marginTop: 20,
    alignItems: "center",
  },
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
  downloadButton: {
    marginTop: 20,
    backgroundColor: "#1E86DA",
    paddingVertical: 12,
    paddingHorizontal: 30,
    borderRadius: 10,
    elevation: 2,
  },
  downloadButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  captureContainer: {
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#fff",
    padding: 20,
  },
});
