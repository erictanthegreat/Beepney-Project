// components/ForApproval.tsx
import React from "react";
import {
  View,
  Text,
  Dimensions,
  StyleSheet,
  Image,
  SafeAreaView,
} from "react-native";
import { router } from "expo-router";
import ApprovalIcon from "@/assets/images/approval.svg";
import CustomButton from "@/components/ui/CustomButton";

const { width, height } = Dimensions.get("window");

export default function ForApproval() {
  return (
    <SafeAreaView style={styles.container}>
      <Image
        source={require("../../assets/images/Beepney LOGO.png")}
        style={styles.logo}
      />

      <Text style={styles.title}>For Approval</Text>
      <Text style={styles.description}>
        {"\t"}Your complaints are being reviewed {"\n"} by the PSO/LTFRB. Please
        wait within 5 working days. Will message you through SMS once your
        complaints {"\t"}gets reviewed. Thank you!
      </Text>
      <View style={styles.iconContainer}>
        <ApprovalIcon width={width * 0.4} height={width * 0.4} />
      </View>

      <CustomButton
        title="Confirm"
        onPress={() => router.push("/(commuter)/Home")}
      ></CustomButton>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    paddingHorizontal: 20,
  },
  logo: {
    width: 300,
    height: 150,
    resizeMode: "contain",
    marginTop: 40,
  },
  title: {
    fontSize: width * 0.09,
    marginTop: height * 0.05,
    fontFamily: "Poppins",
    fontWeight: "bold",
    color: "#073051",
    textAlign: "center",
  },
  description: {
    textAlign: "center",
    marginTop: height * 0.02,
    color: "#073051",
    fontSize: width * 0.04,
    lineHeight: 22,
  },
  iconContainer: {
    marginTop: height * 0.03,
    alignItems: "center",
  },
});
