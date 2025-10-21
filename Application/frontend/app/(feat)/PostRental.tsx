import React, { useState, useEffect } from "react";
import {
  Text,
  View,
  StyleSheet,
  ScrollView,
  Pressable,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, router } from "expo-router";
import "@fontsource/poppins";
import { supabase } from "@/scripts/supabase";

import BackButton from "@/components/Backbutton";
import Input from "../../components/Input";
import CustomButton from "../../components/ui/CustomButton";
import SegmentedButton from "../../components/SegmentedButton";

export default function PostRental() {
  const { id } = useLocalSearchParams<{ id?: string }>();

  const [name, setName] = useState("");
  const [contact, setContact] = useState("");
  const [location, setLocation] = useState("");
  const [vehicleType, setVehicleType] = useState<"Jeep" | "Van" | "Jeep & Van">(
    "Jeep"
  );
  const [services, setServices] = useState<string[]>([""]);

  useEffect(() => {
    const fetchRental = async () => {
      if (id) {
        const { data, error } = await supabase
          .from("rental")
          .select("*")
          .eq("id", id)
          .single();

        if (error) {
          console.error("Error fetching rental:", error.message);
        } else if (data) {
          setName(data.station_name || "");
          setContact(data.contact_number || "");
          setLocation(data.location || "");
          setVehicleType(data.types_of_vehicles || "Jeep");
          setServices(
            data.service_offered ? data.service_offered.split(", ") : [""]
          );
        }
      }
    };

    fetchRental();
  }, [id]);

  const addService = () => {
    setServices((prev) => [...prev, ""]);
  };

  const updateService = (text: string, index: number) => {
    const updated = [...services];
    updated[index] = text;
    setServices(updated);
  };

  const removeService = (index: number) => {
    const updated = [...services];
    updated.splice(index, 1);
    setServices(updated);
  };

  const saveRental = async () => {
    try {
      if (id) {
        const { error } = await supabase
          .from("rental")
          .update({
            station_name: name,
            contact_number: contact,
            location,
            types_of_vehicles: vehicleType,
            service_offered: services.join(", "),
          })
          .eq("id", id);

        if (error) {
          console.error("Error updating rental:", error.message);
          return;
        }
      } else {
        const { error } = await supabase.from("rental").insert([
          {
            station_name: name,
            contact_number: contact,
            location,
            types_of_vehicles: vehicleType,
            service_offered: services.join(", "),
          },
        ]);

        if (error) {
          console.error("Error inserting rental:", error.message);
          return;
        }
      }

      router.push("/(driver)/Renting");
    } catch (e) {
      console.error("Unexpected error saving rental:", e);
    }
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      keyboardVerticalOffset={Platform.OS === "ios" ? 60 : 0}
    >
      <View style={rentStyles.container}>
        <BackButton />
        <Text style={rentStyles.header}>
          {id ? "Edit Rental" : "Jeepney/Van Rental"}
        </Text>
        <Text style={{ marginLeft: 25, color: "#595959" }}>
          {id ? "Update your rental info." : "Post your rental info."}
        </Text>

        <ScrollView
          contentContainerStyle={{
            marginLeft: 25,
            marginTop: 20,
            paddingBottom: 70,
          }}
          keyboardShouldPersistTaps="handled"
        >
          <Input
            label="Name"
            placeholder="E.g Kevin's Rental"
            keyboardType="default"
            containerStyle={{ width: "90%" }}
            value={name}
            onChangeText={setName}
          />

          <Text style={rentStyles.label}>Types of Vehicles</Text>
          <SegmentedButton value={vehicleType} onChange={setVehicleType} />

          <Input
            label="Contact Number"
            placeholder="E.g 09XX-XXX-XXXX"
            keyboardType="phone-pad"
            containerStyle={{ width: "90%" }}
            value={contact}
            onChangeText={setContact}
          />

          <Input
            label="Location"
            placeholder="E.g To Vigan"
            keyboardType="default"
            containerStyle={{ width: "90%" }}
            value={location}
            onChangeText={setLocation}
            editable={!id}
          />

          {services.map((service, index) => (
            <View style={rentStyles.inputWrapper} key={index}>
              <Input
                label="Services Offered"
                placeholder="E.g Private Transport"
                keyboardType="default"
                containerStyle={{ width: "100%" }}
                value={service}
                onChangeText={(text) => updateService(text, index)}
              />

              {index > 0 && (
                <Pressable
                  style={rentStyles.deleteInside}
                  onPress={() => removeService(index)}
                >
                  <Ionicons name="close-circle" size={22} color="#FF4D4F" />
                </Pressable>
              )}
            </View>
          ))}

          <Pressable style={rentStyles.addButton} onPress={addService}>
            <Ionicons name="add-circle" size={32} color="#0D99FF" />
          </Pressable>

          <CustomButton
            title={id ? "Update" : "Done"}
            onPress={saveRental}
            style={rentStyles.custButton}
          />
        </ScrollView>
      </View>
    </KeyboardAvoidingView>
  );
}

const rentStyles = StyleSheet.create({
  header: {
    fontWeight: "bold",
    fontSize: 25,
    marginLeft: 20,
    marginTop: 10,
    color: "#073051",
    fontFamily: "Poppins",
  },
  container: {
    flex: 1,
  },
  addButton: {
    alignItems: "center",
    marginTop: 8,
    marginRight: 2,
  },
  inputWrapper: {
    width: "90%",
    position: "relative",
    marginBottom: 8,
  },
  deleteInside: {
    position: "absolute",
    right: 10,
    top: 55,
    zIndex: 1,
  },
  custButton: {
    marginLeft: 20,
  },
  label: {
    fontSize: 16,
    marginBottom: 6,
    fontWeight: "bold",
    color: "#073051",
    fontFamily: "Poppins",
    marginTop: 10,
  },
});
8;
