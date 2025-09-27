import React, { Component } from "react";
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
import { CameraView } from "expo-camera";
import QR from "../../assets/images/qr grid.svg";
import { router } from "expo-router";

export default class ScanDriverdets extends Component {
  scanned = false; // class property

  handleScan = ({ data }) => {
    if (this.scanned) return; // ignore if already scanned
    this.scanned = true;

    try {
      const parsed = JSON.parse(data);
      if (parsed.screen) {
        const path = `${parsed.screen}${parsed.id ? `?id=${parsed.id}` : ""}`;
        router.push("/(result)/DriverDetails");
      } else {
        Alert.alert("Invalid QR", "This QR code is not valid for navigation.");
      }
    } catch (err) {
      Alert.alert("Error", "Failed to read QR code.");
      console.error(err);
    }
  };

  render() {
    return (
      <View style={scanStyles.container}>
        {Platform.OS === "android" ? <StatusBar hidden /> : null}
        <CameraView
          style={StyleSheet.absoluteFillObject}
          facing="back"
          onBarcodeScanned={this.handleScan}
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
