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
          <Stack>
            <Stack.Screen name="index" options={{ headerShown: false }} />
            <Stack.Screen name="plash" options={{ headerShown: false }} />
            <Stack.Screen name="onboarding" options={{ headerShown: false }} />
            <Stack.Screen
              name="(auth)/createprofile"
              options={{ headerShown: false }}
            />
            <Stack.Screen
              name="(auth)/login"
              options={{ headerShown: false }}
            />
            <Stack.Screen
              name="(auth)/driverprofile"
              options={{ headerShown: false }}
            />
            <Stack.Screen
              name="(feat)/farecalculator"
              options={{ headerShown: false }}
            />
            <Stack.Screen
              name="(feat)/farematrix"
              options={{ headerShown: false }}
            />
            <Stack.Screen
              name="(feat)/ridehistory"
              options={{ headerShown: false }}
            />
            <Stack.Screen
              name="(feat)/scandriverdets"
              options={{ headerShown: false }}
            />
            <Stack.Screen
              name="(profile)/commuterprofile"
              options={{ headerShown: false }}
            />
            <Stack.Screen
              name="(profile)/driverprofile"
              options={{ headerShown: false }}
            />
            <Stack.Screen name="(feat)/sos" options={{ headerShown: false }} />
            <Stack.Screen
              name="(feat)/generateqr"
              options={{ headerShown: false }}
            />
            <Stack.Screen
              name="(feat)/postrental"
              options={{ headerShown: false }}
            />
            <Stack.Screen
              name="(feat)/calculatedfare"
              options={{ headerShown: false }}
            />

            <Stack.Screen
              name="(result)/driverqr"
              options={{ headerShown: false }}
            />
            <Stack.Screen
              name="(result)/driverdetails"
              options={{ headerShown: false }}
            />
            <Stack.Screen name="(commuter)" options={{ headerShown: false }} />
            <Stack.Screen name="(driver)" options={{ headerShown: false }} />
            <Stack.Screen name="+not-found" />
          </Stack>
          <StatusBar style="auto" />
        </ThemeProvider>
      </BottomSheetModalProvider>
    </GestureHandlerRootView>
  );
}
