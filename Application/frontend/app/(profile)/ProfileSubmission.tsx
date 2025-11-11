import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  Image,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Alert,
  ActivityIndicator,
  useWindowDimensions,
  TouchableOpacity,
} from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import { supabase } from "../../scripts/supabase";
import AttachComp from "../../components/Attachfile";
import DropDown from "../../components/ui/DropDown";
import { router } from "expo-router";
import ApprovalIcon from "../../assets/images/approval.svg";
import BackButton from "../../components/Backbutton";
import * as FileSystem from "expo-file-system";

export default function ProfileSubmission() {
  const { width, height } = useWindowDimensions();

  const [step, setStep] = useState(1);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [fullName, setFullName] = useState<string | null>(null);
  const [idType, setIdType] = useState("");
  const [openDropdown, setOpenDropdown] = useState<number | null>(null);
  const [frontIdUri, setFrontIdUri] = useState<string | null>(null);
  const [backIdUri, setBackIdUri] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [userType, setUserType] = useState<string | null>(null);

  useEffect(() => {
    if (userType === "driver") {
      setIdType("Jeepney");
    } else if (userType === "commuter") {
      setIdType("Student");
    } else {
      setIdType("");
    }
  }, [userType]);

  const handleToggle = (index: number, open: boolean) => {
    setOpenDropdown(open ? index : null);
  };

  const handleImage = (uri: string, side: "front" | "back") => {
    if (side === "front") setFrontIdUri(uri);
    else setBackIdUri(uri);
  };

  const uploadFileToStorage = async (
    uri: string,
    userId: string,
    filenamePrefix: string
  ) => {
    try {
      const ext = uri.split(".").pop() || "jpg";
      const fileName = `${filenamePrefix}_${Date.now()}.${ext}`;
      const path = `submissions/${userId}/${fileName}`;

      const fileBase64 = await FileSystem.readAsStringAsync(uri, {
        encoding: FileSystem.EncodingType.Base64,
      });
      const fileData = Uint8Array.from(atob(fileBase64), (c) =>
        c.charCodeAt(0)
      );

      const { error: uploadError } = await supabase.storage
        .from("beepney-bucket")
        .upload(path, fileData, {
          upsert: true,
          contentType: `image/${ext}`,
        });

      if (uploadError) throw uploadError;

      const { data } = supabase.storage
        .from("beepney-bucket")
        .getPublicUrl(path);
      return data.publicUrl;
    } catch (err) {
      console.error(err);
      throw err;
    }
  };

  const fetchUserAndRole = useCallback(async () => {
    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (!session?.user) {
        Alert.alert("Error", "User not authenticated");
        router.replace("/(auth)/Login");
        return;
      }
      setCurrentUserId(session.user.id);

      const { data: profile, error: profileError } = await supabase
        .from("profiles")
        .select("username, role")
        .eq("id", session.user.id)
        .single();

      if (!profileError && profile) {
        setFullName(profile.username ?? null);

        if (profile.role && typeof profile.role === "string") {
          const normalized = profile.role.toLowerCase();
          if (normalized === "commuter" || normalized === "driver") {
            setUserType(normalized);

            return;
          }
        }
      }

      const { data: commuter } = await supabase
        .from("commuterprofiles")
        .select("id")
        .eq("id", session.user.id)
        .maybeSingle();

      const { data: driver } = await supabase
        .from("driverprofiles")
        .select("id")
        .eq("id", session.user.id)
        .maybeSingle();

      if (commuter && (commuter as any).id) {
        setUserType("commuter");
      } else if (driver && (driver as any).id) {
        setUserType("driver");
      } else {
        setUserType(null);
      }
    } catch (err) {
      console.error("fetchUserAndRole error:", err);
    }
  }, []);

  useEffect(() => {
    fetchUserAndRole();
  }, [fetchUserAndRole]);

  useFocusEffect(
    useCallback(() => {
      fetchUserAndRole();
    }, [fetchUserAndRole])
  );

  const handleSubmitIDs = async () => {
    if (!currentUserId) return;

    setLoading(true);
    try {
      let frontUrl: string | null = null;
      let backUrl: string | null = null;

      if (frontIdUri)
        frontUrl = await uploadFileToStorage(
          frontIdUri,
          currentUserId,
          "front_id"
        );
      if (backIdUri)
        backUrl = await uploadFileToStorage(
          backIdUri,
          currentUserId,
          "back_id"
        );

      const submissionPayload = {
        user_id: currentUserId,
        submitted_info:
          userType === "commuter" ? "ID Discount" : "Driver's License",
        front_id_url: frontUrl,
        back_id_url: backUrl,
        submission_type:
          idType || (userType === "commuter" ? "Student" : "Jeepney"),
        type: userType ?? "commuter",
        status: "Pending",
      };

      const { error } = await supabase
        .from("submissions")
        .insert([submissionPayload]);

      if (error) throw error;

      setStep(2);
    } catch (err: any) {
      console.error(err);
      Alert.alert("Error", err?.message ?? "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  const onPrimaryButtonPress = async () => {
    if (step === 1) {
      await handleSubmitIDs();
    } else {
      console.log("Navigating, userType =", userType);
      if (userType === "driver") {
        router.push("/(driver)/Home");
      } else if (userType === "commuter") {
        router.push("/(commuter)/Home");
      } else {
        router.push("/Home");
      }
    }
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      keyboardVerticalOffset={Platform.OS === "ios" ? 60 : 0}
    >
      <ScrollView
        contentContainerStyle={{ flexGrow: 1, alignItems: "center" }}
        keyboardShouldPersistTaps="handled"
        style={{ flex: 1, backgroundColor: "#fff" }}
      >
        <View style={styles.backButtonWrapper}>
          <BackButton />
        </View>

        <Image
          source={require("@/assets/images/Beepney LOGO.png")}
          style={[styles.logo, { width: width * 0.7, height: height * 0.18 }]}
        />

        {step === 1 && (
          <>
            <View style={styles.inputGroup}>
              <Text style={[styles.label, { fontSize: width * 0.04 }]}>
                {userType === "driver" ? "Driver's License" : "ID Discount"}
              </Text>

              <DropDown
                data={
                  userType === "driver"
                    ? ["Jeepney", "UV Express", "Tricycle"]
                    : ["Student", "PWD", "Senior Citizen", "Solo Parent"]
                }
                value={idType}
                onSelect={(value) => setIdType(value)}
                isOpen={openDropdown === 1}
                onToggle={(open) => handleToggle(1, open)}
              />

              <View style={{ marginTop: 12, marginBottom: 6 }}>
                <AttachComp
                  label={
                    userType === "driver"
                      ? "Tap here to take the front picture of the Driver's License"
                      : "Tap here to take the front picture of the ID"
                  }
                  onImageSelected={(uri: string) => handleImage(uri, "front")}
                />
              </View>
            </View>

            <View style={styles.inputGroup}>
              <AttachComp
                label={
                  userType === "driver"
                    ? "Tap here to take the back picture of the Driver's License"
                    : "Tap here to take the back picture of the ID"
                }
                onImageSelected={(uri: string) => handleImage(uri, "back")}
              />
            </View>

            <Text style={{ marginTop: height * 0.02, textAlign: "center" }}>
              {userType === "driver" ? (
                <Text style={[styles.idText, { fontSize: width * 0.04 }]}>
                  Please upload a clear photo of your Driver's License (front
                  and back).
                </Text>
              ) : (
                <>
                  <Text style={[styles.idText, { fontSize: width * 0.04 }]}>
                    (e.g PWD ID, Senior Citizen ID, Solo Parent ID
                  </Text>
                  <Text style={[styles.idText, { fontSize: width * 0.04 }]}>
                    {"\n"} and Student ID)
                  </Text>
                </>
              )}
            </Text>
          </>
        )}

        {step === 2 && (
          <View style={{ alignItems: "center" }}>
            <Text
              style={{
                fontSize: width * 0.09,
                marginTop: height * 0.05,
                fontFamily: "Poppins",
                fontWeight: "bold",
                color: "#073051",
              }}
            >
              For Approval
            </Text>
            <Text
              style={{
                textAlign: "center",
                marginTop: height * 0.02,
                color: "#073051",
                fontSize: width * 0.04,
              }}
            >
              Your documents are being reviewed by the Admin.
              {"\n"}Please wait 1-2 Business Days. Will message you through
              email once verified. Thank you!
            </Text>
            <View>
              <ApprovalIcon style={{ marginTop: height * 0.03 }} />
            </View>
          </View>
        )}

        <TouchableOpacity
          style={[
            styles.button,
            { width: width * 0.8, marginTop: height * 0.05 },
          ]}
          onPress={onPrimaryButtonPress}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={[styles.buttonText, { fontSize: width * 0.045 }]}>
              {step === 1 ? "Submit" : "Confirm"}
            </Text>
          )}
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  backButtonWrapper: {
    position: "absolute",
    left: 20,
    zIndex: 10,
  },
  logo: {
    resizeMode: "contain",
    alignSelf: "center",
    marginTop: 50,
  },
  inputGroup: {
    width: "80%",
    marginTop: 20,
  },
  label: {
    marginBottom: 6,
    fontWeight: "bold",
    color: "#073051",
    fontFamily: "Poppins",
  },
  idText: {
    alignItems: "center",
    color: "#073051",
    textAlign: "center",
    marginTop: 20,
    fontFamily: "Poppins",
  },
  button: {
    backgroundColor: "#208FCB",
    paddingVertical: 12,
    borderRadius: 15,
    alignItems: "center",
  },
  buttonText: {
    color: "#fff",
    fontWeight: "bold",
  },
});
