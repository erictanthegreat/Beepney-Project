import {
  DarkTheme,
  DefaultTheme,
  ThemeProvider,
} from "@react-navigation/native";
import { useFonts } from "expo-font";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import "react-native-reanimated";
import "react-native-gesture-handler";
import { useColorScheme } from "../hooks/useColorScheme";
import React from "react";

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const [loaded] = useFonts({
    Poppins: require("../assets/fonts/Poppins-Medium.ttf"),
  });

  if (!loaded) {
    return null;
  }

  return (
    <ThemeProvider value={colorScheme === "dark" ? DarkTheme : DefaultTheme}>
      <Stack>
        <Stack.Screen name="index" options={{ headerShown: false }} />
        <Stack.Screen
          name="(auth)/CreateProfile"
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="(auth)/DriverProfile"
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="(feat)/FareCalculator"
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="(feat)/FareMatrix"
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="(feat)/RideHistory"
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="(feat)/ScanDriverDets"
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="(profile)/CommuterProfile"
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="(profile)/DriverProfile"
          options={{ headerShown: false }}
        />
        <Stack.Screen name="(feat)/SOS" options={{ headerShown: false }} />
        <Stack.Screen
          name="(feat)/GenerateQR"
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="(feat)/PostRental"
          options={{ headerShown: false }}
        />
        <Stack.Screen name="(commuter)" options={{ headerShown: false }} />
        <Stack.Screen name="(driver)" options={{ headerShown: false }} />
        <Stack.Screen name="+not-found" />
      </Stack>
      <StatusBar style="auto" />
    </ThemeProvider>
  );
}
