import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  FlatList,
} from "react-native";
import { AntDesign } from "@expo/vector-icons";

export default function DropDown({ data = [], onSelect }) {
  const [selected, setSelected] = useState(data[0] || "Select");
  const [visible, setVisible] = useState(false);
  const [buttonWidth, setButtonWidth] = useState(100); // Button width changes dynamically
  const dropdownWidth = 145;

  const handleSelect = (item) => {
    setSelected(item);
    setVisible(false);
    if (onSelect) onSelect(item);
  };

  return (
    <View style={styles.container}>
      {/* Button */}
      <TouchableOpacity
        style={[styles.button, { width: buttonWidth }]}
        onPress={() => setVisible((prev) => !prev)}
        activeOpacity={0.8}
      >
        <Text
          style={styles.buttonText}
          onLayout={(e) => {
            const textWidth = e.nativeEvent.layout.width;
            setButtonWidth(textWidth + 50); // +50 for padding and icon
          }}
        >
          {selected}
        </Text>
        <AntDesign
          name="down"
          size={14}
          color="white"
          style={{ marginLeft: 6 }}
        />
      </TouchableOpacity>

      {/* Dropdown Menu */}
      {visible && (
        <View style={[styles.dropdown, { width: dropdownWidth }]}>
          <FlatList
            data={data}
            keyExtractor={(item, index) => index.toString()}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={styles.dropdownItem}
                onPress={() => handleSelect(item)}
              >
                <Text style={styles.dropdownText}>{item}</Text>
              </TouchableOpacity>
            )}
          />
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 10,
  },
  button: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#0A3553",
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 50,
  },
  buttonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "500",
  },
  dropdown: {
    backgroundColor: "#0A3553",
    borderRadius: 8,
    marginTop: 4,
    elevation: 2,
  },
  dropdownItem: {
    paddingVertical: 10,
    paddingHorizontal: 16,
  },
  dropdownText: {
    fontSize: 16,
    color: "white",
  },
});
