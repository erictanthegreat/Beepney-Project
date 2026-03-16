import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Modal,
  Pressable,
} from "react-native";
import "@fontsource/poppins";
import BackButton from "@/components/Backbutton";
import EmptyStateIcon from "../../assets/images/empty.svg";
import { supabase } from "@/scripts/supabase";

// Add interface for notification type
interface Notification {
  id: string;
  user_id: string;
  type: string;
  title: string;
  message: string;
  status?: string;
  created_at: string;
  read: boolean;
}

export default function Notification() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [sortBy, setSortBy] = useState("all");
  const [selectedNotification, setSelectedNotification] =
    useState<Notification | null>(null);

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
          notif.id === notificationId ? { ...notif, read: true } : notif,
        ),
      );
    } catch (err) {
      console.error("Error marking as read:", err);
    }
  };

  const handleNotificationPress = (notif: Notification) => {
    if (!notif.read) {
      markAsRead(notif.id);
    }
    setSelectedNotification(notif);
  };

  const getNotificationIcon = (type: string) => {
    const icons: { [key: string]: string } = {
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
    const colors: { [key: string]: string } = {
      Pending: "#F7CB73",
      Approved: "green",
      Declined: "red",
      "In-Review": "#F7CB73",
      Received: "#1E86DA",
      Resolved: "#D1FAE5",
      Dismissed: "red",
      Solved: "green",
      Verified: "green",
      "In-Action": "#1E86DA",
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

  const formatFullDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getDateLabel = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    const notifDate = new Date(
      date.getFullYear(),
      date.getMonth(),
      date.getDate(),
    );

    if (notifDate.getTime() === today.getTime()) {
      return "Today";
    } else if (notifDate.getTime() === yesterday.getTime()) {
      return "Yesterday";
    } else if (now.getTime() - notifDate.getTime() < 7 * 24 * 60 * 60 * 1000) {
      return date.toLocaleDateString("en-US", { weekday: "long" });
    } else {
      return date.toLocaleDateString("en-US", {
        month: "long",
        day: "numeric",
        year: date.getFullYear() !== now.getFullYear() ? "numeric" : undefined,
      });
    }
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

  // Group notifications by date with proper typing
  const groupedNotifications: { [key: string]: Notification[] } =
    filteredNotifications.reduce(
      (groups, notif) => {
        const dateLabel = getDateLabel(notif.created_at);
        if (!groups[dateLabel]) {
          groups[dateLabel] = [];
        }
        groups[dateLabel].push(notif);
        return groups;
      },
      {} as { [key: string]: Notification[] },
    );

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
          {Object.entries(groupedNotifications).map(([dateLabel, notifs]) => (
            <View key={dateLabel}>
              {/* Date Divider */}
              <View style={styles.dateDivider}>
                <View style={styles.dividerLine} />
                <Text style={styles.dateLabel}>{dateLabel}</Text>
                <View style={styles.dividerLine} />
              </View>

              {/* Notifications for this date */}
              {notifs.map((notif) => (
                <TouchableOpacity
                  key={notif.id}
                  style={[
                    styles.notificationCard,
                    !notif.read && styles.unreadCard,
                  ]}
                  onPress={() => handleNotificationPress(notif)}
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
            </View>
          ))}
        </ScrollView>
      )}

      {/* Notification Detail Modal */}
      <Modal
        visible={selectedNotification !== null}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setSelectedNotification(null)}
      >
        <Pressable
          style={styles.modalOverlay}
          onPress={() => setSelectedNotification(null)}
        >
          <Pressable
            style={styles.modalContent}
            onPress={(e) => e.stopPropagation()}
          >
            {/* Close Button */}
            <TouchableOpacity
              style={styles.closeButton}
              onPress={() => setSelectedNotification(null)}
            >
              <Text style={styles.closeButtonText}>✕</Text>
            </TouchableOpacity>

            {/* Icon */}
            <View style={styles.modalIcon}>
              <Text style={styles.modalIconText}>
                {selectedNotification &&
                  getNotificationIcon(selectedNotification.type)}
              </Text>
            </View>

            {/* Title */}
            <Text style={styles.modalTitle}>{selectedNotification?.title}</Text>

            {/* Status Badge */}
            {selectedNotification?.status && (
              <View
                style={[
                  styles.modalStatusBadge,
                  {
                    backgroundColor: getStatusColor(
                      selectedNotification.status,
                    ),
                  },
                ]}
              >
                <Text style={styles.modalStatusText}>
                  {selectedNotification.status.toUpperCase()}
                </Text>
              </View>
            )}

            {/* Message */}
            <ScrollView
              style={styles.modalMessageContainer}
              showsVerticalScrollIndicator={false}
            >
              <Text style={styles.modalMessage}>
                {selectedNotification?.message}
              </Text>
            </ScrollView>

            {/* Timestamp */}
            <Text style={styles.modalTimestamp}>
              {selectedNotification &&
                formatFullDate(selectedNotification.created_at)}
            </Text>
          </Pressable>
        </Pressable>
      </Modal>
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
  dateDivider: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: 15,
    marginHorizontal: 10,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: "#E0E0E0",
  },
  dateLabel: {
    paddingHorizontal: 12,
    fontSize: 13,
    fontWeight: "600",
    color: "#073051",
    fontFamily: "Poppins",
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
    paddingHorizontal: 15,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 9,
    color: "#FFFFFF",
    fontWeight: "600",
    fontFamily: "Poppins",
    justifyContent: "center",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 100,
  },
  // Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  modalContent: {
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    padding: 25,
    width: "100%",
    maxWidth: 400,
    maxHeight: "80%",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  closeButton: {
    position: "absolute",
    top: 15,
    right: 15,
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: "#F0F0F0",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 1,
  },
  closeButtonText: {
    fontSize: 20,
    color: "#666",
    fontWeight: "bold",
  },
  modalIcon: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: "#E3F2FD",
    justifyContent: "center",
    alignItems: "center",
    alignSelf: "center",
    marginTop: 10,
    marginBottom: 15,
  },
  modalIconText: {
    fontSize: 30,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#073051",
    fontFamily: "Poppins",
    textAlign: "center",
    marginBottom: 12,
  },
  modalStatusBadge: {
    paddingHorizontal: 15,
    paddingVertical: 6,
    borderRadius: 15,
    alignSelf: "center",
    marginBottom: 15,
  },
  modalStatusText: {
    fontSize: 11,
    color: "#FFFFFF",
    fontWeight: "600",
    fontFamily: "Poppins",
  },
  modalMessageContainer: {
    maxHeight: 300,
    marginBottom: 15,
  },
  modalMessage: {
    fontSize: 15,
    color: "#666",
    fontFamily: "Poppins",
    lineHeight: 22,
    textAlign: "center",
  },
  modalTimestamp: {
    fontSize: 12,
    color: "#999",
    fontFamily: "Poppins",
    textAlign: "center",
    marginTop: 10,
  },
});
