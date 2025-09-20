import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  ScrollView,
  Alert,
  ActivityIndicator,
} from "react-native";
import { router } from "expo-router";
import * as ImagePicker from "expo-image-picker";
import { supabase } from "../../scripts/supabase";
import DriverButton from "../../assets/images/driver.svg";
import BackButton from "../../components/Backbutton";
import ProfileIcon from "../../assets/images/prof.svg";
import EditIcon from "../../assets/images/Edit.svg";
import DriverIcon from "../../assets/images/driber.svg";
import LogoutIcon from "../../assets/images/logout.svg";
import AsyncStorage from "@react-native-async-storage/async-storage";

export default function CommuterProfile() {
  const [profileImage, setProfileImage] = useState<string | null>(null);
  const [submissionStatus, setSubmissionStatus] = useState<
    "pending" | "approved" | null
  >(null);

  const [profileData, setProfileData] = useState<{
    username: string;
    email: string;
  } | null>(null);

  // Fetch profile info and submission status on mount
  useEffect(() => {
    const fetchProfileAndStatus = async () => {
      try {
        const {
          data: { session },
        } = await supabase.auth.getSession();
        if (!session?.user) return;

        const userId = session.user.id;

        // Fetch profile
        const { data: profile, error: profileError } = await supabase
          .from("profiles")
          .select("username, email, avatar_url")
          .eq("id", userId)
          .single();

        if (profileError) {
          console.error(profileError);
        } else {
          setProfileData({
            username: profile.username,
            email: profile.email,
          });
          setProfileImage(profile.avatar_url);
        }

        // Fetch latest submission status
        const { data: submission, error: submissionError } = await supabase
          .from("submissions")
          .select("status")
          .eq("user_id", userId)
          .order("created_at", { ascending: false })
          .limit(1)
          .single();

        if (!submissionError && submission?.status) {
          setSubmissionStatus(submission.status);
        }
      } catch (err) {
        console.error(err);
      }
    };

    fetchProfileAndStatus();
  }, []);

  // Profile image picker
  const pickImage = async () => {
    const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permissionResult.granted) {
      alert("Permission to access camera roll is required!");
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: "images", // lowercase
      quality: 1,
    });

    if (!result.canceled) setProfileImage(result.assets[0].uri);
  };
  
  // Logout
  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
      await AsyncStorage.clear();
      router.replace("/(auth)/Login");
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  // Redirect to submission screen
  const handleIdPress = () => {
    if (submissionStatus === "pending" || submissionStatus === "approved") {
      Alert.alert(
        "ID Already Submitted",
        "Your ID submission is currently under review or approved."
      );
      return;
    }
    router.push("/(profile)/ProfileSubmission"); // <-- redirect to new submission screen
  };

  return (
    <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
      <BackButton />
      <View style={profStyles.container}>
        <Text style={profStyles.header}>Profile</Text>
        <TouchableOpacity
          onPress={() => router.replace("/(driver)/Home")}
          style={profStyles.icon}
        >
          <DriverButton />
        </TouchableOpacity>
      </View>
      <Text style={{ marginLeft: 20, color: "#595959" }}>
        View your profile.
      </Text>

      <View style={profStyles.profileContainer}>
        {profileImage ? (
          <Image
            source={{ uri: profileImage }}
            style={profStyles.profileImage}
          />
        ) : (
          <ProfileIcon />
        )}
        <TouchableOpacity onPress={pickImage} style={profStyles.editIcon}>
          <EditIcon />
        </TouchableOpacity>
      </View>

      <View style={credStyles.container}>
        {/* Name */}
        <View style={credStyles.formGroup}>
          <Text style={credStyles.label}>Name</Text>
          <View style={credStyles.input}>
            <Text style={{ padding: 10 }}>
              {profileData?.username ?? "Loading..."}
            </Text>
          </View>
        </View>

        {/* Email */}
        <View style={credStyles.formGroup}>
          <Text style={credStyles.label}>Email</Text>
          <View style={credStyles.input}>
            <Text style={{ padding: 10 }}>
              {profileData?.email ?? "Loading..."}
            </Text>
          </View>
        </View>

        {/* Password */}
        <View style={credStyles.formGroup}>
          <Text style={credStyles.label}>Password</Text>
          <View style={credStyles.input}>
            <Text style={{ padding: 10 }}>********</Text>
          </View>
        </View>

        {/* ID Discount Section */}
        <View style={credStyles.formGroup}>
          <Text style={credStyles.label}>ID Discount</Text>
          <TouchableOpacity
            style={[
              credStyles.input,
              { justifyContent: "center", alignItems: "center" },
            ]}
            onPress={handleIdPress}
          >
            <Text>
              {submissionStatus === "pending"
                ? "Pending Submission"
                : submissionStatus === "approved"
                ? "ID Approved"
                : "Tap to submit your ID"}
            </Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity
          onPress={() => router.push("/(auth)/DriverProfile")}
          style={credStyles.driverRow}
        >
          <Text style={credStyles.driverText}>Drive with Beepney</Text>
          <DriverIcon />
        </TouchableOpacity>

        <TouchableOpacity onPress={handleLogout} style={credStyles.logoutRow}>
          <Text style={credStyles.logoutText}>Logout</Text>
          <LogoutIcon />
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const profStyles = StyleSheet.create({
  container: {
    alignItems: "flex-start",
    flexDirection: "row",
  },
  header: {
    fontWeight: "bold",
    alignItems: "flex-start",
    fontSize: 25,
    marginRight: 210,
    marginLeft: 20,
    marginTop: 10,
    color: "#073051",
  },
  icon: {
    marginTop: 5,
  },
  profileContainer: {
    position: "relative",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 20,
  },
  profileImage: {
    width: 120,
    height: 120,
    borderRadius: 60,
  },
  editIcon: {
    position: "absolute",
    bottom: 5,
    right: 130,
  },
});

const credStyles = StyleSheet.create({
  container: {
    backgroundColor: "#fff",
    padding: 20,
    margin: 20,
    borderRadius: 10,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  formGroup: {
    marginBottom: 10,
  },
  label: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#073051",
    marginBottom: 6,
  },
  input: {
    height: 40,
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 20,
    paddingHorizontal: 15,
    backgroundColor: "#fff",
  },
  driverRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 5,
  },
  driverText: {
    color: "#073051",
    fontWeight: "bold",
    fontSize: 16,
  },
  logoutRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 10,
  },
  logoutText: {
    color: "red",
    fontSize: 16,
    fontWeight: "bold",
  },
});