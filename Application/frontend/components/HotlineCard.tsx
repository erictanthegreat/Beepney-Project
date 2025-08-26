import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { router } from "expo-router";

type HotlineCardProps = {
  name: string;
  type: string;
  number: string;
  address: string;
};

export default function HotlineCard({
  name,
  type,
  number,
  address,
}: HotlineCardProps) {
  return (
    <TouchableOpacity
      onPress={() =>
        router.push({
          pathname: "/(feat)/sos",
          params: { name, type, number, address },
        })
      }
    >
      <View style={styles.card}>
        {/* Blue dot */}
        <View style={styles.dot} />

        {/* Text content */}
        <View>
          <Text style={styles.title}>
            {name} <Text style={styles.type}>({type})</Text>
          </Text>
          <Text style={styles.address}> {address.split(",").join("\n")} </Text>
          <Text style={styles.number}>{number}</Text>
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  address: {
    color: "#888",
    fontWeight: "bold",
    marginTop: 2,
  },
  card: {
    flexDirection: "row",
    alignItems: "flex-start",
    backgroundColor: "#fff",
    padding: 20,
    width: "90%",
    marginLeft: 20,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#e0e0e0",
    marginBottom: 10,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#007BFF",
    marginTop: 5,
    marginRight: 10,
  },
  title: {
    fontSize: 16,
    fontWeight: "600",
    marginLeft: 2,
  },
  type: {
    fontWeight: "400",
    color: "#555",
  },
  number: {
    color: "#888",
    marginTop: 2,
  },
});
