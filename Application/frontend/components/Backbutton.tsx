
import React from "react";
import { TouchableOpacity, StyleSheet } from "react-native";
import { useRouter } from "expo-router";
import BackButtonIcon from "../assets/images/backbutton.svg";


export default function BackButton() {
  const router = useRouter();

  return (
    <TouchableOpacity
      style={styles.button}
      onPress={() => {
        router.back();
      }}
    >
      <BackButtonIcon />
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    marginTop: 50,
    marginLeft: 20,
    alignItems: "flex-start",
    justifyContent: "center",
  },
});
