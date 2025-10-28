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
  conversation_id: string;
  sender_id: string;
  receiver_id: string;
  message: string;
  created_at: string;
  is_read: boolean;
};

export default function Chat() {
  const {
    conversationId: paramConversationId,
    rentalId,
    rentalName,
    userId,
  } = useLocalSearchParams<{
    conversationId?: string;
    rentalId?: string;
    rentalName: string;
    userId: string;
  }>();

  // Handle both commuter (rentalId) & driver (conversationId)
  const [conversationId, setConversationId] = useState<string | null>(
    paramConversationId ?? rentalId ?? null
  );
  const [driverId, setDriverId] = useState<string | null>(null);
  const [commuterId, setCommuterId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [isOnline, setIsOnline] = useState(false);
  const scrollViewRef = useRef<ScrollView>(null);

  // Init chat logic
  useEffect(() => {
    if (!userId) return;
    initChat();
  }, [userId]);

  const initChat = async () => {
    try {
      let finalConvId = paramConversationId ?? null;

      // Commuter case (comes with rentalId)
      if (!finalConvId && rentalId) {
        const { data: rentalData, error: rentalError } = await supabase
          .from("rental")
          .select("user_id")
          .eq("id", rentalId)
          .maybeSingle();

        if (rentalError) {
          console.error("Error fetching rental:", rentalError);
          return;
        }

        if (!rentalData?.user_id) {
          console.error("No matching driver found for this rental");
          return;
        }

        // check existing conversation
        const { data: existingConv } = await supabase
          .from("conversations")
          .select("id")
          .eq("driver_id", rentalData.user_id)
          .eq("commuter_id", userId)
          .maybeSingle();

        if (existingConv) {
          finalConvId = existingConv.id;
        } else {
          // create conversation
          const { data: newConv, error: createError } = await supabase
            .from("conversations")
            .insert({
              driver_id: rentalData.user_id,
              commuter_id: userId,
            })
            .select()
            .single();

          if (createError) {
            console.error("Error creating conversation:", createError);
            return;
          }

          finalConvId = newConv.id;
        }
      }

      // Driver case (comes with conversationId)
      if (!finalConvId && paramConversationId) {
        finalConvId = paramConversationId;
      }

      if (!finalConvId) {
        console.error("No valid conversation or rental ID found");
        return;
      }

      setConversationId(finalConvId);

      // fetch participants
      const { data: conv, error } = await supabase
        .from("conversations")
        .select("driver_id, commuter_id")
        .eq("id", finalConvId)
        .maybeSingle();

      if (error) {
        console.error("Error fetching conversation:", error);
        return;
      }

      if (conv) {
        setDriverId(conv.driver_id);
        setCommuterId(conv.commuter_id);
        fetchMessages(finalConvId);
        checkOnlineStatus(conv.driver_id);
        const interval = setInterval(
          () => checkOnlineStatus(conv.driver_id),
          30000
        );
        return () => clearInterval(interval);
      }
    } catch (err) {
      console.error("Error initializing chat:", err);
    }
  };

  // Subscribe to new messages
  useEffect(() => {
    if (!conversationId) return;

    const subscription = supabase
      .channel(`Messages-${conversationId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "Messages",
          filter: `conversation_id=eq.${conversationId}`,
        },
        (payload) => {
          const msg = payload.new as Message;
          setMessages((prev) => {
            const exists = prev.some((m) => m.id === msg.id);
            return exists ? prev : [...prev, msg];
          });

          if (msg.receiver_id === userId) markMessageAsRead(msg.id);
          scrollToBottom();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(subscription);
    };
  }, [conversationId, userId]);

  const fetchMessages = async (convId: string) => {
    try {
      const { data, error } = await supabase
        .from("Messages")
        .select("*")
        .eq("conversation_id", convId)
        .order("created_at", { ascending: true });

      if (error) {
        console.error("Error fetching messages:", error);
        return;
      }

      setMessages(data || []);
      await markMessagesAsRead(convId);
    } catch (e) {
      console.error("Error:", e);
    } finally {
      setLoading(false);
    }
  };

  const markMessagesAsRead = async (convId: string) => {
    await supabase
      .from("Messages")
      .update({ is_read: true })
      .eq("conversation_id", convId)
      .eq("receiver_id", userId)
      .eq("is_read", false);
  };

  const markMessageAsRead = async (messageId: string) => {
    await supabase.from("Messages").update({ is_read: true }).eq("id", messageId);
  };

  const checkOnlineStatus = async (driver_id: string) => {
    const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000).toISOString();

    const { data } = await supabase
      .from("Messages")
      .select("created_at")
      .eq("sender_id", driver_id)
      .gte("created_at", fiveMinutesAgo)
      .limit(1);

    setIsOnline((data && data.length > 0) || false);
  };

  // Send Message (works for both roles)
  const sendMessage = async () => {
    if (!newMessage.trim() || sending || !conversationId || !driverId || !commuterId) return;

    const messageText = newMessage.trim();
    setNewMessage("");
    setSending(true);

    try {
      const receiverId = userId === driverId ? commuterId : driverId;

      const { data, error } = await supabase
        .from("Messages")
        .insert({
          conversation_id: conversationId,
          sender_id: userId,
          receiver_id: receiverId,
          message: messageText,
          is_read: false,
        })
        .select()
        .single();

      if (error) {
        console.error("Error sending message:", error);
        setNewMessage(messageText);
        return;
      }

      setMessages((prev) => [...prev, data]);
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
          <ActivityIndicator size="large" color="#073051" style={{ marginTop: 50 }} />
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
                  <Text style={{ fontSize: 16, color: "#fff" }}>{msg.message}</Text>
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