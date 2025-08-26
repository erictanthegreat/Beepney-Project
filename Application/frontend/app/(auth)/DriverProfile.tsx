import React, { useState, useEffect } from "react";
import {
  BackHandler,
  Image,
  Text,
  View,
  StyleSheet,
  TextInput,
  TouchableOpacity,
} from "react-native";
import "@fontsource/poppins";

import { router } from "expo-router";
import AttachComp from "../../components/Attachfile";
import ApprovalIcon from "../../assets/images/approval.svg";

export default function DriverProfile() {
  const [step, setStep] = useState(1);

  // CAMERA PERMISSION FUNCTIONS
  const handleImage = (uri) => {
    console.log("Selected Image:", uri);
    // -> BACKEND <-
  };

  //BACK BUTTON
  useEffect(() => {
    const handleBackPress = () => {
      if (step > 1) {
        setStep((prev) => prev - 1);
        return true;
      }
      return false;
    };

    const backHandler = BackHandler.addEventListener(
      "hardwareBackPress",
      handleBackPress
    );

    return () => backHandler.remove();
  }, [step]);

  return (
    <View style={viewStyles.container}>
      <View>
        <Image
          source={require("@/assets/images/Beepney LOGO.png")}
          style={imageStyles.logo}
        />
        <Text style={textStyles.header}>Welcome to Beepney!</Text>
        <Text style={textStyles.subheader}>Sign In to Continue</Text>
      </View>

      {step === 1 && (
        <>
          <View style={inputStyles.inputGroup}>
            <Text style={inputStyles.label}>Phone Number</Text>
            <TextInput
              style={inputStyles.input}
              placeholder="Enter a 10-digit number"
              placeholderTextColor="#B6B6B6"
              keyboardType="numeric"
            />
          </View>

          <View style={inputStyles.inputGroup}>
            <Text style={inputStyles.label}>Full Address</Text>
            <TextInput
              style={inputStyles.input}
              placeholder="Street Address, Apt/Unit/etc., City, Province, Country"
              placeholderTextColor="#B6B6B6"
              keyboardType="default"
            />
          </View>
        </>
      )}

      {step === 2 && (
        <>
          <View style={inputId.inputGroup}>
            <Text style={inputStyles.label}>Driver's License</Text>

            <AttachComp
              label={["Tap here to take the front", "picture of the ID"].join(
                "\n"
              )}
              onImageSelected={handleImage}
            />
          </View>

          <View style={inputId.inputGroup}>
            <AttachComp
              label={["Tap here to take the back", "picture of the ID"].join(
                "\n"
              )}
              onImageSelected={handleImage}
            />
          </View>
        </>
      )}
      {step === 3 && (
        <>
          <View style={inputStyles.inputGroup}>
            <Text style={inputStyles.label}>Name of the Operator/Company</Text>
            <TextInput
              style={inputStyles.input}
              placeholder="e.g 997 Sandigan Transport Service Cooperative"
              placeholderTextColor="#B6B6B6"
              keyboardType="default"
            />
          </View>

          <View style={inputStyles.inputGroup}>
            <Text style={inputStyles.label}>
              Number of the Operator/Company
            </Text>
            <TextInput
              style={inputStyles.input}
              placeholder="Enter a 10-digit number"
              placeholderTextColor="#B6B6B6"
              keyboardType="numeric"
            />
          </View>

          <View style={inputStyles.inputGroup}>
            <Text style={inputStyles.label}>Vehicle&apos;s Plate Number</Text>
            <TextInput
              style={inputStyles.input}
              placeholder="e.g 001 2345"
              placeholderTextColor="#B6B6B6"
              keyboardType="default"
            />
          </View>
        </>
      )}

      {step === 4 && (
        <View style={{ alignItems: "center" }}>
          <Text
            style={{
              fontSize: 40,
              marginTop: 40,
              fontFamily: "Poppins",
              fontWeight: "bold",
              color: "#073051",
            }}
          >
            For Approval
          </Text>
          <Text
            style={{
              textAlign: "center",
              marginTop: 20,
              color: "#073051",
              fontSize: 16,
            }}
          >
            {"\t"}Your documents are being reviewed {"\n"} by the Admin. Please
            wait 1-2 Business Days. Will {"\n"} message you through email once
            your account {"\n"} {"\t"} gets verified. Thank you!{" "}
          </Text>
          <View>
            <ApprovalIcon style={{ marginTop: 20 }}></ApprovalIcon>
          </View>
        </View>
      )}

      <TouchableOpacity
        style={styles.button}
        onPress={() => {
          if (step === 1) {
            setStep(2);
          } else if (step === 2) {
            setStep(3);
          } else if (step === 3) {
            setStep(4);
          } else if (step === 4) {
            router.push("/(commuter)/home");
          }
        }}
      >
        <Text style={styles.buttonText}>
          {step === 1
            ? "Next"
            : step === 2
              ? "Next"
              : step === 3
                ? "Submit"
                : "Confirm"}
        </Text>
      </TouchableOpacity>

      {step === 1 && (
        <Text style={{ marginTop: 15 }}>
          Already have an account?{" "}
          <Text
            style={{ color: "#073051", fontWeight: "bold" }}
            onPress={() => router.push("/")}
          >
            Sign-In
          </Text>
        </Text>
      )}
    </View>
  );
}

const viewStyles = StyleSheet.create({
  container: {
    alignItems: "center",
    paddingTop: 50,
    flex: 1,
    backgroundColor: "#fff",
  },
});

const imageStyles = StyleSheet.create({
  logo: {
    width: 300,
    height: 150,
    resizeMode: "contain",
  },
});

const textStyles = StyleSheet.create({
  header: {
    fontSize: 32,
    fontFamily: "Poppins-Regular",
    fontWeight: "bold",
    textAlign: "center",
    color: "#073051",
    marginTop: 20,
  },
  subheader: {
    fontSize: 19,
    fontFamily: "Poppins-Regular",
    textAlign: "center",
    marginTop: 10,
    color: "#073051",
  },
});

const inputId = StyleSheet.create({
  inputGroup: {
    width: "43.3%",
    marginTop: 20,
    marginRight: 150,
  },
  buttonId: {
    height: 90,
    width: 300,
    borderColor: "#ccc",
    paddingLeft: 10,
    borderWidth: 1,
    borderRadius: 10,
    alignItems: "center",
    paddingTop: 12,
  },
  buttonText: {
    alignItems: "center",
    color: "#073051",
    fontWeight: "bold",
    textAlign: "center",
    marginTop: 40,
    fontFamily: "Poppins-Regular",
  },
  idText: {
    alignItems: "center",
    color: "#073051",
    textAlign: "center",
    flexDirection: "row",
    marginTop: 45,
    fontFamily: "Poppins-Regular",
    fontSize: 17,
  },
});

const inputStyles = StyleSheet.create({
  inputGroup: {
    width: "80%",
    marginTop: 20,
  },
  label: {
    fontSize: 16,
    marginBottom: 6,
    fontWeight: "bold",
    color: "#073051",
    fontFamily: "Poppins-Regular",
  },
  input: {
    height: 45,
    borderColor: "#ccc",
    borderWidth: 1,
    borderRadius: 8,
    paddingLeft: 10,
    fontSize: 13,
    backgroundColor: "#fff",
  },
});

const styles = StyleSheet.create({
  button: {
    backgroundColor: "#208FCB",
    paddingVertical: 12,
    marginTop: 80,
    paddingHorizontal: 32,
    borderRadius: 15,
    height: 50,
    width: "80%",
    alignItems: "center",
  },
  buttonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
});
