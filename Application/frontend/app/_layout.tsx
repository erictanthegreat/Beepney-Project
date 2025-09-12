import {
  DarkTheme,
  DefaultTheme,
  ThemeProvider,
} from "@react-navigation/native";
import { useFonts } from "expo-font";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { useColorScheme } from "../hooks/useColorScheme";
import "react-native-reanimated";
import React from "react";
import { TransitionPresets } from "@react-navigation/stack";
import { BottomSheetModalProvider } from "@gorhom/bottom-sheet";

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const [loaded] = useFonts({
    Poppins: require("../assets/fonts/Poppins-Medium.ttf"),
  });

  if (!loaded) {
    return null;
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <BottomSheetModalProvider>
        <ThemeProvider
          value={colorScheme === "dark" ? DarkTheme : DefaultTheme}
        >
          <Stack
            screenOptions={{
              headerShown: false,
              gestureEnabled: true,
              animation: "slide_from_right",
            }}
          >
            <Stack.Screen name="index" />
            <Stack.Screen name="splash" />
            <Stack.Screen name="onboarding" />
            <Stack.Screen name="(auth)/createprofile" />
            <Stack.Screen name="(auth)/login" />
            <Stack.Screen name="(auth)/driverprofile" />
            <Stack.Screen name="(feat)/farecalculator" />
            <Stack.Screen name="(feat)/farematrix" />
            <Stack.Screen name="(feat)/ridehistory" />
            <Stack.Screen name="(feat)/scandriverdets" />
            <Stack.Screen name="(profile)/commuterprofile" />
            <Stack.Screen name="(profile)/driverprofile" />
            <Stack.Screen name="(feat)/sos" />
            <Stack.Screen name="(feat)/generateqr" />
            <Stack.Screen name="(feat)/postrental" />
            <Stack.Screen name="(feat)/calculatedfare" />
            <Stack.Screen name="(feat)/complaints" />
            <Stack.Screen name="(result)/driverqr" />
            <Stack.Screen name="(result)/driverdetails" />
            <Stack.Screen name="(result)/stationdetails" />
            <Stack.Screen name="(commuter)" />
            <Stack.Screen name="(driver)" />
            <Stack.Screen name="+not-found" />
          </Stack>
          <StatusBar style="auto" />
        </ThemeProvider>
      </BottomSheetModalProvider>
    </GestureHandlerRootView>
  );
}
