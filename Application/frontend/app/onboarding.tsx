import React from "react";
import { Dimensions, StyleSheet, Text, View } from "react-native";
import PagerView from "react-native-pager-view";
import Svg, { Defs, LinearGradient, Stop, Rect } from "react-native-svg";

const { width, height } = Dimensions.get("window");

export default function Onboarding() {
  return (
    <PagerView style={styles.pager} initialPage={0}>
      {/* Screen 1 with gradient */}
      <View style={styles.page} key="1">
        <Svg height="100%" width="100%" style={StyleSheet.absoluteFill}>
          <Defs>
            <LinearGradient id="grad" x1="0" y1="1" x2="0" y2="0">
              <Stop offset="0" stopColor="#1e90ff" stopOpacity="1" />
              {/* bottom blue */}

              <Stop offset="0.3" stopColor="#ffffff" stopOpacity="0.5" />
              {/* fade to white */}
            </LinearGradient>
          </Defs>
          <Rect x="0" y="0" width="100%" height="100%" fill="url(#grad)" />
        </Svg>

        {/* Overlay content */}
        <Text style={styles.text}>Onboarding Screen 1</Text>
      </View>

      {/* Screen 2 */}
      <View style={styles.page} key="2">
        <Text style={styles.text}>Onboarding Screen 2</Text>
      </View>

      {/* Screen 3 */}
      <View style={styles.page} key="3">
        <Text style={styles.text}>Onboarding Screen 3</Text>
      </View>
    </PagerView>
  );
}

const styles = StyleSheet.create({
  pager: { flex: 1 },
  page: {
    width,
    height,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#ffffff",
  },
  text: {
    fontSize: 20,
    fontWeight: "bold",
    color: "black",
  },
});
