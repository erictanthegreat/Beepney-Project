import React, { useRef, useState, useEffect } from "react";
import {
  useWindowDimensions,
  StyleSheet,
  Text,
  View,
  Image,
  ActivityIndicator,
} from "react-native";
import PagerView from "react-native-pager-view";
import Svg, { Defs, LinearGradient, Stop, Rect } from "react-native-svg";
import { router } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";
import IntroMockup from "../assets/mockups/intro.svg";
import TricyCallMockup from "../assets/mockups/tricy.svg";
import TricyCallMockup1 from "../assets/mockups/tricy 1.svg";
import TricyCallMockup2 from "../assets/mockups/tricy 2.svg";
import SOSMockup from "../assets/mockups/sos.svg";
import FareMockup1 from "../assets/mockups/fare 1.svg";
import FareMockup2 from "../assets/mockups/fare 2.svg";
import CustomButton from "@/components/ui/CustomButton";

export default function Onboarding() {
  const pagerRef = useRef<PagerView>(null);
  const [currentPage, setCurrentPage] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  const { width, height } = useWindowDimensions();

  // Check if user has seen onboarding before
  useEffect(() => {
    checkOnboardingStatus();
  }, []);

  const checkOnboardingStatus = async () => {
    try {
      const hasSeenOnboarding = await AsyncStorage.getItem("hasSeenOnboarding");

      if (hasSeenOnboarding !== null) {
        // User has already seen onboarding, skip to login
        router.replace("/(auth)/Login");
      }
    } catch (error) {
      console.error("Error checking onboarding status:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const completeOnboarding = async () => {
    try {
      await AsyncStorage.setItem("hasSeenOnboarding", "true");
      router.replace("/(auth)/Login");
    } catch (error) {
      console.error("Error saving onboarding status:", error);
      router.replace("/(auth)/Login");
    }
  };

  const handleNext = () => {
    if (currentPage < 3) {
      pagerRef.current?.setPage(currentPage + 1);
    } else {
      completeOnboarding();
    }
  };

  const getButtonLabel = () => {
    if (currentPage === 0) return "Get Started";
    if (currentPage === 3) return "Finish";
    return "Next";
  };

  // Show loading while checking onboarding status
  if (isLoading) {
    return (
      <View style={onboardStyles.loadingContainer}>
        <ActivityIndicator size="large" color="#0D99FF" />
      </View>
    );
  }

  return (
    <View style={{ flex: 1 }}>
      <PagerView
        ref={pagerRef}
        style={onboardStyles.pager}
        initialPage={0}
        onPageSelected={(e) => setCurrentPage(e.nativeEvent.position)}
      >
        {/* Screen 1 */}
        <View style={onboardStyles.page} key="1">
          <Svg height="100%" width="100%" style={StyleSheet.absoluteFill}>
            <Defs>
              <LinearGradient id="grad" x1="0" y1="1" x2="0" y2="0">
                <Stop offset="0" stopColor="#1e90ff" stopOpacity="1" />
                <Stop offset="0.3" stopColor="#ffffff" stopOpacity="0.5" />
              </LinearGradient>
            </Defs>
            <Rect x="0" y="0" width="100%" height="100%" fill="url(#grad)" />
          </Svg>

          <Image
            source={require("../assets/images/Beepney LOGO.png")}
            style={[onboardStyles.logo, { width: width * 0.7 }]}
          />

          <Text style={[onboardStyles.header, { fontSize: width * 0.08 }]}>
            Welcome to Beepney!
          </Text>
          <Text style={[onboardStyles.subheader, { fontSize: width * 0.04 }]}>
            Enhancing every commuter's experience {"\n"}with smarter, safer, and
            more{"\n"} convenient features.
          </Text>
          <View style={[onboardStyles.mockup1, { top: height * 0.1 }]}>
            <IntroMockup width={350} height={height * 0.9} />
          </View>
        </View>

        {/* Screen 2 */}
        <View style={onboardStyles.page} key="2">
          <View style={onboardStyles.container}>
            <Text style={[onboardStyles.header2, { fontSize: width * 0.065 }]}>
              Tricycle at Your Fingertips
            </Text>
            <Text
              style={[onboardStyles.subheader2, { fontSize: width * 0.04 }]}
            >
              Book tricycles instantly and enjoy a {"\n"} hassle-free ride
              anytime.
            </Text>
            <View
              style={[onboardStyles.fareMockup, { marginTop: height * 0.06 }]}
            >
              <TricyCallMockup width={120} height={height * 0.29} />

              <View style={{ marginTop: height * 0.08 }}>
                <TricyCallMockup1 width={120} height={height * 0.29} />
              </View>
              <View style={{ marginTop: height * 0.15 }}>
                <TricyCallMockup2 width={120} height={height * 0.29} />
              </View>
            </View>
          </View>
        </View>

        {/* Screen 3 */}
        <View style={onboardStyles.page} key="3">
          <View style={onboardStyles.container}>
            <Text style={[onboardStyles.header2, { fontSize: width * 0.065 }]}>
              Your Safety, Our Priority
            </Text>
            <Text
              style={[onboardStyles.subheader2, { fontSize: width * 0.04 }]}
            >
              Enhancing every commuter's experience {"\n"} with smarter, safer,
              and more{"\n"} convenient features.
            </Text>
            <View style={{ marginTop: height * 0.02 }}>
              <SOSMockup width={260} height={height * 0.62} />
            </View>
          </View>
        </View>

        {/* Screen 4 */}
        <View style={onboardStyles.page} key="4">
          <View style={onboardStyles.container}>
            <Text style={[onboardStyles.header2, { fontSize: width * 0.065 }]}>
              Fair Fares, Pay with Ease!
            </Text>
            <Text
              style={[onboardStyles.subheader2, { fontSize: width * 0.04 }]}
            >
              Calculate fares accurately, get updated fare {"\n"} matrix and pay
              with ease—no more fare disputes.
            </Text>
            <View
              style={[onboardStyles.fareMockup, { marginTop: height * 0.06 }]}
            >
              <FareMockup1 width={170} height={height * 0.4} />
              <View style={{ marginTop: height * 0.08 }}>
                <FareMockup2 width={170} height={height * 0.4} />
              </View>
            </View>
          </View>
        </View>
      </PagerView>

      {/* Static Button */}
      <CustomButton
        title={getButtonLabel()}
        onPress={handleNext}
        style={[
          onboardStyles.button,
          { width: width * 0.85, bottom: height * 0.08 },
        ]}
      />
    </View>
  );
}

const onboardStyles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#ffffff",
  },
  button: {
    position: "absolute",
    alignSelf: "center",
    elevation: 10,
    backgroundColor: "#0D99FF",
  },
  container: {
    flex: 1,
    alignItems: "center",
    marginTop: "10%",
  },
  pager: {
    flex: 1,
  },
  page: {
    flex: 1,
    alignItems: "center",
    backgroundColor: "#ffffff",
  },
  header: {
    fontWeight: "bold",
    textAlign: "center",
    color: "#073051",
    marginTop: "2%",
  },
  header2: {
    fontWeight: "bold",
    textAlign: "center",
    color: "#073051",
    marginBottom: "2%",
  },
  subheader: {
    fontFamily: "Poppins",
    textAlign: "center",
    marginTop: "3%",
    color: "#073051",
  },
  subheader2: {
    fontFamily: "Poppins",
    textAlign: "center",
    marginTop: "2%",
    color: "#073051",
  },
  fareMockup: {
    flexDirection: "row",
    justifyContent: "center",
  },
  logo: {
    height: undefined,
    aspectRatio: 2,
    resizeMode: "contain",
    alignSelf: "center",
    marginTop: "8%",
  },
  mockup1: {
    alignItems: "center",
    justifyContent: "center",
    flex: 1,
  },
});
