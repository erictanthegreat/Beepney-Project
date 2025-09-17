import React, { Component } from "react";
import {
  Text,
  View,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { router } from "expo-router";
import "@fontsource/poppins";
import BackButton from "@/components/Backbutton";
import Attach from "@/components/AttachProof";
import CustomButton from "@/components/ui/CustomButton";
import Input from "@/components/Input";
import IssueDropdown from "@/components/DropdownComplaints";

interface Attachment {
  id: number;
  uri?: string | null;
  type?: "image" | "video" | null;
}

interface State {
  attachments: Attachment[];
  nextId: number;
  incidentDate: string;
  incidentTime: string;
}

export default class Complaints extends Component<{}, State> {
  state: State = {
    attachments: [{ id: 0 }],
    nextId: 1,
    incidentDate: "",
    incidentTime: "",
  };

  addAttachment = () => {
    this.setState((prevState) => ({
      attachments: [...prevState.attachments, { id: prevState.nextId }],
      nextId: prevState.nextId + 1,
    }));
  };

  removeAttachment = (id: number) => {
    this.setState((prevState) => ({
      attachments: prevState.attachments.filter((att) => att.id !== id),
    }));
  };

  handleFileSelected = (
    id: number,
    uri: string | null,
    type: "image" | "video" | null
  ) => {
    this.setState((prevState) => ({
      attachments: prevState.attachments.map((att) =>
        att.id === id ? { ...att, uri, type } : att
      ),
    }));
  };

  handleIssueSelect = (issue: string) => {
    console.log("Selected Issue:", issue);
  };

  handleDateChange = (date: string) => {
    this.setState({ incidentDate: date });
  };

  handleTimeChange = (time: string) => {
    this.setState({ incidentTime: time });
  };

  render() {
    return (
      <View style={rentStyles.container}>
        {/* Static Header */}
        <View>
          <BackButton />
          <Text style={rentStyles.header}>File a Complaint</Text>
          <Text style={rentStyles.description}>
            Report issues to help improve public transportation.
          </Text>
        </View>
        <KeyboardAvoidingView
          style={{ flex: 1 }}
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          keyboardVerticalOffset={Platform.OS === "ios" ? 60 : 0}
        >
          <ScrollView contentContainerStyle={{ paddingBottom: 40 }}>
            <Input
              label={"Name"}
              containerStyle={rentStyles.location}
              placeholder="Enter Name"
            />
            <Input
              label={"Contact Information"}
              containerStyle={rentStyles.location}
              placeholder="Enter Phone Number"
            />

            <Input
              label={"Location"}
              containerStyle={rentStyles.location}
              placeholder="Enter location"
            />

            <Input
              label={"Date of Incident"}
              containerStyle={rentStyles.location}
              placeholder="MM/DD/YYYY"
              value={this.state.incidentDate}
              onChangeText={this.handleDateChange}
            />

            <Input
              label={"Time of Incident"}
              containerStyle={rentStyles.location}
              placeholder="HH:MM AM/PM"
              value={this.state.incidentTime}
              onChangeText={this.handleTimeChange}
            />

            <IssueDropdown onSelectIssue={this.handleIssueSelect} />

            <Text style={rentStyles.label}>Description</Text>
            <View style={rentStyles.cont}>
              <TextInput
                style={rentStyles.input}
                placeholder="Enter your complaint here"
                placeholderTextColor="#B6B6B6"
                multiline
              />
            </View>

            <Text style={rentStyles.label}>Attach Videos or Images</Text>
            {this.state.attachments.map((att) => (
              <View key={att.id}>
                <View style={rentStyles.proof}>
                  <Attach
                    label="Tap here to attach proofs"
                    onFileSelected={(uri, type) =>
                      this.handleFileSelected(att.id, uri, type)
                    }
                  />
                </View>
                <TouchableOpacity
                  onPress={() => this.removeAttachment(att.id)}
                  style={rentStyles.removeButton}
                >
                  <Text style={rentStyles.removeButtonText}>Remove</Text>
                </TouchableOpacity>
              </View>
            ))}

            <CustomButton
              title=" + Add Another Photo/Video"
              style={rentStyles.addButton}
              onPress={this.addAttachment}
            />

            <CustomButton
              title="Submit Complaint"
              style={rentStyles.submit}
              onPress={() => router.push("/")}
            />
          </ScrollView>
        </KeyboardAvoidingView>
      </View>
    );
  }
}

const rentStyles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
  },

  header: {
    fontWeight: "bold",
    fontSize: 25,
    marginLeft: 20,
    marginTop: 10,
    color: "#073051",
    fontFamily: "Poppins",
  },
  description: {
    marginLeft: 25,
    color: "#595959",
    marginBottom: 10,
    fontFamily: "Poppins",
  },
  cont: {
    alignItems: "center",
    marginBottom: 20,
  },
  input: {
    borderWidth: 1,
    backgroundColor: "white",
    width: "90%",
    minHeight: 100,
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderRadius: 15,
    borderColor: "#CBCBCB",
    textAlignVertical: "top",
    fontFamily: "Poppins",
  },
  label: {
    fontSize: 18,
    color: "#073051",
    marginLeft: 20,
    marginBottom: 10,
    fontWeight: "bold",
  },
  addButton: {
    marginTop: 0,
    backgroundColor: "#073051",
    borderRadius: 8,
    alignSelf: "center",
  },
  location: {
    width: "90%",
    marginLeft: 21,
    marginBottom: 20,
    fontSize: 18,
  },

  removeButton: {
    marginHorizontal: 38,
    paddingVertical: 6,
    backgroundColor: "#ff6e6eff",
    borderRadius: 6,
    alignItems: "center",
    position: "relative",
    top: -15,
    borderTopLeftRadius: 0,
    borderTopRightRadius: 0,
  },
  removeButtonText: {
    color: "#fff",
    fontWeight: "bold",
    fontFamily: "Poppins",
  },
  submit: {
    alignSelf: "center",
    width: "90%",
    backgroundColor: "#0D99FF",
  },
  proof: {
    alignItems: "center",
    marginTop: 10,
  },
});
