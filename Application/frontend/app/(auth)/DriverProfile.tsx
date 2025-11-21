import React, { useState, useEffect } from "react";
import {
  BackHandler,
  Image,
  Text,
  View,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Alert,
} from "react-native";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
import "@fontsource/poppins";
import { supabase } from "scripts/supabase";
import { router } from "expo-router";
import ApprovalIcon from "../../assets/images/approval.svg";

export default function DriverProfile() {
  const [step, setStep] = useState(1);
  const [phoneNumber, setPhoneNumber] = useState("");
  const [fullAddress, setFullAdress] = useState("");
  const [operatorName, setOperatorName] = useState("");
  const [operatoreNumber, setOperatorNumber] = useState("");
  const [plateNumber, setPlateNumber] = useState("");
  const [operatorAddress, setOperatorAddress] = useState("");

  const handleSubmit = async () => {
    try {
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError || !user) {
        Alert.alert("Error", "Unable to get current user.");
        return;
      }

      const { error: insertError } = await supabase
        .from("driverprofiles")
        .insert([
          {
            id: user.id,
            phone_number: phoneNumber,
            full_address: fullAddress,
            operator_name: operatorName,
            operator_number: operatoreNumber,
            plate_number: plateNumber,
            operator_address: operatorAddress,
            status: "Pending",
          },
        ]);

      if (insertError) {
        console.error("Supabase insert error:", insertError);
        Alert.alert("Error", "Failed to submit your profile. Try again.");
        return;
      }

      setStep(3);
    } catch (err) {
      console.error("handleSubmit error:", err);
      Alert.alert("Error", "Something went wrong. Please try again.");
    }
  };

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
    <KeyboardAwareScrollView
      style={{ flex: 1, backgroundColor: "#fff" }}
      contentContainerStyle={viewStyles.container}
      enableOnAndroid={true}
      extraScrollHeight={20}
      keyboardShouldPersistTaps="handled"
      showsVerticalScrollIndicator={false}
    >
      {step !== 3 && (
        <View style={{ alignItems: "center" }}>
          <Image
            source={require("@/assets/images/Beepney LOGO.png")}
            style={imageStyles.logo}
          />
          <Text style={textStyles.header}>Welcome to Beepney!</Text>
          <Text style={textStyles.subheader}>Sign In to Continue</Text>
        </View>
      )}

      {step === 1 && (
        <>
          <View style={inputStyles.inputGroup}>
            <Text style={inputStyles.label}>Phone Number</Text>
            <TextInput
              style={inputStyles.input}
              placeholder="Enter a 10-digit number"
              placeholderTextColor="#B6B6B6"
              value={phoneNumber}
              onChangeText={setPhoneNumber}
              keyboardType="numeric"
            />
          </View>

          <View style={inputStyles.inputGroup}>
            <Text style={inputStyles.label}>Full Address</Text>
            <TextInput
              style={inputStyles.input}
              placeholder="Street Address, Apt/Unit/etc., City, Province"
              placeholderTextColor="#B6B6B6"
              value={fullAddress}
              onChangeText={setFullAdress}
              keyboardType="default"
            />
          </View>
          <View style={inputStyles.inputGroup}>
            <Text style={inputStyles.label}>Vehicle&apos;s Plate Number</Text>
            <TextInput
              style={inputStyles.input}
              placeholder="e.g 001 2345"
              placeholderTextColor="#B6B6B6"
              value={plateNumber}
              onChangeText={setPlateNumber}
              keyboardType="default"
            />
          </View>
        </>
      )}

      {step === 2 && (
        <>
          <View style={inputStyles.inputGroup}>
            <Text style={inputStyles.label}>Name of the Operator/Company</Text>
            <TextInput
              style={inputStyles.input}
              placeholder="e.g 997 Sandigan Transport Service Cooperative"
              placeholderTextColor="#B6B6B6"
              value={operatorName}
              onChangeText={setOperatorName}
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
              value={operatoreNumber}
              onChangeText={setOperatorNumber}
              keyboardType="numeric"
            />
          </View>

          <View style={inputStyles.inputGroup}>
            <Text style={inputStyles.label}>Operator's Full Address</Text>
            <TextInput
              style={inputStyles.input}
              placeholder="Street Address, Apt/Unit/etc., City, Province"
              placeholderTextColor="#B6B6B6"
              value={operatorAddress}
              onChangeText={setOperatorAddress}
              keyboardType="default"
            />
          </View>
        </>
      )}

      {step === 3 && (
        <View style={{ alignItems: "center" }}>
          <Image
            source={require("@/assets/images/Beepney LOGO.png")}
            style={imageStyles.logo}
          />
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
            wait 1-2 Business Days. We will notify you through email once your
            account {"\n"} {"\t"} gets verified. Thank you!
          </Text>
          <View>
            <ApprovalIcon style={{ marginTop: 20 }} />
          </View>
        </View>
      )}

      <TouchableOpacity
        style={styles.button}
        onPress={() => {
          if (step === 1) {
            if (!phoneNumber || !fullAddress || !plateNumber) {
              Alert.alert("Error", "Please fill out all fields.");
              return;
            }
            setStep(2);
          } else if (step === 2) {
            if (!operatorName || !operatoreNumber || !operatorAddress) {
              Alert.alert("Error", "Please fill out all fields.");
              return;
            }
            handleSubmit();
          } else if (step === 3) {
            router.push("/(commuter)/Home");
          }
        }}
      >
        <Text style={styles.buttonText}>
          {step === 1 ? "Next" : step === 2 ? "Submit" : "Confirm"}
        </Text>
      </TouchableOpacity>
    </KeyboardAwareScrollView>
  );
}

const viewStyles = StyleSheet.create({
  container: {
    alignItems: "center",
    paddingTop: 50,
    paddingBottom: 30,
    flexGrow: 1,
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
