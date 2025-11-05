import { View, Text, StyleSheet, Image } from "react-native";
import React, { useEffect } from "react";
import { router } from "expo-router";

export default function Splash() {
  useEffect(() => {
    const timer = setTimeout(() => {
      router.push("/onboarding");
    }, 2000);

    return () => clearTimeout(timer);
  }, []);

  return (
    <View style={splashStyles.container}>
      <Image source={require("../assets/images/Beepney LOGO.png")} />
    </View>
  );
}

const splashStyles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "white",
  },
});
