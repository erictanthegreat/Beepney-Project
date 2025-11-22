import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import React from "react";
import { router } from "expo-router";
import OriginIcon from "@/assets/images/loc.svg";
import DestIcon from "@/assets/images/loc 2.svg";
import Call from "@/assets/images/call-rental.svg";
import Chat from "@/assets/images/chat.svg";

type TricyCallCardProps = {
  pickup: string;
  destination: string;
  farePrice: number;
  name: string;
  onAccept: () => void;
  status?: string;
  onCancel?: () => void;
  onDone?: () => void; // ✅ NEW PROP ADDED
  userId: string;
  currentUserId: string;
  conversationId?: string;
};

export default function TricyCallCard({
  pickup,
  destination,
  farePrice,
  name,
  onAccept,
  status,
  onCancel,
  onDone,
  userId,
  currentUserId,
  conversationId,
}: TricyCallCardProps) {
  const handleChatPress = async () => {
    const { supabase } = require("@/scripts/supabase");

    try {
      const { data: existingConvo, error: fetchError } = await supabase
        .from("conversations")
        .select("*")
        .or(
          `and(driver_id.eq.${currentUserId},commuter_id.eq.${userId}),and(driver_id.eq.${userId},commuter_id.eq.${currentUserId})`
        )
        .single();

      let convoId = existingConvo?.id;

      if (fetchError && fetchError.code === "PGRST116") {
        const { data: newConvo, error: createError } = await supabase
          .from("conversations")
          .insert({
            driver_id: currentUserId,
            commuter_id: userId,
          })
          .select()
          .single();

        if (createError) {
          console.error("Error creating conversation:", createError);
          return;
        }

        convoId = newConvo.id;
      }

      router.push({
        pathname: "/(feat)/Chat",
        params: {
          conversationId: convoId,
          rentalName: name,
          userId: currentUserId,
        },
      });
    } catch (error) {
      console.error("Error opening chat:", error);
    }
  };

  return (
    <View style={styles.card}>
      <View style={styles.row2}>
        <Text style={styles.label}>
          {name} - ₱{farePrice}
        </Text>

        {status === "pending" && (
          <TouchableOpacity style={styles.button} onPress={onAccept}>
            <Text style={styles.buttonText}>Accept</Text>
          </TouchableOpacity>
        )}

        {status === "accepted" && (
          <View style={{ flexDirection: "row", gap: 6 }}>
            {onCancel && (
              <TouchableOpacity style={styles.cancelButton} onPress={onCancel}>
                <Text style={styles.buttonText}>Cancel</Text>
              </TouchableOpacity>
            )}

            {onDone && (
              <TouchableOpacity style={styles.doneButton} onPress={onDone}>
                <Text style={styles.buttonText}>Done</Text>
              </TouchableOpacity>
            )}
          </View>
        )}
      </View>

      <View style={styles.row}>
        <OriginIcon />
        <Text style={styles.text1}> Pick up From</Text>
      </View>
      <Text style={styles.dest}>{pickup}</Text>

      <View style={styles.row}>
        <DestIcon />
        <Text style={styles.text2}> Destination</Text>
      </View>
      <Text style={styles.dest}>{destination}</Text>

      <View style={styles.contact}>
        <TouchableOpacity onPress={handleChatPress}>
          <Chat />
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  button: {
    backgroundColor: "#073051",
    borderRadius: 40,
    paddingVertical: 8,
    paddingHorizontal: 25,
    justifyContent: "center",
    alignItems: "center",
    marginLeft: 10,
  },
  cancelButton: {
    backgroundColor: "#D9534F",
    borderRadius: 40,
    paddingVertical: 8,
    paddingHorizontal: 25,
    justifyContent: "center",
    alignItems: "center",
    marginLeft: 10,
  },
  doneButton: {
    backgroundColor: "#0FD150", // GREEN for completion
    borderRadius: 40,
    paddingVertical: 8,
    paddingHorizontal: 25,
    justifyContent: "center",
    alignItems: "center",
    marginLeft: 10,
  },
  buttonText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 14,
  },
  card: {
    borderWidth: 1,
    borderColor: "#CBCBCB",
    borderRadius: 15,
    padding: 15,
    width: "90%",
    marginVertical: 10,
    backgroundColor: "#fff",
    alignSelf: "center",
    marginTop: 10,
  },
  label: {
    fontWeight: "bold",
    fontSize: 17,
    color: "#073051",
  },
  row: {
    flexDirection: "row",
    marginTop: 10,
  },
  row2: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  text1: {
    color: "#1E86DA",
    fontSize: 15,
    fontWeight: "bold",
  },
  text2: {
    fontSize: 15,
    color: "#073051",
    fontWeight: "bold",
  },
  dest: {
    color: "#737F83",
    fontFamily: "Poppins",
  },
  contact: {
    flexDirection: "row",
    marginTop: 10,
    justifyContent: "flex-end",
    gap: 5,
  },
});
