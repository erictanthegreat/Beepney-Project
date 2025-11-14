import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
} from "react-native";
import { router, useFocusEffect } from "expo-router";
import BackButton from "@/components/Backbutton";
import EmptyStateIcon from "../../assets/images/empty.svg";
import { supabase } from "@/scripts/supabase";

type Conversation = {
  id: string;
  userId: string;
  userName: string;
  lastMessage: string;
  lastMessageTime: string;
  unreadCount: number;
};

export default function Inbox() {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);

  useEffect(() => {
    getCurrentUser();
  }, []);

  useFocusEffect(
    useCallback(() => {
      if (currentUserId) {
        fetchConversations();
      }
    }, [currentUserId])
  );

  const getCurrentUser = async () => {
    const { data, error } = await supabase.auth.getUser();

    if (error) {
      console.error("Error getting user:", error);
      return;
    }

    if (data?.user) {
      console.log("Current user ID:", data.user.id);
      setCurrentUserId(data.user.id);
    }
  };

  // NEW: Fetch user's real name from profiles table
  const fetchUserName = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from("profiles")
        .select("username")
        .eq("id", userId)
        .single();

      if (error) {
        console.error("Error fetching user name:", error);
        return `User ${userId.slice(0, 6)}`;
      }

      return data?.username || `User ${userId.slice(0, 6)}`;
    } catch (e) {
      console.error("Unexpected error fetching user name:", e);
      return `User ${userId.slice(0, 6)}`;
    }
  };

  // Fetch chat with a specific user
  const fetchChatWithUser = async (otherUserId: string) => {
    if (!currentUserId) return null;

    try {
      const { data: convo, error } = await supabase
        .from("conversations")
        .select("*")
        .or(
          `and(driver_id.eq.${currentUserId},commuter_id.eq.${otherUserId}),and(driver_id.eq.${otherUserId},commuter_id.eq.${currentUserId})`
        )
        .single();

      if (error) {
        if (error.code === "PGRST116") {
          console.log("No conversation found with this user");
          return null;
        }
        console.error("Error fetching conversation:", error);
        return null;
      }

      const { data: messages, error: messagesError } = await supabase
        .from("Messages")
        .select("*")
        .eq("conversation_id", convo.id)
        .order("created_at", { ascending: true });

      if (messagesError) {
        console.error("Error fetching messages:", messagesError);
        return null;
      }

      return {
        conversation: convo,
        messages: messages || [],
      };
    } catch (e) {
      console.error("Unexpected error fetching chat:", e);
      return null;
    }
  };

  // Fetch or create a chat with a specific user
  const fetchOrCreateChatWithUser = async (
    otherUserId: string,
    currentUserRole: "driver" | "commuter" = "driver"
  ) => {
    if (!currentUserId) return null;

    try {
      const existingChat = await fetchChatWithUser(otherUserId);
      if (existingChat) return existingChat;

      const newConvo = {
        driver_id: currentUserRole === "driver" ? currentUserId : otherUserId,
        commuter_id:
          currentUserRole === "commuter" ? currentUserId : otherUserId,
      };

      const { data: convo, error } = await supabase
        .from("conversations")
        .insert(newConvo)
        .select()
        .single();

      if (error) {
        console.error("Error creating conversation:", error);
        return null;
      }

      return {
        conversation: convo,
        messages: [],
      };
    } catch (e) {
      console.error("Unexpected error:", e);
      return null;
    }
  };

  const fetchConversations = async () => {
    if (!currentUserId) return;

    try {
      if (!refreshing) setLoading(true);

      const { data: convos, error } = await supabase
        .from("conversations")
        .select("*")
        .or(`driver_id.eq.${currentUserId},commuter_id.eq.${currentUserId}`)
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Error fetching conversations:", error);
        return;
      }

      if (!convos || convos.length === 0) {
        setConversations([]);
        return;
      }

      const conversationList: Conversation[] = [];
      const seenUsers = new Set<string>(); // Track users we've already added

      for (const convo of convos) {
        let otherUserId =
          convo.driver_id === currentUserId
            ? convo.commuter_id
            : convo.driver_id;

        // Skip if we've already added a conversation with this user
        if (seenUsers.has(otherUserId)) {
          continue;
        }

        seenUsers.add(otherUserId);

        // Fetch the real user name
        const userName = await fetchUserName(otherUserId);

        const { data: latestMsg, error: latestError } = await supabase
          .from("Messages")
          .select("*")
          .eq("conversation_id", convo.id)
          .order("created_at", { ascending: false })
          .limit(1)
          .single();

        if (latestError && latestError.code !== "PGRST116") {
          console.error("Error fetching latest message:", latestError);
        }

        const { count: unreadCount } = await supabase
          .from("Messages")
          .select("*", { count: "exact", head: true })
          .eq("conversation_id", convo.id)
          .eq("sender_id", otherUserId)
          .eq("is_read", false);

        conversationList.push({
          id: convo.id,
          userId: otherUserId,
          userName: userName, // Now using real name instead of ID
          lastMessage: latestMsg?.message || "(No messages yet)",
          lastMessageTime: latestMsg?.created_at || convo.created_at,
          unreadCount: unreadCount || 0,
        });
      }

      setConversations(conversationList);
    } catch (e) {
      console.error("Unexpected error fetching conversations:", e);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchConversations();
  }, [currentUserId]);

  const openChat = (conversation: Conversation) => {
    router.push({
      pathname: "/(feat)/Chat",
      params: {
        conversationId: conversation.id,
        rentalName: conversation.userName,
        userId: currentUserId,
      },
    });
  };

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return "Just now";
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString();
  };

  const renderConversation = ({ item }: { item: Conversation }) => (
    <TouchableOpacity
      style={styles.conversationCard}
      onPress={() => openChat(item)}
    >
      <View style={styles.avatarContainer}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>
            {item.userName.charAt(0).toUpperCase()}
          </Text>
        </View>
      </View>

      <View style={styles.conversationContent}>
        <View style={styles.conversationHeader}>
          <Text style={styles.userName}>{item.userName}</Text>
          <Text style={styles.timeText}>
            {formatTime(item.lastMessageTime)}
          </Text>
        </View>
        <View style={styles.messageRow}>
          <Text
            style={[
              styles.lastMessage,
              item.unreadCount > 0 && styles.unreadMessage,
            ]}
            numberOfLines={1}
          >
            {item.lastMessage}
          </Text>
          {item.unreadCount > 0 && (
            <View style={styles.unreadBadge}>
              <Text style={styles.unreadCount}>{item.unreadCount}</Text>
            </View>
          )}
        </View>
      </View>
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <View style={styles.container}>
        <BackButton />
        <Text style={styles.header}>Messages</Text>
        <Text style={styles.subheader}>Your customer conversations</Text>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#073051" />
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <BackButton />
      <Text style={styles.header}>Messages</Text>
      <Text style={styles.subheader}>Your customer conversations</Text>

      {conversations.length === 0 ? (
        <View style={styles.emptyContainer}>
          <EmptyStateIcon />
          <Text style={styles.emptyText}>
            No messages yet{"\n"}Customers will appear here when they message
            you
          </Text>
        </View>
      ) : (
        <FlatList
          data={conversations}
          renderItem={renderConversation}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContainer}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={["#073051"]}
            />
          }
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F5F5F5",
  },
  header: {
    fontWeight: "bold",
    fontSize: 25,
    marginLeft: 20,
    marginTop: 10,
    color: "#073051",
  },
  subheader: {
    marginLeft: 25,
    marginBottom: 15,
    color: "#595959",
    fontFamily: "Poppins",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 100,
  },
  emptyText: {
    textAlign: "center",
    fontSize: 15,
    marginTop: 15,
    color: "#666",
  },
  listContainer: {
    paddingHorizontal: 15,
    paddingBottom: 20,
  },
  conversationCard: {
    backgroundColor: "white",
    borderRadius: 10,
    padding: 15,
    marginBottom: 10,
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#E0E0E0",
  },
  avatarContainer: {
    marginRight: 15,
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: "#0D99FF",
    justifyContent: "center",
    alignItems: "center",
  },
  avatarText: {
    color: "white",
    fontSize: 20,
    fontWeight: "bold",
  },
  conversationContent: {
    flex: 1,
  },
  conversationHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 5,
  },
  userName: {
    fontSize: 17,
    fontWeight: "bold",
    color: "#073051",
  },
  timeText: {
    fontSize: 12,
    color: "#999",
  },
  messageRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  lastMessage: {
    fontSize: 15,
    color: "#666",
    flex: 1,
  },
  unreadMessage: {
    fontWeight: "600",
    color: "#000",
  },
  unreadBadge: {
    backgroundColor: "#0D99FF",
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 6,
    marginLeft: 10,
  },
  unreadCount: {
    color: "white",
    fontSize: 12,
    fontWeight: "bold",
  },
});
