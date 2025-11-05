import React, { useEffect, useState } from "react";
import {
  Text,
  View,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from "react-native";
import "@fontsource/poppins";
import BackButton from "@/components/Backbutton";
import { supabase } from "@/scripts/supabase";
import { router } from "expo-router";

interface Hotline {
  id: string;
  section: string;
  name: string;
  number: string;
  address?: string;
  created_at: string;
}

const contactSections = [
  { key: "Ambulance", label: "Ambulance" },
  { key: "Police", label: "Police Station" },
  { key: "LTFRB", label: "LTFRB" },
];

// Format Philippine numbers to +63XXX-XXX-YYYY
const formatPHNumber = (num: string): string => {
  const digits = num.replace(/\D/g, "");
  if (digits.startsWith("63") && digits.length === 12) {
    return `+63${digits.slice(2, 5)}-${digits.slice(5, 8)}-${digits.slice(8)}`;
  }
  if (digits.length === 10 && digits.startsWith("9")) {
    return `+63${digits.slice(0, 3)}-${digits.slice(3, 6)}-${digits.slice(6)}`;
  }
  return num;
};

export default function SOS() {
  const [hotlines, setHotlines] = useState<Hotline[]>([]);

  useEffect(() => {
    fetchHotlines();
  }, []);

  const fetchHotlines = async () => {
    const { data, error } = await supabase
      .from<"hotlines", Hotline>("hotlines")
      .select("*");

    if (error) {
      console.error("Error fetching hotlines:", error.message);
    } else {
      setHotlines(data || []);
    }
  };

  const handlePressHotline = (hotline: Hotline) => {
    // Navigate to (feat)/SOS with hotline details
    router.push({
      pathname: "/(feat)/sos",
      params: {
        name: hotline.name,
        type: hotline.section,
        number: hotline.number,
        address: hotline.address || "",
      },
    });
  };

  return (
    <View style={{ flex: 1 }}>
      {/* Static Header */}
      <View>
        <BackButton />
        <Text style={soStyles.header}> SOS Call/Report </Text>
        <Text style={soStyles.subheader}>
          Make your commuter experience safe.
        </Text>
      </View>

      {/* Scrollable Content */}
      <ScrollView contentContainerStyle={{ paddingBottom: 100 }}>
        {contactSections.map((section) => {
          const sectionHotlines = hotlines.filter(
            (h) => h.section === section.key
          );
          return (
            <View key={section.key}>
              <Text style={soStyles.label}>{section.label}</Text>
              {sectionHotlines.map((h) => (
                <TouchableOpacity
                  key={h.id}
                  style={soStyles.cardContainer}
                  onPress={() => handlePressHotline(h)}
                >
                  <View style={soStyles.dot} />
                  <View style={{ flex: 1 }}>
                    <Text style={soStyles.cardTitle}>{h.name}</Text>
                    <Text style={soStyles.cardNumber}>
                      {formatPHNumber(h.number)}
                    </Text>
                    {h.address ? (
                      <Text style={soStyles.cardAddress}>{h.address}</Text>
                    ) : null}
                  </View>
                </TouchableOpacity>
              ))}
            </View>
          );
        })}
      </ScrollView>
    </View>
  );
}

const soStyles = StyleSheet.create({
  header: {
    fontWeight: "bold",
    alignItems: "flex-start",
    fontSize: 25,
    marginLeft: 20,
    marginTop: 10,
    color: "#073051",
  },
  label: {
    fontSize: 16,
    marginBottom: 6,
    color: "#073051",
    fontFamily: "Poppins",
    marginLeft: 25,
    marginTop: 10,
  },
  subheader: {
    marginLeft: 25,
    color: "#595959",
    fontFamily: "Poppins",
    marginBottom: 15,
  },
  cardContainer: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginHorizontal: 25,
    marginVertical: 8,
    padding: 12,
    borderWidth: 1,
    borderColor: "#D1D1D1",
    borderRadius: 12,
    backgroundColor: "#fff",
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#1E86DA",
    marginTop: 6,
    marginRight: 8,
  },
  cardTitle: {
    fontWeight: "600",
    fontSize: 16,
    color: "#000",
  },
  cardNumber: {
    fontSize: 14,
    color: "#0F76C2",
    marginTop: 2,
  },
  cardAddress: {
    fontSize: 12,
    color: "#9A9A9A",
    marginTop: 2,
  },
});
