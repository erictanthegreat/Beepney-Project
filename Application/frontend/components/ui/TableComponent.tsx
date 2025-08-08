import React from "react";
import { View, Text, StyleSheet, ScrollView } from "react-native";

type TableProps = {
  headers: string[];
  data: string[][];
};

export default function Table({ headers, data }: TableProps) {
  return (
    <View style={styles.tableContainer}>
      {/* Header Row */}
      <View style={styles.row}>
        {headers.map((header, index) => (
          <View
            style={[
              styles.cell,
              index < headers.length - 1 && styles.cellBorderRight,
            ]}
            key={index}
          >
            <Text style={styles.headerText}>{header}</Text>
          </View>
        ))}
      </View>

      {/* Data Rows */}
      <ScrollView>
        {data.map((row, rowIndex) => (
          <View style={styles.row} key={rowIndex}>
            {row.map((cell, cellIndex) => (
              <View
                style={[
                  styles.cell,
                  cellIndex < row.length - 1 && styles.cellBorderRight,
                ]}
                key={cellIndex}
              >
                <Text style={styles.cellText}>{cell}</Text>
              </View>
            ))}
          </View>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  tableContainer: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    overflow: "hidden",
    margin: 10,
  },
  row: {
    flexDirection: "row",
    backgroundColor: "#f9f9f9",
    borderBottomWidth: 1,
    borderColor: "#ccc",
  },
  cell: {
    flex: 1,
    padding: 13,
    justifyContent: "center",
  },
  cellBorderRight: {
    borderRightWidth: 1,
    borderRightColor: "#ccc",
  },
  headerText: {
    fontWeight: "bold",
    color: "#073051",
    textAlign: "center",
    fontFamily: "Poppins-regular",
  },
  cellText: {
    color: "#073051",
    textAlign: "center",
    fontFamily: "Poppins",
  },
});
