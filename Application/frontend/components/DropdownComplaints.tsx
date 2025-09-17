import React, { useState } from "react";
import { View, Text, TextInput, StyleSheet, Platform } from "react-native";
import { Picker } from "@react-native-picker/picker";

interface DropdownComplaintsProps {
  onSelectIssue: (issue: string) => void;
}

const IssueDropdown: React.FC<DropdownComplaintsProps> = ({
  onSelectIssue,
}) => {
  const [issueType, setIssueType] = useState("");
  const [otherText, setOtherText] = useState("");

  const issues = [
    "Safety Concern",
    "Harrasment",
    "Over Charging of Fare",
    "Others (Please Specify)",
  ];

  const handleSelection = (value: string) => {
    setIssueType(value);
    if (value !== "Others (Please Specify)") {
      onSelectIssue(value);
    } else if (otherText.trim() !== "") {
      onSelectIssue(otherText);
    }
  };

  const handleOtherChange = (text: string) => {
    setOtherText(text);
    if (issueType === "Others (Please Specify)") {
      onSelectIssue(text);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.label}>Type of Issue</Text>
      <View style={styles.dropdown}>
        <Picker
          selectedValue={issueType}
          onValueChange={handleSelection}
          style={styles.picker}
          itemStyle={styles.pickerItem}
        >
          <Picker.Item
            label="Select an Issue"
            value=""
            style={styles.pickerItem}
          />
          {issues.map((issue, index) => (
            <Picker.Item
              key={index}
              label={issue}
              value={issue}
              style={styles.pickerItem}
            />
          ))}
        </Picker>
      </View>

      {issueType === "Others (Please Specify)" && (
        <TextInput
          style={styles.input}
          placeholder="Please specify your issue"
          placeholderTextColor="#B6B6B6"
          value={otherText}
          onChangeText={handleOtherChange}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 16,
  },
  label: {
    fontSize: 18,
    marginBottom: 6,
    fontWeight: "bold",
    color: "#073051",
    fontFamily: "Poppins",
  },
  dropdown: {
    height: 45,
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    marginBottom: 12,
    backgroundColor: "#fff",
    justifyContent: "center",
  },
  picker: {
    fontFamily: "Poppins",
    fontSize: 14,
    color: "#000",
  },
  pickerItem: {
    fontFamily: "Poppins",
    fontSize: 14,
    color: "#000",
  },
  input: {
    height: 45,
    borderColor: "#ccc",
    borderWidth: 1,
    borderRadius: 8,
    paddingLeft: 10,
    fontSize: 13,
    backgroundColor: "#fff",
    fontFamily: "Poppins",
  },
});

export default IssueDropdown;
