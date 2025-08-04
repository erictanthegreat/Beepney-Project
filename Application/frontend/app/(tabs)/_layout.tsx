import { Tabs } from "expo-router";
import React from "react";
import { Platform, Pressable, View, PressableProps } from "react-native";

import TabBarBackground from "../../components/ui/TabBarBackground";
import { Colors } from "../../constants/Colors";
import { useColorScheme } from "../../hooks/useColorScheme";
import HomeIcon from "../../assets/images/home.svg";
import RideHailingIcon from "../../assets/images/ride-hailing.svg";
import SOSIcon from "../../assets/images/Emergency button.svg";
import StationsIcon from "../../assets/images/Station.svg";
import RentalIcon from "../../assets/images/rental.svg";

{
  /* LOGOS */
}

export default function TabLayout() {
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
            height: 90, // <-- Increase this to make the navbar taller
            paddingBottom: 20, // optional, for icon spacing
            paddingTop: 10,
            backgroundColor: "white", // optional fallback if blur doesn't work
            borderTopWidth: 0, // option
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
            <HomeIcon width={28} height={28} fill={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="RideHailing"
        options={{
          title: "TricyCall",
          tabBarIcon: ({ color }) => (
            <RideHailingIcon width={28} height={28} fill={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="SOS"
        options={{
          title: " ",
          tabBarButton: (props) => (
            <Pressable
              android_ripple={null}
              style={({ pressed }) => ({
                opacity: pressed ? 1 : 1,
              })}
              {...props}
            />
          ),
          tabBarIcon: ({ color }) => (
            <SOSIcon width={50} height={50} fill={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="Stations"
        options={{
          title: "Stations",
          tabBarIcon: ({ color }) => (
            <StationsIcon width={28} height={28} fill={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="Renting"
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
