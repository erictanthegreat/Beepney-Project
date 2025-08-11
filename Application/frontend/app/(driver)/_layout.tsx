import { Tabs } from "expo-router";
import React from "react";
import { Platform, Pressable } from "react-native";
import type { BottomTabBarButtonProps } from "@react-navigation/bottom-tabs";

import TabBarBackground from "../../components/ui/TabBarBackground";
import { Colors } from "../../constants/Colors";
import { useColorScheme } from "../../hooks/useColorScheme";
import HomeIcon from "../../assets/images/home.svg";
import RideHailingIcon from "../../assets/images/ride-hailing.svg";
import SOSIcon from "../../assets/images/Emergency button.svg";
import StationsIcon from "../../assets/images/Station.svg";
import RentalIcon from "../../assets/images/rental.svg";

export default function DriverLayout() {
  const colorScheme = useColorScheme();

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: Colors[colorScheme ?? "light"].tint,
        headerShown: false,
        tabBarBackground: TabBarBackground,
        tabBarStyle: Platform.select({
          android: {
            position: "absolute",
            height: 90,
            paddingBottom: 20,
            paddingTop: 10,
            backgroundColor: "white",
            borderTopWidth: 0,
          },
          default: {},
        }),
      }}
    >
      <Tabs.Screen
        name="DriverHome"
        options={{
          title: "Home",
          tabBarIcon: ({ color }) => (
            <HomeIcon width={28} height={28} fill={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="DriverRideHailing"
        options={{
          title: "TricyCall",
          tabBarIcon: ({ color, focused }) => (
            <RideHailingIcon
              fill={focused ? "red" : "#000"}
              width={28}
              height={28}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="DriverSOS"
        options={{
          title: " ",
          tabBarButton: ({ ref: _ref, ...rest }: BottomTabBarButtonProps) => (
            <Pressable
              android_ripple={undefined}
              style={({ pressed }) => ({
                opacity: pressed ? 1 : 1,
              })}
              {...rest}
            />
          ),
          tabBarIcon: ({ color }) => (
            <SOSIcon width={50} height={50} fill={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="DriverStations"
        options={{
          title: "Stations",
          tabBarIcon: ({ color }) => (
            <StationsIcon width={28} height={28} fill={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="DriverRenting"
        options={{
          title: "Renting",
          tabBarIcon: ({ color }) => (
            <RentalIcon width={28} height={28} fill={color} />
          ),
        }}
      />
    </Tabs>
  );
}
