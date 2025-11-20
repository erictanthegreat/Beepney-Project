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
    userId: string;
  } | null>(null);
  const [uploading, setUploading] = useState(false);
  const [submission, setSubmission] = useState<{
    status: "pending" | "approved" | "declined" | null;
    front_id_url: string | null;
    back_id_url: string | null;
  } | null>(null);

  useEffect(() => {
    const fetchProfileAndStatus = async () => {
      try {
        const {
          data: { session },
        } = await supabase.auth.getSession();
        if (!session?.user) return;

        const userId = session.user.id;

        const { data: profile, error: profileError } = await supabase
          .from("profiles")
          .select("username, email, avatar_url")
          .eq("id", userId)
          .single();

        if (!profileError && profile) {
          setProfileData({
            username: profile.username,
            email: profile.email,
            userId: userId,
          });
          setProfileImage(profile.avatar_url);
        }

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

  const pickImage = async () => {
    const permissionResult =
      await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permissionResult.granted) {
      Alert.alert(
        "Permission Required",
        "Permission to access camera roll is required!"
      );
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.8,
      allowsEditing: true,
      aspect: [1, 1],
    });

    if (!result.canceled && profileData?.userId) {
      await uploadImage(result.assets[0].uri);
    }
  };

  const uploadImage = async (imageUri: string) => {
    try {
      setUploading(true);

      // Get file extension
      const fileExt = imageUri.split(".").pop()?.toLowerCase() || "jpg";
      const fileName = `avatar_${Date.now()}.${fileExt}`;
      const filePath = `pics/${profileData?.userId}/${fileName}`;

      // Read the file as base64
      const base64 = await fetch(imageUri)
        .then((res) => res.blob())
        .then((blob) => {
          return new Promise<string>((resolve, reject) => {
            const reader = new FileReader();
            reader.onloadend = () => {
              const base64data = reader.result as string;
              resolve(base64data.split(",")[1]); // Remove data:image/jpeg;base64, prefix
            };
            reader.onerror = reject;
            reader.readAsDataURL(blob);
          });
        });

      // Convert base64 to Uint8Array
      const binaryString = atob(base64);
      const bytes = new Uint8Array(binaryString.length);
      for (let i = 0; i < binaryString.length; i++) {
        bytes[i] = binaryString.charCodeAt(i);
      }

      // Upload to Supabase Storage
      const { error: uploadError } = await supabase.storage
        .from("beepney-bucket")
        .upload(filePath, bytes, {
          contentType: `image/${fileExt}`,
          upsert: true,
        });

      if (uploadError) {
        throw uploadError;
      }

      // Get public URL
      const { data: publicUrlData } = supabase.storage
        .from("beepney-bucket")
        .getPublicUrl(filePath);

      const newAvatarUrl = publicUrlData.publicUrl;

      // Update profile in database
      const { error: updateError } = await supabase
        .from("profiles")
        .update({ avatar_url: newAvatarUrl })
        .eq("id", profileData?.userId);

      if (updateError) {
        throw updateError;
      }

      // Update local state
      setProfileImage(newAvatarUrl);
      Alert.alert("Success", "Profile picture updated successfully!");
    } catch (error: any) {
      console.error("Error uploading image:", error);
      Alert.alert(
        "Upload Error",
        error.message || "Failed to upload image. Please check your connection."
      );
    } finally {
      setUploading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
      await AsyncStorage.clear();
      router.replace("/(auth)/Login");
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

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

        <TouchableOpacity
          onPress={handleSwitchToCommuter}
          style={profStyles.icon}
        >
          <CommuterIcon />
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
        <TouchableOpacity
          onPress={pickImage}
          style={profStyles.editIcon}
          disabled={uploading}
        >
          {uploading ? (
            <ActivityIndicator size="small" color="#073051" />
          ) : (
            <EditIcon />
          )}
        </TouchableOpacity>
      </View>

      <View style={credStyles.container}>
        <View style={credStyles.formGroup}>
          <Text style={credStyles.label}>Name</Text>
          <View style={credStyles.input}>
            <Text style={{ padding: 10 }}>
              {profileData?.username ?? "Loading..."}
            </Text>
          </View>
        </View>

        <View style={credStyles.formGroup}>
          <Text style={credStyles.label}>Email</Text>
          <View style={credStyles.input}>
            <Text style={{ padding: 10 }}>
              {profileData?.email ?? "Loading..."}
            </Text>
          </View>
        </View>

        <View style={credStyles.formGroup}>
          <Text style={credStyles.label}>Password</Text>
          <View style={credStyles.input}>
            <Text style={{ padding: 10 }}>********</Text>
          </View>
        </View>

        <View style={credStyles.formGroup}>
          <Text style={credStyles.label}>Driver's License</Text>

          {submission?.status === "approved" && submission.front_id_url ? (
            <TouchableOpacity
              style={[credStyles.card, { justifyContent: "center" }]}
              onPress={() =>
                Alert.alert(
                  "Driver License Approved",
                  "You can view your driver license images here."
                )
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
              style={[
                credStyles.card,
                { justifyContent: "center", alignItems: "center" },
              ]}
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
