import React, { Component } from "react";
import {
  Image,
  Text,
  View,
  StyleSheet,
  TextInput,
  TouchableOpacity,
} from "react-native";
import { router } from "expo-router";
import "@fontsource/poppins";

export default class Index extends Component {
  render() {
    return (
      <View style={viewStyles.container}>
        <View>
          <Image
            source={require("../assets/images/Beepney LOGO.png")}
            style={imageStyles.logo}
          />
          <Text style={textStyles.header}>Welcome to Beepney!</Text>
          <Text style={textStyles.subheader}>Sign In to Continue</Text>
        </View>

        <View style={inputStyles.inputGroup}>
          <Text style={inputStyles.label}>Email</Text>
          <TextInput
            style={inputStyles.input}
            placeholder="Enter your email"
            keyboardType="default"
          />
        </View>
        <View style={inputStyles.inputGroup}>
          <Text style={inputStyles.label}>Password</Text>
          <TextInput
            style={inputStyles.input}
            placeholder="Enter your password"
            secureTextEntry
          />
        </View>

        <TouchableOpacity
          style={styles.button}
          onPress={() => router.push("/(tabs)/Home")}
        >
          <Text style={styles.buttonText}>Sign In</Text>
        </TouchableOpacity>

        <Text style={{ marginTop: 20 }}>
          Don&apos;t have an Account?{" "}
          <Text
            style={{ color: "#073051", fontWeight: "bold" }} // fixed hex color
            onPress={() => router.push("/(auth)/CreateProfile")}
          >
            Sign-up
          </Text>
        </Text>
      </View>
    );
  }
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
    marginTop: 150,
    width: "80%",
    alignItems: "center",
  },
  buttonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
});
