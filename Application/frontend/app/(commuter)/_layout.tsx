import { Tabs } from "expo-router";
import React from "react";
import { Platform, Pressable } from "react-native";
import type { BottomTabBarButtonProps } from "@react-navigation/bottom-tabs";

import TabBarBackground from "../../components/ui/TabBarBackground";
import { useColorScheme } from "../../hooks/useColorScheme";
import HomeIcon from "../../assets/images/home.svg";
import RideHailingIcon from "../../assets/images/ride-hailing.svg";
import SOSIcon from "../../assets/images/Emergency button.svg";
import StationsIcon from "../../assets/images/Station.svg";
import RentalIcon from "../../assets/images/rental.svg";

export default function TabLayout() {
  const colorScheme = useColorScheme();

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: "#1E86DA", //
        tabBarInactiveTintColor: "#A0A0A0", //
        headerShown: false,

        tabBarStyle: Platform.select({
          android: {
            position: "absolute",
            height: 90,
            paddingBottom: 20,
            paddingTop: 10,
            borderTopWidth: 0,
          },
          default: {},
        }),
      }}
    >
      <Tabs.Screen
        name="home"
        options={{
          title: "Home",
          tabBarIcon: ({ color }) => (
            <HomeIcon width={28} height={28} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="ridehailing"
        options={{
          title: "TricyCall",
          tabBarIcon: ({ color }) => (
            <RideHailingIcon width={28} height={28} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="sos"
        options={{
          title: " ",

          tabBarIcon: ({ color }) => (
            <SOSIcon width={50} height={50} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="stations"
        options={{
          title: "Stations",
          tabBarIcon: ({ color }) => (
            <StationsIcon width={28} height={28} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="renting"
        options={{
          title: "Renting",
          tabBarIcon: ({ color }) => (
            <RentalIcon width={28} height={28} color={color} />
          ),
        }}
      />
    </Tabs>
  );
}
