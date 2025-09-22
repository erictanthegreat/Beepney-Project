import React, { useState, useEffect } from "react";
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

  const handleToggle = (index: number, open: boolean) => {
    setOpenDropdown(open ? index : null);
  };

  const handleImage = (uri: string, side: "front" | "back") => {
    if (side === "front") setFrontIdUri(uri);
    else setBackIdUri(uri);
  };

  const uploadFileToStorage = async (uri: string, userId: string, filenamePrefix: string) => {
    try {
      const ext = uri.split(".").pop() || "jpg";
      const fileName = `${filenamePrefix}_${Date.now()}.${ext}`;
      const path = `submissions/${userId}/${fileName}`;

      const fileBase64 = await FileSystem.readAsStringAsync(uri, { encoding: FileSystem.EncodingType.Base64 });
      const fileData = Uint8Array.from(atob(fileBase64), (c) => c.charCodeAt(0));

      const { error: uploadError } = await supabase.storage
        .from("beepney-bucket")
        .upload(path, fileData, {
          upsert: true,
          contentType: `image/${ext}`,
        });

      if (uploadError) throw uploadError;

      const { data } = supabase.storage.from("beepney-bucket").getPublicUrl(path);
      return data.publicUrl;
    } catch (err) {
      console.error(err);
      throw err;
    }
  };

  useEffect(() => {
    const getSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user) {
        Alert.alert("Error", "User not authenticated");
        router.replace("/(auth)/Login");
        return;
      }
      setCurrentUserId(session.user.id);

      // ✅ Fetch full_name from profiles
      const { data: profile, error: profileError } = await supabase
        .from("profiles")
        .select("username")
        .eq("id", session.user.id)
        .single();

      if (!profileError && profile) {
        setFullName(profile.username);
      }

      // ✅ Detect whether the user is commuter or driver
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

      if (commuter) setUserType("Commuter");
      if (driver) setUserType("Driver");
    };
    getSession();
  }, []);

  const handleSubmitIDs = async () => {
    if (!currentUserId) return;

    setLoading(true);
    try {
      let frontUrl: string | null = null;
      let backUrl: string | null = null;

      if (frontIdUri) frontUrl = await uploadFileToStorage(frontIdUri, currentUserId, "front_id");
      if (backIdUri) backUrl = await uploadFileToStorage(backIdUri, currentUserId, "back_id");

      const { error } = await supabase.from("submissions").insert([
        {
          user_id: currentUserId,
          submitted_info: "ID Discount" + idType,
          front_id_url: frontUrl,
          back_id_url: backUrl,
          submission_type: idType || "Student",
          type: userType || "Commuter",  // ✅ either "Commuter" or "Driver"
          status: "Pending",
        },
      ]);

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
      router.push("/Home"); 
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
        {/* BACK BUTTON TOP LEFT */}
        <View style={styles.backButtonWrapper}>
          <BackButton />
        </View>

        {/* HEADER LOGO */}
        <Image
          source={require("@/assets/images/Beepney LOGO.png")}
          style={[styles.logo, { width: width * 0.7, height: height * 0.18 }]}
        />

        {/* STEP 1: SUBMIT ID */}
        {step === 1 && (
          <>
            <View style={styles.inputGroup}>
              <Text style={[styles.label, { fontSize: width * 0.04 }]}>
                ID Discount
              </Text>
              <DropDown
                data={["Student", "PWD", "Senior Citizen", "Solo Parent"]}
                onSelect={(value) => setIdType(value)}
                isOpen={openDropdown === 1}
                onToggle={(open) => handleToggle(1, open)}
              />
              <AttachComp
                label="Tap here to take the front picture of the ID"
                onImageSelected={(uri: string) => handleImage(uri, "front")}
              />
            </View>

            <View style={styles.inputGroup}>
              <AttachComp
                label="Tap here to take the back picture of the ID"
                onImageSelected={(uri: string) => handleImage(uri, "back")}
              />
            </View>

            <Text style={{ marginTop: height * 0.02, textAlign: "center" }}>
              <Text style={[styles.idText, { fontSize: width * 0.04 }]}>
                (e.g PWD ID, Senior Citizen ID, Solo Parent ID
              </Text>
              <Text style={[styles.idText, { fontSize: width * 0.04 }]}>
                {"\n"} and Student ID)
              </Text>
            </Text>
          </>
        )}

        {/* STEP 2: FOR APPROVAL */}
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

        {/* BUTTON */}
        <TouchableOpacity
          style={[styles.button, { width: width * 0.8, marginTop: height * 0.05 }]}
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
    top: 50,
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