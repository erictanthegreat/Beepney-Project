import React from "react";
import { SendDirectSms } from "react-native-send-direct-sms";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Platform,
  Linking,
  Alert,
  PermissionsAndroid,
} from "react-native";
import * as Location from "expo-location";
import { useLocalSearchParams } from "expo-router";
import "@fontsource/poppins";
import BackButton from "@/components/Backbutton";
import CallIcon from "../../assets/images/Call.svg";
import ReportIcon from "../../assets/images/Report.svg";

export default function SOS() {
  const { name, type, number } = useLocalSearchParams<{
    name: string;
    type: string;
    number: string;
    address: string;
  }>();

  const makeaPhonecall = () => {
    if (Platform.OS === "android") {
      Linking.openURL(`tel:${number}`);
    } else {
      Linking.openURL(`telprompt:${number}`);
    }
  };

  // Function to request location and send SMS automatically
  const sendHelpMessage = async () => {
    try {
      // Ask for location permission
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        Alert.alert(
          "Permission Denied",
          "Location access is required to send your current location."
        );
        return;
      }

      // Get location
      const location = await Location.getCurrentPositionAsync({});
      const latitude = location.coords.latitude;
      const longitude = location.coords.longitude;

      // Construct message
      const message = `🚨 HELP REQUEST 🚨\n\nI need assistance. Please send help to my current location:\nhttps://www.google.com/maps?q=${latitude},${longitude}`;

      // Encode for URL
      const smsBody = encodeURIComponent(message);

      // Create SMS URL
      const smsURL = Platform.select({
        ios: `sms:${number}&body=${smsBody}`,
        android: `sms:${number}?body=${smsBody}`,
      });

      // Open SMS app
      await Linking.openURL(smsURL);
    } catch (error) {
      console.error("Error preparing SMS:", error);
      Alert.alert(
        "Error",
        "Something went wrong while preparing the help message."
      );
    }
  };

  return (
    <View style={{ flex: 1 }}>
      <BackButton />
      <Text style={styles.header}>You're Calling/Reporting...</Text>
      <Text style={styles.subheader}>Make your commuter experience safe.</Text>

      <View style={styles.container}>
        {/* Hotline Details */}
        <Text style={styles.hotlineName}>{name}</Text>
        <Text style={styles.hotlineType}>({type})</Text>
        <Text style={styles.hotlineNumber}>{number}</Text>

        {/* Call or Report */}
        <View style={styles.actionsContainer}>
          {/* Call Button */}
          <View style={styles.actionItem}>
            <TouchableOpacity
              style={styles.CallButton}
              onPress={() => makeaPhonecall()}
            >
              <CallIcon />
            </TouchableOpacity>
            <Text style={styles.callText}>Call</Text>
          </View>

          {/* Report Button */}
          <View style={styles.actionItem}>
            <TouchableOpacity
              style={styles.NotifButton}
              onPress={() => sendHelpMessage()}
            >
              <ReportIcon />
            </TouchableOpacity>
            <Text style={styles.notifyText}>Report</Text>
          </View>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingTop: 20,
    alignItems: "center",
  },
  header: {
    fontWeight: "bold",
    fontSize: 25,
    marginLeft: 20,
    marginTop: 10,
    color: "#073051",
    fontFamily: "Poppins",
  },
  subheader: {
    marginLeft: 25,
    color: "#595959",
    marginBottom: 20,
    fontFamily: "Poppins",
  },
  hotlineName: {
    fontWeight: "bold",
    fontSize: 22,
    marginTop: 20,
  },
  hotlineType: {
    fontWeight: "bold",
    fontSize: 17,
  },
  hotlineNumber: {
    color: "#595959",
    marginBottom: 30,
    fontFamily: "Poppins",
  },
  actionsContainer: {
    flexDirection: "row",
    gap: 40,
    marginTop: 20,
  },
  actionItem: {
    alignItems: "center",
  },
  CallButton: {
    borderWidth: 1,
    borderColor: "#ccc",
    paddingVertical: 20,
    paddingHorizontal: 30,
    borderRadius: 10,
    alignItems: "center",
    backgroundColor: "#fff",
  },
  NotifButton: {
    borderWidth: 1,
    borderColor: "#ccc",
    paddingVertical: 23,
    paddingHorizontal: 30,
    borderRadius: 10,
    alignItems: "center",
    backgroundColor: "#fff",
  },
  callText: {
    marginTop: 8,
    color: "red",
    fontWeight: "bold",
    fontFamily: "Poppins",
  },
  notifyText: {
    marginTop: 8,
    color: "#1E86DA",
    fontWeight: "bold",
    fontFamily: "Poppins",
  },
});
