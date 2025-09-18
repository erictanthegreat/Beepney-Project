import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Linking, Platform } from "react-native";
import "@fontsource/poppins";
import BackButton from "@/components/Backbutton";
import { supabase } from "@/scripts/supabase";

interface FareMatrix {
  id: string;
  section: string;
  title: string;
  description?: string;
  file_url: string;
  file_name: string;
  created_at: string;
  uploaded_by: string;
}

const fareSections = [
  { key: "PUB", label: "PUB City & Provincial" },
  { key: "PUJ", label: "PUJ" },
  { key: "Others", label: "Others" },
];

export default function FareMatrix() {
  const [matrices, setMatrices] = useState<FareMatrix[]>([]);

  useEffect(() => {
    fetchMatrices();
  }, []);

  const fetchMatrices = async () => {
    const { data, error } = await supabase
      .from<"fare_matrix", FareMatrix>("fare_matrix")
      .select("*")
      .order("created_at", { ascending: true });

    if (error) console.error("Error fetching fare matrices:", error.message);
    else setMatrices(data || []);
  };

  const handlePressMatrix = (matrix: FareMatrix) => {
    if (!matrix.file_url) return;
    if (Platform.OS === "web") {
      window.open(matrix.file_url, "_blank");
    } else {
      Linking.openURL(matrix.file_url);
    }
  };

  return (
    <View style={{ flex: 1 }}>
      {/* Header */}
      <View>
        <BackButton />
        <Text style={fmStyles.header}> Fare Matrix </Text>
        <Text style={fmStyles.subheader}>
          Get updated with the latest fare matrix in your area!
        </Text>
      </View>

      {/* Scrollable Content */}
      <ScrollView contentContainerStyle={{ paddingBottom: 200 }}>
        {fareSections.map((section) => {
          const sectionMatrices = matrices.filter((m) => m.section === section.key);
          return (
            <View key={section.key}>
              <Text style={fmStyles.label}>{section.label}</Text>
              {sectionMatrices.map((m, idx) => (
                <TouchableOpacity
                  key={m.id}
                  style={fmStyles.cardContainer}
                  onPress={() => handlePressMatrix(m)}
                >
                  <View style={fmStyles.dot} />
                  <View style={{ flex: 1 }}>
                    <Text style={fmStyles.cardTitle}>
                      {section.label} Fare {idx + 1} ({m.title})
                    </Text>
                    <Text style={fmStyles.cardFileName}>{m.file_name}</Text>
                    {m.description ? <Text style={fmStyles.cardDescription}>{m.description}</Text> : null}
                    <Text style={fmStyles.cardDate}>
                      {new Date(m.created_at).toLocaleDateString()}
                    </Text>
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

const fmStyles = StyleSheet.create({
  header: {
    fontWeight: "bold",
    fontSize: 25,
    marginLeft: 20,
    marginTop: 10,
    color: "#073051",
    fontFamily: "Poppins",
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
    marginBottom: 20,
    fontFamily: "Poppins",
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
  cardFileName: {
    fontSize: 14,
    color: "#0F76C2",
    marginTop: 2,
  },
  cardDescription: {
    fontSize: 12,
    color: "#9A9A9A",
    marginTop: 2,
  },
  cardDate: {
    fontSize: 12,
    color: "#595959",
    marginTop: 2,
  },
});