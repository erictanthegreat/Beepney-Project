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
} from "react-native";
import { router } from "expo-router";
import AttachComp from "../../components/Attachfile";
import ApprovalIcon from "../../assets/images/approval.svg";
import DropDown from "@/components/ui/DropDown";

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

  // CAMERA FUNCTION
  const handleImage = (uri: string) => {
    console.log("Selected Image:", uri);
    // -> SEND TO BACKEND <-
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

  return (
    <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
      <View style={viewStyles.container}>
        {/* STATIC HEADER */}
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
                label={["Tap here to take the front", "picture of the ID"].join(
                  "\n"
                )}
                onImageSelected={handleImage}
              />
            </View>

            <View style={inputId.inputGroup}>
              <AttachComp
                label={["Tap here to take the back", "picture of the ID"].join(
                  "\n"
                )}
                onImageSelected={handleImage}
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
          onPress={() => {
            if (step === 1) {
              setStep(2);
            } else if (step === 2) {
              setStep(3);
            } else {
              router.push("/");
            }
          }}
        >
          <Text style={[styles.buttonText, { fontSize: width * 0.045 }]}>
            {step === 1 ? "Next" : step === 2 ? "Submit" : "Confirm"}
          </Text>
        </TouchableOpacity>

        {/* SIGN-IN LINK */}
        {step === 1 && (
          <Text style={{ marginTop: height * 0.02 }}>
            Already have an account?{" "}
            <Text
              style={{ color: "#073051", fontWeight: "bold" }}
              onPress={() => router.push("/")}
            >
              Sign-In
            </Text>
          </Text>
        )}
      </View>
    </ScrollView>
  );
}

const viewStyles = StyleSheet.create({
  container: {
    alignItems: "center",
    paddingTop: 40,
    flex: 1,
    backgroundColor: "#fff",
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
    fontFamily: "Poppins-Regular",
  },
  input: {
    height: 45,
    borderColor: "#ccc",
    borderWidth: 1,
    borderRadius: 8,
    paddingLeft: 10,
    backgroundColor: "#fff",
    fontFamily: "Poppins-Regular",
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
    fontFamily: "Poppins-Regular",
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
