import React from "react";
import { View, Text, StyleSheet } from "react-native";

export default function HotlineCard({ name, type, number }) {
  return (
    <View style={styles.card}>
      {/* Blue dot */}
      <View style={styles.dot} />

      {/* Text content */}
      <View>
        <Text style={styles.title}>
          {name} <Text style={styles.type}>({type})</Text>
        </Text>
        <Text style={styles.number}>{number}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: "row",
    alignItems: "flex-start",
    backgroundColor: "#fff",
    padding: 20,
    width: "85%",
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
