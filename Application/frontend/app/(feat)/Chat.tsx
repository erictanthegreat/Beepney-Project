import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { useLocalSearchParams } from "expo-router";
import React, { useState, useEffect, useRef } from "react";
import BackButton from "@/components/Backbutton";
import SendIcon from "../../assets/images/Send.svg";
import AttachFile from "../../assets/images/image.svg";
import Status from "../../assets/images/Status.svg";
import { supabase } from "@/scripts/supabase";

type Message = {
  id: string;
  sender_id: string;
  receiver_id: string;
  message: string;
  created_at: string;
  is_read: boolean;
};

export default function Chat() {
  const { rentalId, rentalName, userId } = useLocalSearchParams<{
    rentalId: string;
    rentalName: string;
    userId: string;
  }>();

  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [isOnline, setIsOnline] = useState(false);
  const scrollViewRef = useRef<ScrollView>(null);

  useEffect(() => {
    if (!userId || !rentalId) return;

    fetchMessages();
    checkOnlineStatus();

    // ✅ Listen for only INSERT events related to this chat
    const subscription = supabase
      .channel("messages")
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "messages",
        },
        (payload) => {
          const msg = payload.new as Message;

          // Filter messages that belong to this conversation
          const isRelevant =
            (msg.sender_id === userId && msg.receiver_id === rentalId) ||
            (msg.sender_id === rentalId && msg.receiver_id === userId);

          if (isRelevant) {
            setMessages((prev) => {
              const exists = prev.some((m) => m.id === msg.id);
              return exists ? prev : [...prev, msg];
            });

            // Auto-mark messages received by me as read
            if (msg.receiver_id === userId) {
              markMessageAsRead(msg.id);
            }

            scrollToBottom();
          }
        }
      )
      .subscribe();

    const interval = setInterval(checkOnlineStatus, 30000);

    return () => {
      supabase.removeChannel(subscription);
      clearInterval(interval);
    };
  }, [userId, rentalId]);

  const fetchMessages = async () => {
    try {
      const { data, error } = await supabase
        .from("messages")
        .select("*")
        .or(
          `and(sender_id.eq.${userId},receiver_id.eq.${rentalId}),and(sender_id.eq.${rentalId},receiver_id.eq.${userId})`
        )
        .order("created_at", { ascending: true });

      if (error) {
        console.error("Error fetching messages:", error);
        return;
      }

      setMessages(data || []);
      await markMessagesAsRead();
    } catch (e) {
      console.error("Error:", e);
    } finally {
      setLoading(false);
    }
  };

  const markMessagesAsRead = async () => {
    await supabase
      .from("messages")
      .update({ is_read: true })
      .eq("receiver_id", userId)
      .eq("sender_id", rentalId)
      .eq("is_read", false);
  };

  const markMessageAsRead = async (messageId: string) => {
    await supabase
      .from("messages")
      .update({ is_read: true })
      .eq("id", messageId);
  };

  const checkOnlineStatus = async () => {
    const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000).toISOString();

    const { data } = await supabase
      .from("messages")
      .select("created_at")
      .eq("sender_id", rentalId)
      .gte("created_at", fiveMinutesAgo)
      .limit(1);

    setIsOnline((data && data.length > 0) || false);
  };

  const sendMessage = async () => {
    if (!newMessage.trim() || sending) return;

    setSending(true);
    const messageText = newMessage.trim();
    setNewMessage("");

    try {
      const { error } = await supabase.from("messages").insert({
        sender_id: userId,
        receiver_id: rentalId,
        message: messageText,
        is_read: false,
      });

      if (error) {
        console.error("Error sending message:", error);
        setNewMessage(messageText);
        return;
      }

      scrollToBottom();
    } catch (e) {
      console.error("Unexpected error:", e);
      setNewMessage(messageText);
    } finally {
      setSending(false);
    }
  };

  const scrollToBottom = () => {
    setTimeout(() => {
      scrollViewRef.current?.scrollToEnd({ animated: true });
    }, 100);
  };

  return (
    <KeyboardAvoidingView
      style={chatStyle.container}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      keyboardVerticalOffset={Platform.OS === "ios" ? 90 : 0}
    >
      <View>
        <BackButton />
        <Text style={chatStyle.header}>You are Chatting...</Text>
        <Text style={chatStyle.subheader}>
          Message to get updates right away!
        </Text>
      </View>

      <ScrollView
        ref={scrollViewRef}
        contentContainerStyle={{ paddingBottom: 20 }}
        onContentSizeChange={scrollToBottom}
      >
        <View style={chatStyle.chatcont}>
          <Text style={chatStyle.rentalname}>{rentalName}</Text>
          <View style={chatStyle.statscont}>
            <Status />
            <Text style={chatStyle.status}>
              {isOnline ? "Online" : "Offline"}
            </Text>
          </View>
        </View>

        {loading ? (
          <ActivityIndicator
            size="large"
            color="#073051"
            style={{ marginTop: 50 }}
          />
        ) : (
          <View style={{ paddingHorizontal: 15, marginTop: 20 }}>
            {messages.map((msg) => {
              const isMyMessage = msg.sender_id === userId;
              return (
                <View
                  key={msg.id}
                  style={{
                    alignSelf: isMyMessage ? "flex-end" : "flex-start",
                    maxWidth: "75%",
                    backgroundColor: isMyMessage ? "#0D99FF" : "#073051",
                    padding: 12,
                    borderRadius: 15,
                    marginBottom: 10,
                    borderTopLeftRadius: isMyMessage ? 15 : 0,
                    borderTopRightRadius: isMyMessage ? 0 : 15,
                  }}
                >
                  <Text style={{ fontSize: 16, color: "#fff" }}>
                    {msg.message}
                  </Text>
                  <Text
                    style={{
                      fontSize: 11,
                      color: "#E0E0E0",
                      marginTop: 5,
                      alignSelf: "flex-end",
                    }}
                  >
                    {new Date(msg.created_at).toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </Text>
                </View>
              );
            })}
          </View>
        )}
      </ScrollView>

      <View style={chatStyle.inputcontainer}>
        <View style={chatStyle.input}>
          <TextInput
            placeholder="Type a message..."
            multiline
            maxLength={500}
            value={newMessage}
            onChangeText={setNewMessage}
            editable={!sending}
          />
        </View>
        <TouchableOpacity disabled={sending}>
          <AttachFile width={30} height={40} />
        </TouchableOpacity>
        <TouchableOpacity
          onPress={sendMessage}
          disabled={!newMessage.trim() || sending}
        >
          {sending ? (
            <ActivityIndicator size="small" color="#0D99FF" />
          ) : (
            <SendIcon width={30} height={40} />
          )}
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const chatStyle = StyleSheet.create({
  container: { flex: 1 },
  chatcont: { alignItems: "center", marginTop: 30 },
  header: {
    color: "#073051",
    fontWeight: "bold",
    fontSize: 25,
    marginLeft: 25,
    marginTop: 10,
  },
  subheader: {
    color: "#595959",
    marginBottom: 10,
    fontFamily: "Poppins",
    marginLeft: 25,
  },
  rentalname: { color: "#073051", fontFamily: "Poppins", fontSize: 18 },
  status: { color: "#595959", fontFamily: "Poppins", fontSize: 15 },
  statscont: { flexDirection: "row", alignItems: "center", gap: 5 },
  inputcontainer: {
    flexDirection: "row",
    alignItems: "flex-end",
    justifyContent: "center",
    padding: 10,
    marginBottom: 20,
    gap: 10,
  },
  input: {
    borderWidth: 1,
    borderColor: "#CCCCCC",
    backgroundColor: "white",
    width: "75%",
    borderRadius: 15,
    paddingHorizontal: 15,
  },
});
