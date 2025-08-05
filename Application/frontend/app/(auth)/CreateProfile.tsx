import React, { useState } from "react";
import {
  Image,
  Text,
  View,
  StyleSheet,
  TextInput,
  TouchableOpacity,
} from "react-native";
import { router } from "expo-router";
import AttachIcon from "../../assets/images/attach file.svg";

export default function CreateProfile() {
  const [step, setStep] = useState(1); // 👈 step state

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
          <View style={styleName.rowContainer}>
            <View style={inputName.inputGroup}>
              <Text style={inputName.label}>First Name</Text>
              <TextInput
                style={inputName.input}
                placeholder="E.g Juan"
                placeholderTextColor="#B6B6B6"
                keyboardType="default"
              />
            </View>

            <View style={inputName.inputGroup}>
              <Text style={inputName.label}>Last Name</Text>
              <TextInput
                style={inputName.input}
                placeholder="E.g Dela Cruz"
                placeholderTextColor="#B6B6B6"
                keyboardType="default"
              />
            </View>
          </View>

          <View style={inputStyles.inputGroup}>
            <Text style={inputStyles.label}>Email</Text>
            <TextInput
              style={inputStyles.input}
              placeholder="Enter your email"
              placeholderTextColor="#B6B6B6"
              keyboardType="email-address"
            />
          </View>

          <View style={inputStyles.inputGroup}>
            <Text style={inputStyles.label}>Password</Text>
            <TextInput
              style={inputStyles.input}
              placeholder="Enter your password"
              placeholderTextColor="#B6B6B6"
              secureTextEntry
            />
          </View>

          <View style={inputStyles.inputGroup}>
            <Text style={inputStyles.label}>Confirm Password</Text>
            <TextInput
              style={inputStyles.input}
              placeholder="Enter your password"
              placeholderTextColor="#B6B6B6"
              secureTextEntry
            />
          </View>
        </>
      )}

      {step === 2 && (
        <>
          <View style={inputId.inputGroup}>
            <Text style={inputStyles.label}>ID Discount</Text>
            <TouchableOpacity style={inputId.buttonId}>
              <AttachIcon></AttachIcon>
              <Text>
                <Text style={inputId.buttonText}>Tap here</Text>
                <Text style={{ flexDirection: "row", textAlign: "center" }}>
                  {" "}
                  to take the back {"\n"} picture of the ID
                </Text>
              </Text>
            </TouchableOpacity>
          </View>

          <View style={inputId.inputGroup}>
            <TouchableOpacity style={inputId.buttonId}>
              <AttachIcon
                width={32}
                color="#5E7A90"
                style={{
                  marginBottom: 8,
                  alignItems: "center",
                  justifyContent: "center",
                }}
              ></AttachIcon>
              <Text>
                <Text style={inputId.buttonText}>Tap here</Text>
                <Text style={{ flexDirection: "row", textAlign: "center" }}>
                  {" "}
                  to take the back {"\n"} picture of the ID
                </Text>
              </Text>
            </TouchableOpacity>
          </View>
        </>
      )}

      <TouchableOpacity
        style={styles.button}
        onPress={() => {
          if (step === 1) {
            setStep(2); // go to step 2
          } else {
            alert("Signed In!");
          }
        }}
      >
        <Text style={styles.buttonText}>{step === 1 ? "Next" : "Submit"}</Text>
      </TouchableOpacity>

      <Text style={{ marginTop: 20 }}>
        Already have an Account?{" "}
        <Text
          style={{ color: "#073051", fontWeight: "bold" }}
          onPress={() => router.push("../index.tsx")}
        >
          Sign-up
        </Text>
      </Text>
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
  },
});

const styleName = StyleSheet.create({
  rowContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    marginTop: 20,
    gap: 10,
  },
});

const inputName = StyleSheet.create({
  inputGroup: {
    width: "43.3%",
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
    fontSize: 16,
    backgroundColor: "#fff",
  },
});

const inputId = StyleSheet.create({
  inputGroup: {
    width: "43.3%",
    marginTop: 20,
  },
  buttonId: {
    height: 90,
    width: 250,
    borderColor: "#ccc",
    paddingLeft: 10,
    borderWidth: 1,
    borderRadius: 10,
  },
  buttonText: {
    alignItems: "center",
    color: "#073051",
    fontWeight: "bold",
    textAlign: "center",
    flexDirection: "row",
    marginTop: 40,
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
    fontSize: 16,
    backgroundColor: "#fff",
  },
});

const styles = StyleSheet.create({
  button: {
    backgroundColor: "#208FCB",
    paddingVertical: 12,
    paddingHorizontal: 32,
    borderRadius: 15,
    marginTop: 50,
    width: "80%",
    alignItems: "center",
  },
  buttonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
});
