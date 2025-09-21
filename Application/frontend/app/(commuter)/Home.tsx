import React, { useState, useEffect } from "react";
import {
  Text,
  View,
  StyleSheet,
  TouchableOpacity,
  PixelRatio,
  ScrollView,
  Dimensions,
  Image,
} from "react-native";
import Table from "../../components/ui/TableComponent";
import "@fontsource/poppins";
import ProfileIcon from "../../assets/images/profile.svg";
import NotifIcon from "../../assets/images/notif.svg";
import JeepIcon from "../../assets/images/jeep.svg";
import TricyIcon from "../../assets/images/trike.svg";
import BusIcon from "../../assets/images/bus.svg";
import FCIcon from "../../assets/images/fc icon.svg";
import RHIcon from "../../assets/images/ride history.svg";
import DDIcon from "../../assets/images/scan.svg";
import FareIcon from "../../assets/images/fare.svg";
import ComplaintIcon from "../../assets/images/complaint.svg";
import { supabase } from "@/scripts/supabase";
import { router } from "expo-router";

const { width } = Dimensions.get("window");
const scale = width / 375;
const scaleFont = (size: number) => size * PixelRatio.getFontScale();

export default function Home() {
  const [activeTab, setActiveTab] = useState(1);
  const [firstName, setFirstName] = useState("");
  const [avatar, setAvatar] = useState<string | null>(null);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const {
          data: { session },
        } = await supabase.auth.getSession();

        if (!session?.user) return;

        const userId = session.user.id;

        const { data: profile, error } = await supabase
          .from("profiles")
          .select("username, avatar_url")
          .eq("id", userId)
          .single();

        if (error) {
          console.error("Error fetching profile:", error.message);
          return;
        }

        if (profile?.username) {
          const first = profile.username.split(" ")[0];
          setFirstName(first);
        }

        if (profile?.avatar_url) {
          setAvatar(profile.avatar_url);
        }
      } catch (err) {
        console.error("Unexpected error:", err);
      }
    };

    fetchProfile();
  }, []);

  const tableData = [
    {
      headers: ["Distance (kms.)", "Jeepney"],
      data: [
        ["Regular 1- 4 Kilometers", "₱13.00"],
        ["Succeeding Kilometers", "₱1.80 p/kms"],
        ["Student/Elder/PWD/Solo Parent", "₱10.40"],
        ["Succeeding Kilometers", "₱1.44 p/kms"],
      ],
    },
    {
      headers: ["Distance (kms.)", "Tricycle"],
      data: [
        ["Regular 1- 4 Kilometers", "₱15.00"],
        ["Succeeding Kilometers", "₱7.50 p/500 m"],
        ["Student/Elder/PWD/Solo Parent", "₱13.00"],
        ["Succeeding Kilometers", "₱6.50 p/500 m"],
      ],
    },
    {
      headers: ["Distance (kms.)", "Bus"],
      data: [
        ["Regular 1- 4 Kilometers", "₱15.00"],
        ["Succeeding Kilometers", "₱7.50 p/500 m"],
        ["Student/Elder/PWD/Solo Parent", "₱13.00"],
        ["Succeeding Kilometers", "₱6.50 p/500 m"],
      ],
    },
  ];

  return (
    <View style={{ flex: 1 }}>
      {/* Top bar */}
      <View style={styles.topBar}>
        <View style={{ flexDirection: "row", alignItems: "center" }}>
          <TouchableOpacity
            onPress={() => router.push("/(profile)/CommuterProfile")}
          >
            {avatar ? (
              <Image
                source={{ uri: avatar }}
                style={{ width: 32, height: 32, borderRadius: 16 }}
              />
            ) : (
              <ProfileIcon width={32} height={32} />
            )}
          </TouchableOpacity>
          <Text style={[styles.name, { marginLeft: 10 }]}>
            Hello, {firstName || "Commuter"}!
          </Text>
        </View>
        <TouchableOpacity>
          <NotifIcon width={28} height={28} />
        </TouchableOpacity>
      </View>

      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ paddingBottom: 100 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Tabs */}
        <View style={styles.headerRow}>
          <Text style={styles.text}>Overview</Text>
          <View style={styles.segmentContainer}>
            {[1, 2, 3].map((tab) => (
              <TouchableOpacity
                key={tab}
                style={[
                  styles.segmentButton,
                  activeTab === tab && styles.activeButton,
                ]}
                onPress={() => setActiveTab(tab)}
              >
                {tab === 1 && (
                  <JeepIcon
                    color={activeTab === tab ? "#ffffff" : "#888888"}
                    width={26}
                    height={26}
                  />
                )}
                {tab === 2 && (
                  <TricyIcon
                    color={activeTab === tab ? "#ffffff" : "#888888"}
                    width={26}
                    height={26}
                  />
                )}
                {tab === 3 && (
                  <BusIcon
                    color={activeTab === tab ? "#ffffff" : "#888888"}
                    width={28}
                    height={28}
                  />
                )}
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Table */}
        <Table
          headers={tableData[activeTab - 1].headers}
          data={tableData[activeTab - 1].data}
        />

        {/* Fare Matrix Shortcut */}
        <View style={styles.rowBetween}>
          <Text style={fareStyle.fare}>Detailed Fare Matrices</Text>
          <TouchableOpacity
            onPress={() => router.push("/(feat)/FareMatrix")}
            style={fareStyle.button}
          >
            <FareIcon width={26} height={26} />
          </TouchableOpacity>
        </View>

        {/* Other Features */}
        <View style={featStyles.container}>
          <TouchableOpacity
            onPress={() => router.push("/(feat)/FareCalculator")}
            style={featStyles.featureButton}
          >
            <FCIcon style={featStyles.icon} />
            <Text style={featStyles.text}>Fare Calculator</Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => router.push("/(feat)/ScanDriverdets")}
            style={featStyles.featureButton}
          >
            <DDIcon style={featStyles.icon} />
            <Text style={featStyles.text}>Scan QR</Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => router.push("/(feat)/RideHistory")}
            style={featStyles.featureButton}
          >
            <RHIcon style={featStyles.icon} />
            <Text style={featStyles.text}>Ride History</Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => router.push("/(feat)/Complaints")}
            style={featStyles.featureButton}
          >
            <ComplaintIcon style={featStyles.icon} />
            <Text style={featStyles.text}>File a Complaint</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  topBar: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingTop: 40,
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    marginTop: 20,
  },
  text: {
    fontWeight: "bold",
    fontSize: 14 * scale,
    color: "#073051",
    fontFamily: "Poppins",
  },
  segmentContainer: {
    flexDirection: "row",
    borderRadius: 20,
    overflow: "hidden",
    height: 40,
    width: "50%",
    borderWidth: 1,
    borderColor: "#ccc",
  },
  segmentButton: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  activeButton: {
    backgroundColor: "#1E86DA",
  },
  name: {
    fontSize: scaleFont(14),
    color: "#073051",
    fontFamily: "Poppins",
  },
  rowBetween: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginHorizontal: 15,
    marginTop: 5,
    marginBottom: 15,
  },
});

const fareStyle = StyleSheet.create({
  fare: {
    fontWeight: "bold",
    fontSize: scaleFont(18),
    color: "#073051",
    fontFamily: "Poppins",
  },
  button: {
    backgroundColor: "#FFFFFF",
    borderColor: "#CBCBCB",
    borderWidth: 1,
    paddingVertical: 8,
    paddingHorizontal: 15,
    borderRadius: 15,
    alignItems: "center",
    justifyContent: "center",
  },
});

const featStyles = StyleSheet.create({
  container: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    marginHorizontal: 10,
    backgroundColor: "#FFFFFF",
    borderColor: "#CBCBCB",
    borderRadius: 10,
    borderWidth: 1,
    padding: 15,
  },
  featureButton: {
    flexBasis: "48%",
    flexGrow: 1,
    flexShrink: 1,
    marginBottom: 14,
    alignItems: "center",
  },
  text: {
    color: "#1E86DA",
    textAlign: "center",
    marginTop: 8,
    fontSize: 13,
    fontFamily: "Poppins",
  },
  icon: {
    alignItems: "center",
    justifyContent: "center",
  },
});
