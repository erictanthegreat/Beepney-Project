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
  Alert,
  ActivityIndicator,
} from "react-native";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
import { router } from "expo-router";
import { supabase } from "@/scripts/supabase";

export default function CreateProfile() {
  const [step, setStep] = useState(1);
  const { width, height } = useWindowDimensions();
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [selectedRole, setSelectedRole] = useState<"driver" | "commuter">(
    "commuter"
  );
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);

  const [loading, setLoading] = useState(false);

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

  const handleSignUp = async () => {
    if (!firstName.trim() || !lastName.trim() || !email.trim() || !password) {
      Alert.alert("Please fill all fields");
      return;
    }

    if (password !== confirmPassword) {
      Alert.alert("Passwords do not match");
      return;
    }

    setLoading(true);

    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${process.env.NEXT_PUBLIC_SITE_URL || "https://beepney.vercel.app"}/auth/confirm`,
          data: {
            name: `${firstName} ${lastName}`,
            role: selectedRole,
            avatar_url: avatarUrl,
          },
        },
      });

      if (error) {
        console.error("SignUp error:", error);
        Alert.alert("Sign Up Failed", error.message);
        setLoading(false);
        return;
      }

      const user = data.user;
      if (!user) {
        Alert.alert("Error", "No user returned after signup.");
        setLoading(false);
        return;
      }

      Alert.alert(
        "Sign Up Successful",
        "Your account has been created. Please confirm via the email we sent."
      );

      router.push("/(auth)/Login");
    } catch (err: any) {
      console.error("handleSignUp error:", err);
      Alert.alert("Error", err?.message ?? "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAwareScrollView
      style={{ flex: 1, backgroundColor: "#fff" }}
      contentContainerStyle={viewStyles.container}
      enableOnAndroid={true}
      keyboardShouldPersistTaps="handled"
      showsVerticalScrollIndicator={false}
    >
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
          Sign In to Continue
        </Text>
      </View>

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
          placeholder="Confirm password"
          placeholderTextColor="#B6B6B6"
          secureTextEntry
          value={confirmPassword}
          onChangeText={setConfirmPassword}
        />
      </View>

      <TouchableOpacity
        style={[
          styles.button,
          { width: width * 0.8, marginTop: height * 0.05 },
        ]}
        onPress={handleSignUp}
        disabled={loading}
      >
        {loading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={[styles.buttonText, { fontSize: width * 0.045 }]}>
            Sign Up
          </Text>
        )}
      </TouchableOpacity>

      <Text style={{ marginTop: height * 0.02, marginBottom: 30 }}>
        Already have an account?{" "}
        <Text
          style={{ color: "#073051", fontWeight: "bold" }}
          onPress={() => router.push("/(auth)/Login")}
        >
          Sign-In
        </Text>
      </Text>
    </KeyboardAwareScrollView>
  );
}

const viewStyles = StyleSheet.create({
  container: {
    alignItems: "center",
    paddingTop: 25,
    paddingBottom: 20,
    backgroundColor: "#fff",
    flexGrow: 1,
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
    marginTop: 10,
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
