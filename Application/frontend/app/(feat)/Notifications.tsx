import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";
import "@fontsource/poppins";
import BackButton from "@/components/Backbutton";
import EmptyStateIcon from "../../assets/images/empty.svg";
import { supabase } from "@/scripts/supabase";

export default function Notification() {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sortBy, setSortBy] = useState("all"); // 'all', 'submissions', 'complaints'

  useEffect(() => {
    fetchNotifications();
  }, []);

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session?.user) return;

      const { data, error } = await supabase
        .from("notifications")
        .select("*")
        .eq("user_id", session.user.id)
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Error fetching notifications:", error);
        return;
      }

      setNotifications(data || []);
    } catch (err) {
      console.error("Unexpected error:", err);
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = async (notificationId: string) => {
    try {
      await supabase
        .from("notifications")
        .update({ read: true })
        .eq("id", notificationId);

      setNotifications((prev) =>
        prev.map((notif) =>
          notif.id === notificationId ? { ...notif, read: true } : notif
        )
      );
    } catch (err) {
      console.error("Error marking as read:", err);
    }
  };

  const getNotificationIcon = (type: string) => {
    const icons = {
      discount_application: "🎫",
      discount_status: "🎫",
      license_application: "🪪",
      license_status: "🪪",
      complaint_status: "📋",
      complaint_resolved: "✔️",
    };
    return icons[type] || "🔔";
  };

  const getStatusColor = (status: string) => {
    const colors = {
      Pending: "#FFA500",
      Approved: "#4CAF50",
      Rejected: "#F44336",
      "In Review": "#2196F3",
      Received: "#2196F3",
      Resolved: "#4CAF50",
    };
    return colors[status] || "#888";
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return "Just now";
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    if (days < 7) return `${days}d ago`;
    return date.toLocaleDateString();
  };

  const isSubmissionType = (type: string) => {
    return (
      type.includes("discount") ||
      type.includes("license") ||
      type.includes("driver_profile")
    );
  };

  const isComplaintType = (type: string) => {
    return type.includes("complaint");
  };

  const filteredNotifications = notifications.filter((notif) => {
    if (sortBy === "all") return true;
    if (sortBy === "submissions") return isSubmissionType(notif.type);
    if (sortBy === "complaints") return isComplaintType(notif.type);
    return true;
  });

  const isEmpty = filteredNotifications.length === 0;
  const unreadCount = notifications.filter((n) => !n.read).length;

  if (loading) {
    return (
      <View style={{ flex: 1 }}>
        <BackButton />
        <Text style={styles.header}>Notification</Text>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#1E86DA" />
        </View>
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: "#FFFFFF" }}>
      <BackButton />
      <Text style={styles.header}>Notification</Text>
      <Text style={styles.subtitle}>
        {isEmpty
          ? "Get updates from your submissions status \nin Beepney"
          : `You have ${unreadCount} unread notification${unreadCount !== 1 ? "s" : ""}`}
      </Text>

      <View style={styles.sortContainer}>
        <TouchableOpacity
          style={[
            styles.sortButton,
            sortBy === "all" && styles.sortButtonActive,
          ]}
          onPress={() => setSortBy("all")}
        >
          <Text
            style={[
              styles.sortButtonText,
              sortBy === "all" && styles.sortButtonTextActive,
            ]}
          >
            All
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.sortButton,
            sortBy === "submissions" && styles.sortButtonActive,
          ]}
          onPress={() => setSortBy("submissions")}
        >
          <Text
            style={[
              styles.sortButtonText,
              sortBy === "submissions" && styles.sortButtonTextActive,
            ]}
          >
            Submissions
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.sortButton,
            sortBy === "complaints" && styles.sortButtonActive,
          ]}
          onPress={() => setSortBy("complaints")}
        >
          <Text
            style={[
              styles.sortButtonText,
              sortBy === "complaints" && styles.sortButtonTextActive,
            ]}
          >
            Complaints
          </Text>
        </TouchableOpacity>
      </View>

      {/* Notifications List */}
      {isEmpty ? (
        <View style={styles.emptyContainer}>
          <EmptyStateIcon />
          <Text style={styles.emptyText}>
            Whoops......Looks like there's {"\n"}nothing here.
          </Text>
        </View>
      ) : (
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {filteredNotifications.map((notif) => (
            <TouchableOpacity
              key={notif.id}
              style={[
                styles.notificationCard,
                !notif.read && styles.unreadCard,
              ]}
              onPress={() => !notif.read && markAsRead(notif.id)}
            >
              <View style={styles.notificationIcon}>
                <Text style={styles.iconText}>
                  {getNotificationIcon(notif.type)}
                </Text>
              </View>

              <View style={styles.notificationContent}>
                <View style={styles.notificationHeader}>
                  <Text style={styles.notificationTitle} numberOfLines={1}>
                    {notif.title}
                  </Text>
                  {!notif.read && <View style={styles.unreadDot} />}
                </View>

                <Text style={styles.notificationMessage} numberOfLines={2}>
                  {notif.message}
                </Text>

                <View style={styles.notificationFooter}>
                  <Text style={styles.notificationTime}>
                    {formatTime(notif.created_at)}
                  </Text>
                  {notif.status && (
                    <View
                      style={[
                        styles.statusBadge,
                        { backgroundColor: getStatusColor(notif.status) },
                      ]}
                    >
                      <Text style={styles.statusText}>
                        {notif.status.toUpperCase()}
                      </Text>
                    </View>
                  )}
                </View>
              </View>
            </TouchableOpacity>
          ))}
        </ScrollView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    fontWeight: "bold",
    fontSize: 25,
    marginLeft: 20,
    marginTop: 10,
    color: "#073051",
    fontFamily: "Poppins",
  },
  subtitle: {
    marginLeft: 25,
    marginTop: 5,
    color: "#595959",
    fontSize: 14,
    fontFamily: "Poppins",
  },
  sortContainer: {
    flexDirection: "row",
    paddingHorizontal: 20,
    marginTop: 20,
    marginBottom: 15,
    gap: 10,
  },
  sortButton: {
    paddingHorizontal: 18,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: "#F0F0F0",
    borderWidth: 1,
    borderColor: "#E0E0E0",
  },
  sortButtonActive: {
    backgroundColor: "#1E86DA",
    borderColor: "#1E86DA",
  },
  sortButtonText: {
    fontSize: 13,
    color: "#666",
    fontFamily: "Poppins",
    fontWeight: "500",
  },
  sortButtonTextActive: {
    color: "#FFFFFF",
    fontWeight: "600",
  },
  emptyContainer: {
    alignItems: "center",
    marginTop: 150,
  },
  emptyText: {
    textAlign: "center",
    fontSize: 15,
    marginTop: 15,
    color: "#595959",
    fontFamily: "Poppins",
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 15,
    paddingBottom: 20,
  },
  notificationCard: {
    flexDirection: "row",
    backgroundColor: "#F9F9F9",
    borderRadius: 12,
    padding: 15,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#E8E8E8",
  },
  unreadCard: {
    backgroundColor: "#F0F8FF",
    borderLeftWidth: 4,
    borderLeftColor: "#1E86DA",
    borderColor: "#D4E9F7",
  },
  notificationIcon: {
    width: 45,
    height: 45,
    borderRadius: 22.5,
    backgroundColor: "#E3F2FD",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  iconText: {
    fontSize: 22,
  },
  notificationContent: {
    flex: 1,
  },
  notificationHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 4,
  },
  notificationTitle: {
    fontSize: 15,
    fontWeight: "600",
    color: "#073051",
    fontFamily: "Poppins",
    flex: 1,
  },
  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#1E86DA",
    marginLeft: 8,
  },
  notificationMessage: {
    fontSize: 13,
    color: "#666",
    marginBottom: 8,
    fontFamily: "Poppins",
    lineHeight: 18,
  },
  notificationFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  notificationTime: {
    fontSize: 11,
    color: "#999",
    fontFamily: "Poppins",
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 9,
    color: "#FFFFFF",
    fontWeight: "600",
    fontFamily: "Poppins",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 100,
  },
});
