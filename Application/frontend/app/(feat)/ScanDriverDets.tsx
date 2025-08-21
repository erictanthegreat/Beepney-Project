import React, { Component } from "react";
import {
  Text,
  View,
  StyleSheet,
  Platform,
  StatusBar,
  Linking,
} from "react-native";
import "@fontsource/poppins";
import BackButton from "@/components/Backbutton";
import { CameraView } from "expo-camera";
import QR from "../../assets/images/qr grid.svg";

export default class Renting extends Component {
  render() {
    return (
      <View style={scanStyles.container}>
        {Platform.OS === "android" ? <StatusBar hidden /> : null}
        <CameraView
          style={StyleSheet.absoluteFillObject}
          facing="back"
          onBarcodeScanned={({ data }) => {
            Linking.openURL(data);
          }}
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
