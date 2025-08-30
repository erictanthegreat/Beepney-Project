import React, { useRef, useState } from "react";
import { Dimensions, StyleSheet, Text, View, Image } from "react-native";
import PagerView from "react-native-pager-view";
import Svg, { Defs, LinearGradient, Stop, Rect } from "react-native-svg";
import { router } from "expo-router";
import IntroMockup from "../assets/mockups/intro.svg";
import TricyCallMockup from "../assets/mockups/tricy.svg";
import TricyCallMockup1 from "../assets/mockups/tricy 1.svg";
import TricyCallMockup2 from "../assets/mockups/tricy 2.svg";
import SOSMockup from "../assets/mockups/sos.svg";
import FareMockup1 from "../assets/mockups/fare 1.svg";
import FareMockup2 from "../assets/mockups/fare 2.svg";
import CustomButton from "@/components/ui/CustomButton";

const { width, height } = Dimensions.get("window");

export default function Onboarding() {
  const pagerRef = useRef<PagerView>(null);
  const [currentPage, setCurrentPage] = useState(0);

  const handleNext = () => {
    if (currentPage < 3) {
      pagerRef.current?.setPage(currentPage + 1);
    } else {
      router.push("/(auth)/login");
    }
  };

  const getButtonLabel = () => {
    if (currentPage === 0) return "Get Started";
    if (currentPage === 3) return "Finish";
    return "Next";
  };

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
            style={onboardStyles.logo}
          />

          <Text style={onboardStyles.header}>Welcome to Beepney!</Text>
          <Text style={onboardStyles.subheader}>
            Enhancing every commuter's experience {"\n"}with smarter, safer, and
            more{"\n"} convenient features.
          </Text>
          <View style={onboardStyles.mockup1}>
            <IntroMockup width={350} height={height * 0.9} />
          </View>
        </View>

        {/* Screen 2 */}
        <View style={onboardStyles.page} key="2">
          <View style={onboardStyles.container}>
            <Text style={onboardStyles.header2}>
              Tricycle at Your Fingertips
            </Text>
            <Text style={onboardStyles.subheader2}>
              Book tricycles instantly and enjoy a {"\n"} hassle-free ride
              anytime.
            </Text>
            <View style={onboardStyles.fareMockup}>
              <TricyCallMockup width={120} height={height * 0.29} />
              <View style={{ marginTop: 80 }}>
                <TricyCallMockup1 width={120} height={height * 0.29} />
              </View>
              <View style={{ marginTop: 130 }}>
                <TricyCallMockup2 width={120} height={height * 0.29} />
              </View>
            </View>
          </View>
        </View>

        {/* Screen 3 */}
        <View style={onboardStyles.page} key="3">
          <View style={onboardStyles.container}>
            <Text style={onboardStyles.header2}>Your Safety, Our Priority</Text>
            <Text style={onboardStyles.subheader2}>
              Enhancing every commuter's experience {"\n"} with smarter, safer,
              and more{"\n"} convenient features.
            </Text>
            <View style={{ marginTop: 10 }}>
              <SOSMockup width={260} height={height * 0.62} />
            </View>
          </View>
        </View>

        {/* Screen 4 */}
        <View style={onboardStyles.page} key="4">
          <View style={onboardStyles.container}>
            <Text style={onboardStyles.header2}>
              Fair Fares, Pay with Ease!
            </Text>
            <Text style={onboardStyles.subheader2}>
              Calculate fares accurately, get updated fare {"\n"} matrix and pay
              with ease—no more fare disputes.
            </Text>
            <View style={onboardStyles.fareMockup}>
              <FareMockup1 width={170} height={height * 0.4} />
              <View style={{ marginTop: 80 }}>
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
        style={onboardStyles.button}
      />
    </View>
  );
}

const onboardStyles = StyleSheet.create({
  button: {
    position: "absolute",
    bottom: 70,
    alignSelf: "center",
    width: "85%",
    elevation: 10,
    backgroundColor: "#0D99FF",
  },
  container: {
    flex: 1,
    alignItems: "center",
    marginTop: 80,
  },
  pager: {
    flex: 1,
  },
  page: {
    width,
    height,
    alignItems: "center",
    backgroundColor: "#ffffff",
  },
  header: {
    fontSize: 32,
    fontWeight: "bold",
    textAlign: "center",
    color: "#073051",
  },
  header2: {
    fontSize: 25,
    fontWeight: "bold",
    textAlign: "center",
    color: "#073051",
  },
  subheader: {
    fontSize: 15,
    fontFamily: "Poppins",
    textAlign: "center",
    marginTop: 10,
    color: "#073051",
  },
  subheader2: {
    fontSize: 15,
    fontFamily: "Poppins",
    textAlign: "center",
    marginTop: 5,
    color: "#073051",
  },
  fareMockup: {
    flexDirection: "row",
    marginTop: 50,
  },
  logo: {
    width: 300,
    height: 150,
    resizeMode: "contain",
    alignSelf: "center",
    marginTop: 40,
  },
  mockup1: {
    alignItems: "center",
    justifyContent: "center",
    top: 100,
    flex: 1,
  },
});
