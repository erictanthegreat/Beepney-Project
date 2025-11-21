import { DefaultTheme, ThemeProvider } from "@react-navigation/native";
import { useFonts } from "expo-font";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { useColorScheme } from "../hooks/useColorScheme";
import "react-native-reanimated";
import React from "react";
import { BottomSheetModalProvider } from "@gorhom/bottom-sheet";
import Mapbox from "@rnmapbox/maps";
export default function RootLayout() {
  const colorScheme = useColorScheme();
  const [loaded] = useFonts({
    Poppins: require("../assets/fonts/Poppins-Medium.ttf"),
  });

  if (!loaded) {
    return null;
  }
  Mapbox.setAccessToken(
    "pk.eyJ1IjoiZXJpY3RhbjMzMyIsImEiOiJjbWU4NTVsamswOWNuMmpwd29lZmx1OTNwIn0.1rtunFwJarUUNmyOKSdSYQ"
  );

  Mapbox.setTelemetryEnabled(false);

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <BottomSheetModalProvider>
        <ThemeProvider value={DefaultTheme}>
          <Stack
            screenOptions={{
              headerShown: false,
              gestureEnabled: true,
              animation: "slide_from_right",
            }}
          >
            <Stack.Screen name="index" />
            <Stack.Screen name="Splash" />
            <Stack.Screen name="Onboarding" />
            <Stack.Screen name="(auth)/CreateProfile" />
            <Stack.Screen name="(auth)/Login" />
            <Stack.Screen name="(auth)/DriverProfile" />
            <Stack.Screen name="(feat)/FareCalculator" />
            <Stack.Screen name="(feat)/FareMatrix" />
            <Stack.Screen name="(feat)/RideHistory" />
            <Stack.Screen name="(feat)/ScanDriverdets" />
            <Stack.Screen name="(profile)/CommuterProfile" />
            <Stack.Screen name="(profile)/driverprofile" />
            <Stack.Screen name="(feat)/SOS" />
            <Stack.Screen name="(feat)/GenerateQr" />
            <Stack.Screen name="(feat)/PostRental" />
            <Stack.Screen name="(feat)/CalculatedFare" />
            <Stack.Screen name="(feat)/complaints" />
            <Stack.Screen name="(result)/DriverQr" />
            <Stack.Screen name="(result)/DriverDetails" />
            <Stack.Screen name="(result)/StationDetails" />
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
