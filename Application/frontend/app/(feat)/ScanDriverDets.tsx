import React, { useState, useEffect } from "react";
import {
  Text,
  View,
  StyleSheet,
  Platform,
  StatusBar,
  Alert,
} from "react-native";
import "@fontsource/poppins";
import BackButton from "@/components/Backbutton";
import { CameraView, useCameraPermissions } from "expo-camera";
import QR from "../../assets/images/qr grid.svg";
import { router } from "expo-router";

export default function ScanDriverdets() {
  const [scanned, setScanned] = useState(false);
  const [permission, requestPermission] = useCameraPermissions();

  useEffect(() => {
    if (!permission?.granted) {
      requestPermission();
    }
  }, [permission]);

  const handleScan = ({ data }) => {
    if (scanned) return;
    setScanned(true);

    try {
      const parsed = JSON.parse(data);
      if (parsed.screen && parsed.id) {
        router.push(`/(result)/driverdetails?id=${parsed.id}`);
      } else {
        Alert.alert("Invalid QR", "This QR code is not valid for navigation.");
        setScanned(false); // reset so user can try again
      }
    } catch (err) {
      Alert.alert("Error", "Failed to read QR code.");
      console.error(err);
      setScanned(false);
    }
  };

  if (!permission) {
    return (
      <View style={scanStyles.container}>
        <Text style={{ textAlign: "center", marginTop: 50 }}>
          Requesting camera permissions...
        </Text>
      </View>
    );
  }

  if (!permission.granted) {
    return (
      <View style={scanStyles.container}>
        <Text style={{ textAlign: "center", marginTop: 50 }}>
          Camera access is required to scan QR codes
        </Text>
        <Text
          style={{ color: "blue", textAlign: "center" }}
          onPress={requestPermission}
        >
          Grant Permission
        </Text>
      </View>
    );
  }

  return (
    <View style={scanStyles.container}>
      {Platform.OS === "android" ? <StatusBar hidden /> : null}
      <CameraView
        style={StyleSheet.absoluteFillObject}
        facing="back"
        onBarcodeScanned={handleScan}
      >
        <BackButton />
        <View style={scanStyles.overlay}>
          <QR />
          <Text style={scanStyles.text}>
            Scan QR to show the driver’s information for background checks.
          </Text>
        </View>
      </CameraView>
    </View>
  );
}

const scanStyles = StyleSheet.create({
  container: {
    flex: 1,
  },
  overlay: {
    flex: 1,
    alignContent: "center",
    justifyContent: "center",
    marginLeft: 30,
  },
  text: {
    color: "#fff",
    fontFamily: "Poppins",
    textAlign: "center",
    marginTop: 80,
    marginRight: 50,
  },
});
