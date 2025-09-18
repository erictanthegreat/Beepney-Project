import React from "react";
import { View, Text, StyleSheet } from "react-native";

type Vehicle = {
  type: string;
  destination: string;
  count: number;
};

type TableProps = {
  data: Vehicle[];
};

export default function ViewStationTable({ data }: TableProps) {
  return (
    <View style={styles.table}>
      {/* Header row */}
      <View style={[styles.row, styles.header]}>
        <View style={[styles.cell, styles.headerCell]}>
          <Text style={styles.headerText}>Type of Vehicles</Text>
        </View>
        <View style={[styles.cell, styles.headerCell]}>
          <Text style={styles.headerText}>Destinations</Text>
        </View>
        <View style={[styles.cell, styles.headerCell, styles.lastHeaderCell]}>
          <Text style={styles.headerText}>Available</Text>
        </View>
      </View>

      {/* Data rows */}
      {data.length > 0 ? (
        data.map((item, index) => (
          <View key={index} style={styles.row}>
            {/* Vehicle type */}
            <View style={[styles.cell, styles.dataCell]}>
              <Text style={styles.text}>{item.type}</Text>
            </View>

            {/* Destination */}
            <View style={[styles.cell, styles.dataCell]}>
              <Text style={styles.text}>{item.destination}</Text>
            </View>

            {/* Count */}
            <View style={[styles.cell, styles.dataCell, styles.lastCell]}>
              <Text style={styles.text}>{item.count}</Text>
            </View>
          </View>
        ))
      ) : (
        <View style={styles.emptyRow}>
          <Text style={styles.emptyText}>No vehicles available</Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  table: {
    borderWidth: 1,
    borderColor: "#D1D5DB",
    borderRadius: 12,
    overflow: "hidden",
    marginHorizontal: 15,
    backgroundColor: "white",
  },
  row: {
    flexDirection: "row",
  },
  header: {
    backgroundColor: "#F9FAFB",
  },
  headerCell: {
    paddingVertical: 12,
    paddingHorizontal: 2,
    borderRightWidth: 1,
    borderRightColor: "#D1D5DB",
    borderBottomWidth: 1,
    borderBottomColor: "#D1D5DB",
  },
  lastHeaderCell: {
    borderRightWidth: 0,
  },
  dataCell: {
    paddingVertical: 16,
    paddingHorizontal: 8,
    borderRightWidth: 1,
    borderRightColor: "#D1D5DB",
    borderBottomWidth: 1,
    borderBottomColor: "#D1D5DB",
  },
  lastCell: {
    borderRightWidth: 0,
  },
  headerText: {
    fontWeight: "600",
    fontSize: 13,
    textAlign: "center",
    color: "#073051",
    lineHeight: 16,
  },
  text: {
    fontSize: 13,
    textAlign: "center",
    color: "#073051",
    fontWeight: "500",
  },
  cell: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  emptyRow: {
    padding: 20,
  },
  emptyText: {
    textAlign: "center",
    color: "#777",
    fontStyle: "italic",
  },
});
