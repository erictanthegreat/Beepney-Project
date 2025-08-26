import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
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

  return (
    <View style={{ flex: 1 }}>
      <BackButton />
      <Text style={styles.header}>You're Calling/Reporting...</Text>
      <Text style={styles.subheader}>Make your commuter experience safe.</Text>

      <View style={styles.container}>
        {/* Hotline Details */}
        <Text style={styles.hotlineName}>
          {name} ({type})
        </Text>
        <Text style={styles.hotlineNumber}>{number}</Text>

        {/* Call or Report */}
        <View style={styles.actionsContainer}>
          {/* Call Button */}
          <View style={styles.actionItem}>
            <TouchableOpacity style={styles.CallButton}>
              <CallIcon style={styles.icon} />
            </TouchableOpacity>
            <Text style={styles.callText}>Call</Text>
          </View>

          {/* Report Button */}
          <View style={styles.actionItem}>
            <TouchableOpacity style={styles.NotifButton}>
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
    fontSize: 18,
    marginTop: 20,
  },
  hotlineNumber: {
    color: "#595959",
    marginBottom: 30,
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
  icon: {},
});
