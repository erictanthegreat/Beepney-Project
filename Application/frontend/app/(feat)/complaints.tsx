// pages/Complaints.tsx
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
  Alert,
  ActivityIndicator,
} from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import "@fontsource/poppins";
import BackButton from "@/components/Backbutton";
import Attach from "@/components/AttachProof";
import CustomButton from "@/components/ui/CustomButton";
import Input from "@/components/Input";
import IssueDropdown from "@/components/DropdownComplaints";
import { supabase } from "@/scripts/supabase";
import * as FileSystem from "expo-file-system";
import DatePicker from "react-native-date-picker";

interface Attachment {
  id: number;
  uri?: string | null;
  type?: "image" | "video" | null;
}

interface ComplaintsProps {
  params?: any;
}

interface State {
  attachments: Attachment[];
  nextId: number;
  incidentDate: string;
  incidentTime: string;
  name: string;
  contact: string;
  location: string;
  description: string;
  selectedIssue: string;
  complaints: any[];
  role: "commuter" | "driver";
  isUploading: boolean;
  currentUserId: string | null;
  showDatePicker: boolean;
  showTimePicker: boolean;
  selectedDate: Date;
  selectedTime: Date;
}

class Complaints extends Component<ComplaintsProps, State> {
  state: State = {
    attachments: [{ id: 0 }],
    nextId: 1,
    incidentDate: "",
    incidentTime: "",
    name: "",
    contact: "",
    location: "",
    description: "",
    selectedIssue: "",
    complaints: [],
    role: "commuter",
    isUploading: false,
    currentUserId: null,
    showDatePicker: false,
    showTimePicker: false,
    selectedDate: new Date(),
    selectedTime: new Date(),
  };

  componentDidMount() {
    this.fetchUserName();
    this.fetchComplaints();
    this.prefillDriverInfo();
  }

  prefillDriverInfo = () => {
    const { params } = this.props;

    if (params?.driverName) {
      const driverInfo = `Driver Information:
Name: ${params.driverName}
Plate Number: ${params.plateNumber}
Contact: ${params.contactNumber}
Operator Address: ${params.operatorAddress}


Complaint Details:
`;

      this.setState({
        description: driverInfo,
      });
    }
  };

  fetchUserName = async () => {
    try {
      const {
        data: { session },
        error: sessionError,
      } = await supabase.auth.getSession();
      if (sessionError) throw sessionError;
      if (!session?.user) return;

      const userId = session.user.id;
      this.setState({ currentUserId: userId });

      const { data: profile, error } = await supabase
        .from("profiles")
        .select("username, role")
        .eq("id", userId)
        .single();

      if (error) throw error;

      if (profile?.username) this.setState({ name: profile.username });
      if (profile?.role) this.setState({ role: profile.role });
    } catch (err) {
      console.error("Error fetching user name:", err);
    }
  };

  fetchComplaints = async () => {
    try {
      const { data, error } = await supabase.from("complaints").select("*");
      if (error) throw error;
      this.setState({ complaints: data || [] });
      console.log("Fetched complaints:", data);
    } catch (err) {
      console.error("Error fetching complaints:", err);
    }
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
    this.setState({ selectedIssue: issue });
  };

