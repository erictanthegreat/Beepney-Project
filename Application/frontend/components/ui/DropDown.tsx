import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  FlatList,
  Animated,
} from "react-native";
import { AntDesign } from "@expo/vector-icons";

export default function DropDown({
  data = [],
  value,
  onSelect,
  isOpen,
  onToggle,
  placeholder = "Select", // <-- NEW: customizable placeholder
}) {
  const [selected, setSelected] = useState(value || null); // <-- Start with null if no value
  const [buttonWidth, setButtonWidth] = useState(100);
  const dropdownWidth = 145;

  // Animation value for height
  const animatedHeight = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(animatedHeight, {
      toValue: isOpen ? data.length * 45 : 0,
      duration: 200,
      useNativeDriver: false,
    }).start();
  }, [isOpen, data.length]);

  // keep in sync when parent value changes
  useEffect(() => {
    if (value) {
      setSelected(value);
    }
  }, [value]);

  const handleSelect = (item) => {
    setSelected(item);
    onToggle(false);
    if (onSelect) onSelect(item);
  };

  // Display placeholder if nothing selected, otherwise show selected value
  const displayText = selected || placeholder;
  const isPlaceholder = !selected;

  return (
    <View style={styles.container}>
      {/* Button */}
      <TouchableOpacity
        style={[styles.button, { width: buttonWidth }]}
        onPress={() => onToggle(!isOpen)}
        activeOpacity={0.8}
      >
        <Text
          style={[
            styles.buttonText,
            isPlaceholder && styles.placeholderText, // <-- Different style for placeholder
          ]}
          onLayout={(e) => {
            const textWidth = e.nativeEvent.layout.width;
            setButtonWidth(textWidth + 50);
          }}
        >
          {displayText}
        </Text>
        <AntDesign
          name={isOpen ? "up" : "down"}
          size={14}
          color="white"
          style={{ marginLeft: 6 }}
        />
      </TouchableOpacity>

      {/* Animated Dropdown Menu */}
      <Animated.View
        style={[
          styles.dropdown,
          { width: dropdownWidth, height: animatedHeight, overflow: "hidden" },
        ]}
      >
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
      </Animated.View>
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
  placeholderText: {
    opacity: 1,
  },
  dropdown: {
    backgroundColor: "#fff",
    borderRadius: 8,
    marginTop: 4,
    elevation: 2,
  },
  dropdownItem: {
    paddingVertical: 10,
    paddingHorizontal: 10,
  },
  dropdownText: {
    fontSize: 16,
    color: "#0A3553",
  },
});
