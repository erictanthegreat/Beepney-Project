import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  ScrollView,
  Alert,
} from "react-native";
import { router } from "expo-router";
import * as ImagePicker from "expo-image-picker";
import { supabase } from "../../scripts/supabase";
import BackButton from "../../components/Backbutton";
import ProfileIcon from "../../assets/images/prof.svg";
import EditIcon from "../../assets/images/Edit.svg";
import LogoutIcon from "../../assets/images/logout.svg";
import CommuterIcon from "../../assets/images/commuter.svg";
import AsyncStorage from "@react-native-async-storage/async-storage";

export default function DriverProfile() {
  const [profileImage, setProfileImage] = useState<string | null>(null);
  const [profileData, setProfileData] = useState<{
    username: string;
    email: string;
  } | null>(null);

  const [submission, setSubmission] = useState<{
    status: "pending" | "approved" | "declined" | null;
    front_id_url: string | null;
    back_id_url: string | null;
  } | null>(null);

  // Fetch profile info + submission status
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

        if (!profileError && profile) {
          setProfileData({
            username: profile.username,
            email: profile.email,
          });
          setProfileImage(profile.avatar_url);
        }

        // Fetch latest submission for Driver
        const { data: latestSubmission, error: submissionError } =
          await supabase
            .from("submissions")
            .select("status, front_id_url, back_id_url")
            .eq("user_id", userId)
            .eq("type", "driver")
            .order("created_at", { ascending: false })
            .limit(1)
            .single();

        if (!submissionError && latestSubmission) {
          setSubmission({
            status: latestSubmission.status.toLowerCase() as
              | "pending"
              | "approved"
              | "declined",
            front_id_url: latestSubmission.front_id_url,
            back_id_url: latestSubmission.back_id_url,
          });
        }
      } catch (err) {
        console.error(err);
      }
    };

    fetchProfileAndStatus();
  }, []);

  // Pick profile image
  const pickImage = async () => {
    const permissionResult =
      await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permissionResult.granted) {
      alert("Permission to access camera roll is required!");
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 1,
    });

    if (!result.canceled) {
      setProfileImage(result.assets[0].uri);
    }
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

  // Switch role back to commuter
  const handleSwitchToCommuter = async () => {
    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (!session?.user) return;

      const userId = session.user.id;

      const { error } = await supabase
        .from("profiles")
        .update({ role: "commuter" })
        .eq("id", userId);

      if (error) {
        Alert.alert("Error", "Could not switch to commuter role.");
        console.error(error);
        return;
      }

      router.replace("/(commuter)/Home");
    } catch (err) {
      console.error(err);
      Alert.alert("Error", "Something went wrong while switching role.");
    }
  };

  return (
    <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
      <BackButton />
      <View style={profStyles.container}>
        <Text style={profStyles.header}>Profile</Text>

        {/* Switch back to Commuter */}
        <TouchableOpacity onPress={handleSwitchToCommuter} style={profStyles.icon}>
          <CommuterIcon />
        </TouchableOpacity>
      </View>
      <Text style={{ marginLeft: 20, color: "#595959" }}>
        View your profile.
      </Text>

      {/* Profile Image */}
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

      {/* Profile Info + Driver License Section */}
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

        {/* Driver License Section */}
        <View style={credStyles.formGroup}>
          <Text style={credStyles.label}>Driver's License</Text>

          {submission?.status === "approved" && submission.front_id_url ? (
            <TouchableOpacity
              style={[credStyles.card, { justifyContent: "center" }]}
              onPress={() =>
                Alert.alert("Driver License Approved", "You can view your driver license images here.")
              }
            >
              <Image
                source={{ uri: submission.front_id_url }}
                style={{ width: "100%", height: 150, borderRadius: 20 }}
                resizeMode="contain"
              />
            </TouchableOpacity>
          ) : (
            <TouchableOpacity
              style={[credStyles.card, { justifyContent: "center", alignItems: "center" }]}
              onPress={() => {
                if (submission?.status === "pending") {
                  Alert.alert(
                    "License Already Submitted",
                    "Your driver license submission is currently under review."
                  );
                  return;
                }
                router.push("/(profile)/ProfileSubmission");
              }}
            >
              <Text>
                {submission?.status === "pending"
                  ? "Pending Submission"
                  : "Tap to submit your Driver's License"}
              </Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Logout */}
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
  card: {
    height: 150,
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 20,
    paddingHorizontal: 15,
    backgroundColor: "#fff",
  },
  logoutRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 20,
  },
  logoutText: {
    color: "red",
    fontSize: 16,
    fontWeight: "bold",
  },
});