  formatDate = (date: Date): string => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  };

  formatTime = (date: Date): string => {
    let hours = date.getHours();
    const minutes = String(date.getMinutes()).padStart(2, "0");
    const ampm = hours >= 12 ? "PM" : "AM";
    hours = hours % 12 || 12;
    return `${String(hours).padStart(2, "0")}:${minutes} ${ampm}`;
  };

  handleDateConfirm = (date: Date) => {
    this.setState({
      selectedDate: date,
      incidentDate: this.formatDate(date),
      showDatePicker: false,
    });
  };

  handleTimeConfirm = (date: Date) => {
    this.setState({
      selectedTime: date,
      incidentTime: this.formatTime(date),
      showTimePicker: false,
    });
  };

  uploadFileToStorage = async (
    uri: string,
    type: "image" | "video",
    userId: string
  ): Promise<string | null> => {
    try {
      const ext = uri.split(".").pop()?.toLowerCase() || "jpg";
      const timestamp = Date.now();
      const fileName = `proof_${timestamp}_${Math.random()
        .toString(36)
        .substring(7)}.${ext}`;
      const path = `proofs/${userId}/${fileName}`;

      const fileBase64 = await FileSystem.readAsStringAsync(uri, {
        encoding: FileSystem.EncodingType.Base64,
      });

      const fileData = Uint8Array.from(atob(fileBase64), (c) =>
        c.charCodeAt(0)
      );

      const contentType =
        type === "image"
          ? `image/${ext === "jpg" ? "jpeg" : ext}`
          : `video/${ext}`;

      const { error: uploadError } = await supabase.storage
        .from("beepney-bucket")
        .upload(path, fileData, {
          upsert: true,
          contentType,
        });

      if (uploadError) throw uploadError;

      const { data } = supabase.storage
        .from("beepney-bucket")
        .getPublicUrl(path);

      return data.publicUrl;
    } catch (err) {
      console.error("Error uploading file:", err);
      throw err;
    }
  };

  handleSubmit = async () => {
    const {
      name,
      contact,
      location,
      incidentDate,
      incidentTime,
      selectedIssue,
      description,
      attachments,
      role,
      currentUserId,
    } = this.state;

    if (
      !name ||
      !contact ||
      !location ||
      !incidentDate ||
      !incidentTime ||
      !selectedIssue ||
      !description
    ) {
      Alert.alert("Error", "Please fill in all required fields.");
      return;
    }

    if (!currentUserId) {
      Alert.alert("Error", "User not authenticated.");
      return;
    }

    this.setState({ isUploading: true });

    try {
      const validAttachments = attachments.filter((att) => att.uri && att.type);

      const uploadPromises = validAttachments.map((att) =>
        this.uploadFileToStorage(att.uri!, att.type!, currentUserId)
      );

      let proofs: string[] = [];

      if (uploadPromises.length > 0) {
        const uploadedUrls = await Promise.all(uploadPromises);

        proofs = uploadedUrls.filter((url) => url !== null) as string[];

        if (uploadedUrls.length > 0 && proofs.length === 0) {
          Alert.alert(
            "Error",
            "Failed to upload proof files. Please try again."
          );
          this.setState({ isUploading: false });
          return;
        }
      }

      const { error } = await supabase.from("complaints").insert([
        {
          user_id: currentUserId,
          name,
          contact_information: contact,
          location,
          date_of_incident: incidentDate,
          time_of_incident: incidentTime,
          type_of_issues: selectedIssue,
          description,
          proofs,
          status: "Received",
        },
      ]);

      if (error) throw error;

      this.setState({
        contact: "",
        location: "",
        incidentDate: "",
        incidentTime: "",
        selectedIssue: "",
        description: "",
        attachments: [{ id: 0 }],
        nextId: 1,
        isUploading: false,
      });

      Alert.alert("Success", "Complaint submitted successfully!");

      router.push({
        pathname: "/(result)/Review (Commuter)",
        params: { role },
      });
    } catch (err: any) {
      console.error("Error submitting complaint:", err);
      Alert.alert("Error", err?.message ?? "Failed to submit complaint.");
      this.setState({ isUploading: false });
    }
  };

  render() {
    return (
      <View style={rentStyles.container}>
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
              value={this.state.name}
              editable={false}
            />
            <Input
              label={"Contact Information"}
              containerStyle={rentStyles.location}
              placeholder="Enter Phone Number"
              keyboardType="numeric"
              value={this.state.contact}
              onChangeText={(text) => this.setState({ contact: text })}
            />
            <Input
              label={"Location"}
              containerStyle={rentStyles.location}
              placeholder="Enter location"
              value={this.state.location}
              onChangeText={(text) => this.setState({ location: text })}
            />

            {/* Date Picker */}
            <Text style={rentStyles.label}>Date of Incident</Text>
            <TouchableOpacity
              style={rentStyles.dateTimeButton}
              onPress={() => this.setState({ showDatePicker: true })}
            >
              <Text style={rentStyles.dateTimeText}>
                {this.state.incidentDate || "Select Date"}
              </Text>
            </TouchableOpacity>

            <DatePicker
              modal
              open={this.state.showDatePicker}
              date={this.state.selectedDate}
              mode="date"
              maximumDate={new Date()}
              onConfirm={this.handleDateConfirm}
              onCancel={() => this.setState({ showDatePicker: false })}
            />

            {/* Time Picker */}
            <Text style={rentStyles.label}>Time of Incident</Text>
            <TouchableOpacity
              style={rentStyles.dateTimeButton}
              onPress={() => this.setState({ showTimePicker: true })}
            >
              <Text style={rentStyles.dateTimeText}>
                {this.state.incidentTime || "Select Time"}
              </Text>
            </TouchableOpacity>

            <DatePicker
              modal
              open={this.state.showTimePicker}
              date={this.state.selectedTime}
              mode="time"
              onConfirm={this.handleTimeConfirm}
              onCancel={() => this.setState({ showTimePicker: false })}
            />

            <IssueDropdown onSelectIssue={this.handleIssueSelect} />
            <Text style={rentStyles.label}>Description</Text>
            <View style={rentStyles.cont}>
              <TextInput
                style={rentStyles.input}
                placeholder="Enter your complaint here"
                placeholderTextColor="#B6B6B6"
                multiline
                value={this.state.description}
                onChangeText={(text) => this.setState({ description: text })}
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
              onPress={this.state.isUploading ? () => {} : this.addAttachment}
            />
            <CustomButton
              title={
                this.state.isUploading ? "Uploading..." : "Submit Complaint"
              }
              style={[
                rentStyles.submit,
                this.state.isUploading && { opacity: 0.5 },
              ]}
              onPress={this.state.isUploading ? () => {} : this.handleSubmit}
            />
            {this.state.isUploading && (
              <View style={rentStyles.loadingContainer}>
                <ActivityIndicator size="large" color="#0D99FF" />
                <Text style={rentStyles.loadingText}>
                  Uploading files, please wait...
                </Text>
              </View>
            )}
          </ScrollView>
        </KeyboardAvoidingView>
      </View>
    );
  }
}

function ComplaintsWrapper() {
  const params = useLocalSearchParams();
  return <Complaints params={params} />;
}

export default ComplaintsWrapper;

const rentStyles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff" },
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
  cont: { alignItems: "center", marginBottom: 20 },
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
    marginBottom: 15,
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
    top: -14,
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
  loadingContainer: {
    alignItems: "center",
    marginTop: 15,
  },
  loadingText: {
    marginTop: 10,
    color: "#073051",
    fontFamily: "Poppins",
    fontSize: 14,
  },
  dateTimeButton: {
    borderWidth: 1,
    backgroundColor: "white",
    width: "90%",
    paddingVertical: 15,
    paddingHorizontal: 15,
    borderRadius: 8,
    borderColor: "#CBCBCB",
    marginLeft: 21,
    marginBottom: 20,
  },
  dateTimeText: {
    fontSize: 13,
    color: "#595959",
    fontFamily: "Poppins",
  },
});
