// Application/frontend/(auth)/CreateProfile.tsx
import React, { useState, useEffect } from "react";
import {
  BackHandler,
  Image,
  Text,
  View,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  useWindowDimensions,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Alert,
  ActivityIndicator,
} from "react-native";
import { router } from "expo-router";
import AttachComp from "../../components/Attachfile";
import ApprovalIcon from "../../assets/images/approval.svg";
import DropDown from "@/components/ui/DropDown";
import { supabase } from "@/scripts/supabase";

export default function CreateProfile() {
  const [step, setStep] = useState(1);

  // Responsive dimensions
  const { width, height } = useWindowDimensions();

  // DROPDOWN STATE
  const [idType, setIdType] = useState("");
  const [openDropdown, setOpenDropdown] = useState<number | null>(null);

  const handleToggle = (index: number, open: boolean) => {
    setOpenDropdown(open ? index : null);
  };

  // FORM FIELDS (added)
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  // ID Images (URIs from AttachComp)
  const [frontIdUri, setFrontIdUri] = useState<string | null>(null);
  const [backIdUri, setBackIdUri] = useState<string | null>(null);

  // Loading state
  const [loading, setLoading] = useState(false);

  // CAMERA FUNCTION (modified to accept which side)
  const handleImage = (uri: string, side: "front" | "back") => {
    console.log("Selected Image:", uri, side);
    if (side === "front") setFrontIdUri(uri);
    else setBackIdUri(uri);
  };

  // BACK BUTTON HANDLING
  useEffect(() => {
    const handleBackPress = () => {
      if (step > 1) {
        setStep((prev) => prev - 1);
        return true;
      }
      return false;
    };

    const backHandler = BackHandler.addEventListener(
      "hardwareBackPress",
      handleBackPress
    );

    return () => backHandler.remove();
  }, [step]);

  // Helper: upload a local file URI to Supabase Storage and return public URL
  const uploadFileToStorage = async (uri: string, userId: string, filenamePrefix: string) => {
    try {
      // fetch the file as blob
      const response = await fetch(uri);
      const blob = await response.blob();

      const ext = uri.split(".").pop() || "jpg";
      const fileName = `${filenamePrefix}_${Date.now()}.${ext}`;
      const path = `${userId}/${fileName}`; // organized by user id

      // upload to "submissions" bucket
      const { error: uploadError } = await supabase.storage
        .from("submissions")
        .upload(path, blob, { upsert: true });

      if (uploadError) {
        console.error("Upload error:", uploadError);
        throw uploadError;
      }

      // get public URL
      const { data } = supabase.storage.from("submissions").getPublicUrl(path);
      return data.publicUrl;
    } catch (err) {
      console.error("uploadFileToStorage error:", err);
      throw err;
    }
  };

  // Step 1: sign up (email confirmation required)
  const handleSignUpStep = async () => {
    if (!firstName.trim() || !lastName.trim() || !email.trim() || !password) {
      Alert.alert("Please fill all fields");
      return;
    }

    setLoading(true);

    try {
      // 1. create auth user
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
      });

      if (error) {
        console.error("SignUp error:", error);
        Alert.alert("Sign Up Failed", error.message);
        setLoading(false);
        return;
      }

      // 2. Ask user to confirm email
      Alert.alert(
        "Verify Your Email",
        "We sent a confirmation link to your inbox. Please verify your email before continuing."
      );

      // ✅ Stop here — do NOT go to Step 2 automatically
      // Profiles insert will happen after login
    } catch (err: any) {
      console.error("handleSignUpStep error:", err);
      Alert.alert("Error", err?.message ?? "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  // Step 2: upload IDs and create submission row
  const handleSubmitIDs = async () => {
    setLoading(true);

    try {
      // ensure user is signed in and we can get their id
      const {
        data: { session },
      } = await supabase.auth.getSession();

      const userId = session?.user?.id;
      if (!userId) {
        Alert.alert("Not logged in", "Please sign in first.");
        setLoading(false);
        return;
      }

      // upload front/back if provided
      let frontUrl: string | null = null;
      let backUrl: string | null = null;

      if (frontIdUri) {
        frontUrl = await uploadFileToStorage(frontIdUri, userId, "front_id");
      }
      if (backIdUri) {
        backUrl = await uploadFileToStorage(backIdUri, userId, "back_id");
      }

      // insert into submissions table
      const { error: submissionError } = await supabase.from("submissions").insert([
        {
          user_id: userId,
          first_name: firstName,
          last_name: lastName,
          submitted_info: `ID Submission (${idType || "N/A"})`,
          front_id_url: frontUrl,
          back_id_url: backUrl,
          type: "Commuter",
          status: "pending",
        },
      ]);

      if (submissionError) {
        console.error("Submission insert error:", submissionError);
        Alert.alert("Submission Error", submissionError.message);
        setLoading(false);
        return;
      }

      // success: go to step 3 (For Approval)
      setStep(3);
    } catch (err: any) {
      console.error("handleSubmitIDs error:", err);
      Alert.alert("Error", err?.message ?? "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  // Handle main button press (keeps your original flow)
  const onPrimaryButtonPress = async () => {
    if (step === 1) {
      // signup step
      await handleSignUpStep();
    } else if (step === 2) {
      // upload IDs
      await handleSubmitIDs();
    } else {
      router.push("/");
    }
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      keyboardVerticalOffset={Platform.OS === "ios" ? 60 : 0}
    >
      <ScrollView
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={{ flexGrow: 1 }}
        style={{ flex: 1, backgroundColor: "#fff" }}
      >
        <View style={viewStyles.container}>
          {/* HEADER */}
          <View>
            <Image
              source={require("@/assets/images/Beepney LOGO.png")}
              style={[
                imageStyles.logo,
                { width: width * 0.7, height: height * 0.18 },
              ]}
            />
            <Text style={[textStyles.header, { fontSize: width * 0.08 }]}>
              Welcome to Beepney!
            </Text>
            <Text style={[textStyles.subheader, { fontSize: width * 0.045 }]}>
              Create an account
            </Text>
          </View>

          {/* STEP 1: BASIC INFO */}
          {step === 1 && (
            <>
              <View style={styleName.rowContainer}>
                <View style={[inputName.inputGroup, { width: "45%" }]}>
                  <Text style={[inputName.label, { fontSize: width * 0.04 }]}>
                    First Name
                  </Text>
                  <TextInput
                    style={[inputName.input, { fontSize: width * 0.035 }]}
                    placeholder="E.g Juan"
                    placeholderTextColor="#B6B6B6"
                    value={firstName}
                    onChangeText={setFirstName}
                  />
                </View>

                <View style={[inputName.inputGroup, { width: "45%" }]}>
                  <Text style={[inputName.label, { fontSize: width * 0.04 }]}>
                    Last Name
                  </Text>
                  <TextInput
                    style={[inputName.input, { fontSize: width * 0.035 }]}
                    placeholder="E.g Dela Cruz"
                    placeholderTextColor="#B6B6B6"
                    value={lastName}
                    onChangeText={setLastName}
                  />
                </View>
              </View>

              <View style={inputStyles.inputGroup}>
                <Text style={[inputStyles.label, { fontSize: width * 0.04 }]}>
                  Email
                </Text>
                <TextInput
                  style={[inputStyles.input, { fontSize: width * 0.035 }]}
                  placeholder="Enter your email"
                  placeholderTextColor="#B6B6B6"
                  value={email}
                  onChangeText={setEmail}
                  keyboardType="email-address"
                  autoCapitalize="none"
                />
              </View>

              <View style={inputStyles.inputGroup}>
                <Text style={[inputStyles.label, { fontSize: width * 0.04 }]}>
                  Password
                </Text>
                <TextInput
                  style={[inputStyles.input, { fontSize: width * 0.035 }]}
                  placeholder="Enter your password"
                  placeholderTextColor="#B6B6B6"
                  secureTextEntry
                  value={password}
                  onChangeText={setPassword}
                />
              </View>

              <View style={inputStyles.inputGroup}>
                <Text style={[inputStyles.label, { fontSize: width * 0.04 }]}>
                  Confirm Password
                </Text>
                <TextInput
                  style={[inputStyles.input, { fontSize: width * 0.035 }]}
                  placeholder="Enter your password"
                  placeholderTextColor="#B6B6B6"
                  secureTextEntry
                />
              </View>
            </>
          )}

          {/* STEP 2: ID & ATTACHMENTS */}
          {step === 2 && (
            <>
              <View style={inputId.inputGroup}>
                <Text style={[inputStyles.label, { fontSize: width * 0.04 }]}>
                  ID Discount
                </Text>
                <DropDown
                  data={["Student", "PWD", "Senior Citizen", "Solo Parent"]}
                  onSelect={(value) => setIdType(value)}
                  isOpen={openDropdown === 1}
                  onToggle={(open) => handleToggle(1, open)}
                />
                <AttachComp
                  label={[
                    "Tap here to take the front",
                    "picture of the ID",
                  ].join("\n")}
                  onImageSelected={(uri: string) => handleImage(uri, "front")}
                />
              </View>

              <View style={inputId.inputGroup}>
                <AttachComp
                  label={[
                    "Tap here to take the back",
                    "picture of the ID",
                  ].join("\n")}
                  onImageSelected={(uri: string) => handleImage(uri, "back")}
                />
              </View>

              <Text style={{ marginTop: height * 0.02, textAlign: "center" }}>
                <Text style={[inputId.idText, { fontSize: width * 0.04 }]}>
                  (e.g PWD ID, Senior Citizen ID, Solo Parent ID
                </Text>
                <Text style={[inputId.idText, { fontSize: width * 0.04 }]}>
                  {"\n"} and Student ID
                </Text>
              </Text>
            </>
          )}

          {/* STEP 3: FOR APPROVAL */}
          {step === 3 && (
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
                {"\t"}Your documents are being reviewed {"\n"} by the Admin.
                Please wait 1-2 Business Days. Will {"\n"} message you through
                email once your account {"\n"} {"\t"} gets verified. Thank you!
              </Text>
              <View>
                <ApprovalIcon style={{ marginTop: height * 0.03 }} />
              </View>
            </View>
          )}

          {/* BUTTON */}
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
                {step === 1 ? "Next" : step === 2 ? "Submit" : "Confirm"}
              </Text>
            )}
          </TouchableOpacity>

          {/* SIGN-IN LINK */}
          {step === 1 && (
            <Text style={{ marginTop: height * 0.02 }}>
              Already have an account?{" "}
              <Text
                style={{ color: "#073051", fontWeight: "bold" }}
                onPress={() => router.push("/(auth)/Login")}
              >
                Sign-In
              </Text>
            </Text>
          )}
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const viewStyles = StyleSheet.create({
  container: {
    alignItems: "center",
    paddingTop: 40,
    backgroundColor: "#fff",
    flex: 1,
  },
});

const imageStyles = StyleSheet.create({
  logo: {
    resizeMode: "contain",
    alignSelf: "center",
  },
});

const textStyles = StyleSheet.create({
  header: {
    fontFamily: "Poppins-Regular",
    fontWeight: "bold",
    textAlign: "center",
    color: "#073051",
    marginTop: 20,
  },
  subheader: {
    fontFamily: "Poppins-Regular",
    textAlign: "center",
    marginTop: 10,
    color: "#073051",
  },
});

const styleName = StyleSheet.create({
  rowContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    marginTop: 20,
    gap: 10,
  },
});

const inputName = StyleSheet.create({
  inputGroup: {
    marginTop: 20,
  },
  label: {
    marginBottom: 6,
    fontWeight: "bold",
    color: "#073051",
    fontFamily: "Poppins",
  },
  input: {
    height: 45,
    borderColor: "#ccc",
    borderWidth: 1,
    borderRadius: 8,
    paddingLeft: 10,
    backgroundColor: "#fff",
    fontFamily: "Poppins",
  },
});

const inputId = StyleSheet.create({
  inputGroup: {
    width: "80%",
    marginTop: 20,
  },
  idText: {
    alignItems: "center",
    color: "#073051",
    textAlign: "center",
    marginTop: 20,
    fontFamily: "Poppins",
  },
});

const inputStyles = StyleSheet.create({
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
  input: {
    height: 45,
    borderColor: "#ccc",
    borderWidth: 1,
    borderRadius: 8,
    paddingLeft: 10,
    backgroundColor: "#fff",
    fontFamily: "Poppins",
  },
});

const styles = StyleSheet.create({
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