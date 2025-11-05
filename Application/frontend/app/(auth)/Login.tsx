import React, { useState, useEffect } from "react";
import {
  Image,
  Text,
  View,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Alert,
} from "react-native";
import { router } from "expo-router";
import { supabase } from "@/scripts/supabase";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  // ✅ Function to redirect based on role
  const redirectBasedOnRole = async (userId: string) => {
    const { data: profile, error } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", userId)
      .single();

    if (error || !profile) {
      console.error("Error fetching role:", error);
      router.replace("/(commuter)/home"); // fallback
      return;
    }

    if (profile.role === "driver") {
      router.replace("/(driver)/home");
    } else {
      router.replace("/(commuter)/home");
    }
  };

  // ✅ Check if user already logged in
  useEffect(() => {
    const checkSession = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (session?.user) {
        redirectBasedOnRole(session.user.id);
      }
    };
    checkSession();
  }, []);

  // ✅ Handle login
  const handleLogin = async () => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      Alert.alert("Login failed", error.message);
    } else if (data.user) {
      console.log("User logged in:", data.user.id);
      redirectBasedOnRole(data.user.id);
    }
  };

  return (
    <View style={viewStyles.container}>
      <View>
        <Image
          source={require("../../assets/images/Beepney LOGO.png")}
          style={imageStyles.logo}
        />
        <Text style={textStyles.header}>Welcome to Beepney!</Text>
        <Text style={textStyles.subheader}>Sign In to Continue</Text>
      </View>

      <View style={inputStyles.inputGroup}>
        <Text style={inputStyles.label}>Email</Text>
        <TextInput
          style={inputStyles.input}
          placeholder="Enter your email"
          keyboardType="email-address"
          autoCapitalize="none"
          value={email}
          onChangeText={setEmail}
        />
      </View>

      <View style={inputStyles.inputGroup}>
        <Text style={inputStyles.label}>Password</Text>
        <TextInput
          style={inputStyles.input}
          placeholder="Enter your password"
          secureTextEntry
          value={password}
          onChangeText={setPassword}
        />
      </View>

      <TouchableOpacity style={styles.button} onPress={handleLogin}>
        <Text style={styles.buttonText}>Sign In</Text>
      </TouchableOpacity>

      <Text style={{ marginTop: 20 }}>
        Don&apos;t have an Account?{" "}
        <Text
          style={{ color: "#073051", fontFamily: "Poppins" }}
          onPress={() => router.push("/(auth)/createprofile")}
        >
          Sign-up
        </Text>
      </Text>
    </View>
  );
}

const viewStyles = StyleSheet.create({
  container: {
    alignItems: "center",
    paddingTop: 50,
    flex: 1,
    backgroundColor: "#fff",
  },
});

const imageStyles = StyleSheet.create({
  logo: {
    width: 300,
    height: 150,
    resizeMode: "contain",
  },
});

const textStyles = StyleSheet.create({
  header: {
    fontSize: 32,
    fontWeight: "bold",
    textAlign: "center",
    color: "#073051",
    marginTop: 20,
  },
  subheader: {
    fontSize: 19,
    fontFamily: "Poppins",
    textAlign: "center",
    marginTop: 10,
  },
});

const inputStyles = StyleSheet.create({
  inputGroup: {
    width: "80%",
    marginTop: 20,
  },
  label: {
    fontSize: 16,
    marginBottom: 6,
    fontWeight: "bold",
    color: "#073051",
    fontFamily: "Poppins",
  },
  input: {
    borderColor: "#ccc",
    borderWidth: 1,
    borderRadius: 8,
    paddingLeft: 10,
    fontSize: 16,
    backgroundColor: "#fff",
    fontFamily: "Poppins",
  },
});

const styles = StyleSheet.create({
  button: {
    backgroundColor: "#208FCB",
    paddingVertical: 12,
    paddingHorizontal: 32,
    borderRadius: 15,
    marginTop: 150,
    width: "80%",
    alignItems: "center",
  },
  buttonText: {
    color: "#fff",
    fontSize: 16,
    fontFamily: "Poppins",
  },
});
