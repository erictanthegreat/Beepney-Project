import React, { useState, useCallback } from "react";
import {
  Text,
  View,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  ActivityIndicator,
} from "react-native";
import "@fontsource/poppins";
import BackButton from "@/components/Backbutton";
import { supabase } from "@/scripts/supabase";
import { router, useFocusEffect } from "expo-router";

interface Hotline {
  id: string;
  section: string;
  name: string;
  number: string;
  address?: string;
  aor: string;
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
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);

  const fetchHotlines = async () => {
    try {
      if (!refreshing) setLoading(true);

      const { data, error } = await supabase
        .from<"hotlines", Hotline>("hotlines")
        .select("*")
        .order("created_at", { ascending: true });

      if (error) {
        console.error("Error fetching hotlines:", error.message);
        return;
      }

      setHotlines(data || []);
    } catch (e) {
      console.error("Unexpected error fetching hotlines:", e);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // Refetch when screen is focused
  useFocusEffect(
    useCallback(() => {
      fetchHotlines();
    }, [])
  );

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchHotlines();
  }, []);

  const handlePressHotline = (hotline: Hotline) => {
    router.push({
      pathname: "/(feat)/sos",
      params: {
        name: hotline.name,
        type: hotline.section,
        number: hotline.number,
        aor: hotline.aor,
        address: hotline.address || "",
      },
    });
  };

  const isEmpty = !loading && hotlines.length === 0;

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

      {loading ? (
        <ActivityIndicator
          size="large"
          color="#073051"
          style={{ marginTop: 20 }}
        />
      ) : isEmpty ? (
        <ScrollView
          contentContainerStyle={{
            flex: 1,
            justifyContent: "center",
            alignItems: "center",
            marginBottom: 100,
          }}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={["#073051"]}
            />
          }
        >
          <Text style={{ fontSize: 15, color: "#595959" }}>
            No available hotlines.
          </Text>
        </ScrollView>
      ) : (
        <ScrollView
          contentContainerStyle={{ paddingBottom: 100 }}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={["#073051"]}
            />
          }
        >
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

                      {h.aor ? (
                        <Text style={soStyles.cardAOR}>AOR: {h.aor}</Text>
                      ) : null}
                    </View>
                  </TouchableOpacity>
                ))}
              </View>
            );
          })}
        </ScrollView>
      )}
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

  cardAOR: {
    fontSize: 12,
    color: "#9A9A9A",
    marginTop: 2,
    fontWeight: "bold",
  },
});
