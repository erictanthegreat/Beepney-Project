import { Tabs } from "expo-router";
import React from "react";
import { Platform } from "react-native";

import TabBarBackground from "../../components/ui/TabBarBackground";

import HomeIcon from "../../assets/images/home.svg";
import RideHailingIcon from "../../assets/images/ride-hailing.svg";
import SOSIcon from "../../assets/images/Emergency button.svg";
import StationsIcon from "../../assets/images/Station.svg";
import RentalIcon from "../../assets/images/rental.svg";

export default function DriverLayout() {
  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: "#1E86DA",
        tabBarInactiveTintColor: "#A0A0A0",
        headerShown: false,
        animation: "fade",
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
        name="Home"
        options={{
          title: "Home",
          tabBarIcon: ({ color }) => (
            <HomeIcon width={28} height={28} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="Ridehailing"
        options={{
          title: "TricyCall",
          tabBarIcon: ({ color }) => (
            <RideHailingIcon width={28} height={28} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="SOS"
        options={{
          title: " ",

          tabBarIcon: ({ color }) => (
            <SOSIcon width={50} height={50} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="Stations"
        options={{
          title: "stations",
          tabBarIcon: ({ color }) => (
            <StationsIcon width={28} height={28} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="Renting"
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
