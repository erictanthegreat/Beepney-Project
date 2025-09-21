import React, { useState } from "react";
import { View, Text, StyleSheet, Image, TouchableOpacity } from "react-native";
import { router } from "expo-router";
import * as ImagePicker from "expo-image-picker";
import BackButton from "../../components/Backbutton";
import ProfileIcon from "../../assets/images/prof.svg";
import EditIcon from "../../assets/images/Edit.svg";
import LogoutIcon from "../../assets/images/logout.svg";
import CommuterIcon from "../../assets/images/commuter.svg";

export default function CommuterProfile() {
  const [profileImage, setProfileImage] = useState<string | null>(null);

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

  return (
    <View>
      {/* Back Button */}
      <BackButton />
      <View style={profStyles.container}>
        <Text style={profStyles.header}>Profile</Text>

        {/* Toggle button: switch to Driver interface */}
        <TouchableOpacity
          onPress={() => router.replace("/(profile)/CommuterProfile")}
          style={profStyles.icon}
        >
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

      {/* Profile Form */}
      <View style={credStyles.container}>
        <View style={credStyles.formGroup}>
          <Text style={credStyles.label}>Name</Text>
          <View style={credStyles.input} />
        </View>

        <View style={credStyles.formGroup}>
          <Text style={credStyles.label}>Email</Text>
          <View style={credStyles.input} />
        </View>

        <View style={credStyles.formGroup}>
          <Text style={credStyles.label}>Password</Text>
          <View style={credStyles.input} />
        </View>

        <View style={credStyles.formGroup}>
          <View style={credStyles.labelRow}>
            <Text style={credStyles.label}>Driver's License</Text>
          </View>
          <View style={[credStyles.input, { height: 150 }]} />
        </View>

        <TouchableOpacity
          onPress={() => router.push("/(auth)/Login")}
          style={credStyles.logoutRow}
        >
          <Text style={credStyles.logoutText}>Logout</Text>
          <LogoutIcon />
        </TouchableOpacity>
      </View>
    </View>
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
    marginBottom: 5,
  },
  label: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#073051",
    marginBottom: 6,
  },
  input: {
    height: 35,
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 20,
    paddingHorizontal: 15,
    backgroundColor: "#fff",
  },
  labelRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 6,
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
