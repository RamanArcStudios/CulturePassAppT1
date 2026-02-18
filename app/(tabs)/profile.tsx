import React, { useState, useCallback } from "react";
import {
  View,
  Text,
  ScrollView,
  Pressable,
  TextInput,
  StyleSheet,
  Platform,
  Alert,
  ActivityIndicator,
  RefreshControl,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons, Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { LinearGradient } from "expo-linear-gradient";
import { useQuery, useMutation } from "@tanstack/react-query";
import { router } from "expo-router";
import Colors from "@/constants/colors";
import EventCard from "@/components/EventCard";
import { type Event, type Organisation, type Order, type Membership } from "@/lib/data";
import { useAuth } from "@/lib/auth";
import { apiRequest, queryClient } from "@/lib/query-client";

type ProfileTab = "saved" | "tickets" | "communities";

export default function ProfileScreen() {
  const insets = useSafeAreaInsets();
  const { user, isLoading: authLoading, isAuthenticated, logout, updateProfile } = useAuth();
  const [activeTab, setActiveTab] = useState<ProfileTab>("saved");
  const [editing, setEditing] = useState(false);
  const [editName, setEditName] = useState("");
  const [editEmail, setEditEmail] = useState("");
  const [editCity, setEditCity] = useState("");
  const [editState, setEditState] = useState("");
  const [editLoading, setEditLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const { data: allEvents = [], isLoading: loadingEvents } = useQuery<Event[]>({
    queryKey: ["/api/events"],
  });

  const { data: orders = [], isLoading: loadingOrders } = useQuery<Order[]>({
    queryKey: ["/api/orders"],
    enabled: isAuthenticated,
  });

  const { data: memberships = [], isLoading: loadingMemberships } = useQuery<Membership[]>({
    queryKey: ["/api/memberships"],
    enabled: isAuthenticated,
  });

  const { data: allOrganisations = [] } = useQuery<Organisation[]>({
    queryKey: ["/api/organisations"],
  });

  const savedEventIds: string[] = user?.savedEvents ?? [];
  const savedEvents = allEvents.filter((e) => savedEventIds.includes(e.id));

  const memberOrgs = allOrganisations.filter((org) =>
    memberships.some((m) => m.orgId === org.id)
  );

  const unsaveMutation = useMutation({
    mutationFn: async (eventId: string) => {
      await apiRequest("POST", "/api/users/save-event", { eventId });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/auth/me"] });
    },
  });

  const handleUnsave = useCallback(
    async (id: string) => {
      if (Platform.OS !== "web")
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      unsaveMutation.mutate(id);
    },
    [unsaveMutation]
  );

  const startEditing = () => {
    setEditName(user?.name || "");
    setEditEmail(user?.email || "");
    setEditCity(user?.city || "");
    setEditState(user?.state || "");
    setEditing(true);
  };

  const handleSaveProfile = async () => {
    if (!editName.trim()) {
      Alert.alert("Error", "Name is required");
      return;
    }
    setEditLoading(true);
    try {
      await updateProfile({
        name: editName.trim(),
        email: editEmail.trim(),
        city: editCity.trim(),
        state: editState.trim(),
      });
      setEditing(false);
      if (Platform.OS !== "web")
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } catch (err: any) {
      Alert.alert("Error", err.message || "Failed to update profile");
    } finally {
      setEditLoading(false);
    }
  };

  const handleLogout = () => {
    Alert.alert("Log Out", "Are you sure you want to log out?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Log Out",
        style: "destructive",
        onPress: async () => {
          await logout();
        },
      },
    ]);
  };

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    Promise.all([
      queryClient.invalidateQueries({ queryKey: ["/api/auth/me"] }),
      queryClient.invalidateQueries({ queryKey: ["/api/events"] }),
      queryClient.invalidateQueries({ queryKey: ["/api/orders"] }),
      queryClient.invalidateQueries({ queryKey: ["/api/memberships"] }),
    ]).then(() => setRefreshing(false));
  }, []);

  const webTopInset = Platform.OS === "web" ? 67 : 0;

  if (authLoading || loadingEvents) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" color={Colors.light.primary} />
      </View>
    );
  }

  if (!isAuthenticated) {
    return (
      <View style={[styles.guestContainer, { paddingTop: insets.top + webTopInset }]}>
        <LinearGradient
          colors={[Colors.light.secondary, Colors.light.secondaryLight]}
          style={styles.guestGradient}
        >
          <View style={styles.guestLogoContainer}>
            <Ionicons name="compass" size={48} color="#fff" />
          </View>
          <Text style={styles.guestTitle}>Join CulturePass</Text>
          <Text style={styles.guestSubtitle}>
            Sign up or log in to save events, buy tickets, and connect with your community
          </Text>
          <Pressable
            onPress={() => router.push("/auth")}
            style={({ pressed }) => [
              styles.guestBtn,
              { opacity: pressed ? 0.9 : 1 },
            ]}
            testID="profile-login-btn"
          >
            <LinearGradient
              colors={[Colors.light.primary, Colors.light.primaryDark]}
              style={styles.guestBtnGradient}
            >
              <Ionicons name="log-in-outline" size={20} color="#fff" />
              <Text style={styles.guestBtnText}>Log In / Sign Up</Text>
            </LinearGradient>
          </Pressable>
        </LinearGradient>

        <View style={styles.guestFeatures}>
          {[
            { icon: "bookmark", label: "Save your favourite events" },
            { icon: "ticket", label: "Purchase and manage tickets" },
            { icon: "people", label: "Join community organisations" },
            { icon: "pricetag", label: "Access member-only perks" },
          ].map((item, idx) => (
            <View key={idx} style={styles.guestFeatureRow}>
              <View style={styles.guestFeatureIcon}>
                <Ionicons
                  name={item.icon as any}
                  size={18}
                  color={Colors.light.primary}
                />
              </View>
              <Text style={styles.guestFeatureText}>{item.label}</Text>
            </View>
          ))}
        </View>
      </View>
    );
  }

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={{ paddingBottom: 100 }}
      showsVerticalScrollIndicator={false}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={onRefresh}
          tintColor={Colors.light.primary}
        />
      }
    >
      <LinearGradient
        colors={[Colors.light.secondary, Colors.light.secondaryLight]}
        style={[
          styles.profileHeader,
          { paddingTop: insets.top + webTopInset + 20 },
        ]}
      >
        <View style={styles.headerActions}>
          <View style={{ width: 36 }} />
          <Pressable onPress={startEditing} style={styles.headerActionBtn}>
            <Feather name="edit-2" size={18} color="#fff" />
          </Pressable>
        </View>
        <View style={styles.avatarContainer}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>
              {(user?.name || "U").charAt(0).toUpperCase()}
            </Text>
          </View>
        </View>
        <Text style={styles.profileName}>{user?.name}</Text>
        <Text style={styles.profileLocation}>
          {user?.city}, {user?.state}
        </Text>
        {user?.cpid && (
          <View style={styles.cpidBadge}>
            <Ionicons
              name="shield-checkmark"
              size={12}
              color="rgba(255,255,255,0.8)"
            />
            <Text style={styles.profileCpid}>{user.cpid}</Text>
          </View>
        )}
        <View style={styles.statsRow}>
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>{savedEventIds.length}</Text>
            <Text style={styles.statLabel}>Saved</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>{orders.length}</Text>
            <Text style={styles.statLabel}>Tickets</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>{memberships.length}</Text>
            <Text style={styles.statLabel}>Communities</Text>
          </View>
        </View>
      </LinearGradient>

      {editing && (
        <View style={styles.editSection}>
          <Text style={styles.editTitle}>Edit Profile</Text>
          <View style={styles.editInputGroup}>
            <Text style={styles.editLabel}>Name</Text>
            <TextInput
              style={styles.editInput}
              value={editName}
              onChangeText={setEditName}
              placeholder="Full name"
              placeholderTextColor={Colors.light.textTertiary}
            />
          </View>
          <View style={styles.editInputGroup}>
            <Text style={styles.editLabel}>Email</Text>
            <TextInput
              style={styles.editInput}
              value={editEmail}
              onChangeText={setEditEmail}
              placeholder="Email"
              placeholderTextColor={Colors.light.textTertiary}
              keyboardType="email-address"
              autoCapitalize="none"
            />
          </View>
          <View style={styles.editLocationRow}>
            <View style={[styles.editInputGroup, { flex: 1 }]}>
              <Text style={styles.editLabel}>City</Text>
              <TextInput
                style={styles.editInput}
                value={editCity}
                onChangeText={setEditCity}
              />
            </View>
            <View style={[styles.editInputGroup, { width: 100 }]}>
              <Text style={styles.editLabel}>State</Text>
              <TextInput
                style={styles.editInput}
                value={editState}
                onChangeText={setEditState}
              />
            </View>
          </View>
          <View style={styles.editBtnRow}>
            <Pressable
              onPress={() => setEditing(false)}
              style={styles.editCancelBtn}
            >
              <Text style={styles.editCancelText}>Cancel</Text>
            </Pressable>
            <Pressable
              onPress={handleSaveProfile}
              disabled={editLoading}
              style={[
                styles.editSaveBtn,
                { opacity: editLoading ? 0.6 : 1 },
              ]}
            >
              {editLoading ? (
                <ActivityIndicator color="#fff" size="small" />
              ) : (
                <Text style={styles.editSaveText}>Save Changes</Text>
              )}
            </Pressable>
          </View>
        </View>
      )}

      <View style={styles.tabRow}>
        {(["saved", "tickets", "communities"] as ProfileTab[]).map((tab) => {
          const isActive = activeTab === tab;
          const labels: Record<ProfileTab, string> = {
            saved: "Saved Events",
            tickets: "My Tickets",
            communities: "Communities",
          };
          return (
            <Pressable
              key={tab}
              onPress={() => {
                if (Platform.OS !== "web")
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                setActiveTab(tab);
              }}
              style={[styles.tab, isActive && styles.activeTab]}
            >
              <Text
                style={[styles.tabText, isActive && styles.activeTabText]}
              >
                {labels[tab]}
              </Text>
            </Pressable>
          );
        })}
      </View>

      {activeTab === "saved" && (
        <View style={styles.contentSection}>
          {savedEvents.length > 0 ? (
            savedEvents.map((event) => (
              <EventCard
                key={event.id}
                event={event}
                variant="list"
                onSave={handleUnsave}
                isSaved={true}
              />
            ))
          ) : (
            <View style={styles.emptyState}>
              <Ionicons
                name="bookmark-outline"
                size={48}
                color={Colors.light.textTertiary}
              />
              <Text style={styles.emptyTitle}>No saved events</Text>
              <Text style={styles.emptyText}>
                Browse events and tap the bookmark icon to save them here
              </Text>
            </View>
          )}
        </View>
      )}

      {activeTab === "tickets" && (
        <View style={styles.contentSection}>
          {loadingOrders ? (
            <ActivityIndicator
              color={Colors.light.primary}
              style={{ marginTop: 32 }}
            />
          ) : orders.length > 0 ? (
            orders.map((order) => {
              const event = allEvents.find((e) => e.id === order.eventId);
              return (
                <Pressable
                  key={order.id}
                  onPress={() =>
                    order.eventId && router.push(`/event/${order.eventId}`)
                  }
                  style={styles.ticketCard}
                >
                  <View style={styles.ticketLeft}>
                    <Ionicons
                      name="ticket"
                      size={24}
                      color={Colors.light.primary}
                    />
                  </View>
                  <View style={styles.ticketInfo}>
                    <Text style={styles.ticketTitle} numberOfLines={1}>
                      {event?.title || "Event"}
                    </Text>
                    <Text style={styles.ticketMeta}>
                      {order.quantity || 1} ticket
                      {(order.quantity || 1) > 1 ? "s" : ""} - $
                      {order.totalPrice} AUD
                    </Text>
                    <Text style={styles.ticketDate}>
                      {event?.date
                        ? new Date(event.date + "T00:00:00").toLocaleDateString(
                            "en-AU",
                            { day: "numeric", month: "short" }
                          )
                        : ""}
                    </Text>
                  </View>
                  <View
                    style={[
                      styles.ticketStatus,
                      {
                        backgroundColor:
                          order.status === "confirmed"
                            ? Colors.light.success + "15"
                            : Colors.light.accent + "15",
                      },
                    ]}
                  >
                    <Text
                      style={[
                        styles.ticketStatusText,
                        {
                          color:
                            order.status === "confirmed"
                              ? Colors.light.success
                              : Colors.light.accent,
                        },
                      ]}
                    >
                      {order.status}
                    </Text>
                  </View>
                </Pressable>
              );
            })
          ) : (
            <View style={styles.emptyState}>
              <Ionicons
                name="ticket-outline"
                size={48}
                color={Colors.light.textTertiary}
              />
              <Text style={styles.emptyTitle}>No tickets yet</Text>
              <Text style={styles.emptyText}>
                Your purchased event tickets will appear here
              </Text>
            </View>
          )}
        </View>
      )}

      {activeTab === "communities" && (
        <View style={styles.contentSection}>
          {loadingMemberships ? (
            <ActivityIndicator
              color={Colors.light.primary}
              style={{ marginTop: 32 }}
            />
          ) : memberOrgs.length > 0 ? (
            memberOrgs.map((org) => (
              <Pressable
                key={org.id}
                onPress={() => router.push(`/community/${org.id}`)}
                style={styles.communityCard}
              >
                <View style={styles.communityAvatar}>
                  <Text style={styles.communityAvatarText}>
                    {org.name.charAt(0)}
                  </Text>
                </View>
                <View style={styles.communityInfo}>
                  <Text style={styles.communityName} numberOfLines={1}>
                    {org.name}
                  </Text>
                  <Text style={styles.communityMeta}>
                    {org.city}, {org.state}
                    {org.memberCount
                      ? ` - ${org.memberCount} members`
                      : ""}
                  </Text>
                </View>
                <Ionicons
                  name="chevron-forward"
                  size={18}
                  color={Colors.light.textTertiary}
                />
              </Pressable>
            ))
          ) : (
            <View style={styles.emptyState}>
              <Ionicons
                name="people-outline"
                size={48}
                color={Colors.light.textTertiary}
              />
              <Text style={styles.emptyTitle}>No communities joined</Text>
              <Text style={styles.emptyText}>
                Join organisations to connect with your community
              </Text>
            </View>
          )}
        </View>
      )}

      <View style={styles.menuSection}>
        <Text style={styles.menuTitle}>Settings</Text>
        {[
          {
            icon: "notifications-outline",
            label: "Notifications",
            action: () => router.push("/settings/notifications"),
          },
          {
            icon: "shield-checkmark-outline",
            label: "Privacy",
            action: () => router.push("/settings/privacy"),
          },
          {
            icon: "help-circle-outline",
            label: "Help & Support",
            action: () => router.push("/settings/help"),
          },
          {
            icon: "information-circle-outline",
            label: "About CulturePass",
            action: () => router.push("/settings/about"),
          },
        ].map((item, idx, arr) => (
          <Pressable
            key={idx}
            onPress={item.action}
            style={({ pressed }) => [
              styles.menuItem,
              { opacity: pressed ? 0.7 : 1 },
              idx < arr.length - 1 && styles.menuItemBorder,
            ]}
          >
            <Ionicons
              name={item.icon as any}
              size={20}
              color={Colors.light.textSecondary}
            />
            <Text style={styles.menuLabel}>{item.label}</Text>
            <Ionicons
              name="chevron-forward"
              size={18}
              color={Colors.light.textTertiary}
            />
          </Pressable>
        ))}

        <Pressable
          onPress={handleLogout}
          style={({ pressed }) => [
            styles.logoutBtn,
            { opacity: pressed ? 0.8 : 1 },
          ]}
          testID="profile-logout-btn"
        >
          <Ionicons name="log-out-outline" size={20} color={Colors.light.error} />
          <Text style={styles.logoutText}>Log Out</Text>
        </Pressable>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.light.background,
  },
  guestContainer: {
    flex: 1,
    backgroundColor: Colors.light.background,
  },
  guestGradient: {
    alignItems: "center",
    paddingTop: 40,
    paddingBottom: 36,
    paddingHorizontal: 32,
    borderBottomLeftRadius: 28,
    borderBottomRightRadius: 28,
  },
  guestLogoContainer: {
    width: 88,
    height: 88,
    borderRadius: 44,
    backgroundColor: "rgba(255,255,255,0.15)",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 16,
  },
  guestTitle: {
    fontSize: 24,
    fontFamily: "Poppins_700Bold",
    color: "#fff",
  },
  guestSubtitle: {
    fontSize: 14,
    fontFamily: "Poppins_400Regular",
    color: "rgba(255,255,255,0.8)",
    textAlign: "center",
    marginTop: 8,
    lineHeight: 22,
  },
  guestBtn: {
    marginTop: 24,
    borderRadius: 16,
    overflow: "hidden",
  },
  guestBtnGradient: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingHorizontal: 32,
    paddingVertical: 16,
    borderRadius: 16,
  },
  guestBtnText: {
    fontSize: 16,
    fontFamily: "Poppins_700Bold",
    color: "#fff",
  },
  guestFeatures: {
    paddingHorizontal: 24,
    paddingTop: 32,
    gap: 16,
  },
  guestFeatureRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
  },
  guestFeatureIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: Colors.light.primary + "12",
    alignItems: "center",
    justifyContent: "center",
  },
  guestFeatureText: {
    fontSize: 15,
    fontFamily: "Poppins_500Medium",
    color: Colors.light.text,
  },
  profileHeader: {
    alignItems: "center",
    paddingBottom: 24,
    borderBottomLeftRadius: 28,
    borderBottomRightRadius: 28,
  },
  headerActions: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "100%",
    paddingHorizontal: 20,
    marginBottom: 8,
  },
  headerActionBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "rgba(255,255,255,0.2)",
    alignItems: "center",
    justifyContent: "center",
  },
  avatarContainer: {
    marginBottom: 12,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "rgba(255,255,255,0.2)",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 3,
    borderColor: "rgba(255,255,255,0.4)",
  },
  avatarText: {
    fontSize: 32,
    fontFamily: "Poppins_700Bold",
    color: "#fff",
  },
  profileName: {
    fontSize: 22,
    fontFamily: "Poppins_700Bold",
    color: "#fff",
  },
  profileLocation: {
    fontSize: 13,
    fontFamily: "Poppins_400Regular",
    color: "rgba(255,255,255,0.7)",
    marginTop: 2,
  },
  cpidBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    marginTop: 6,
    backgroundColor: "rgba(255,255,255,0.1)",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  profileCpid: {
    fontSize: 11,
    fontFamily: "Poppins_500Medium",
    color: "rgba(255,255,255,0.8)",
  },
  statsRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 16,
    gap: 24,
  },
  statItem: {
    alignItems: "center",
  },
  statNumber: {
    fontSize: 20,
    fontFamily: "Poppins_700Bold",
    color: "#fff",
  },
  statLabel: {
    fontSize: 12,
    fontFamily: "Poppins_400Regular",
    color: "rgba(255,255,255,0.7)",
  },
  statDivider: {
    width: 1,
    height: 30,
    backgroundColor: "rgba(255,255,255,0.2)",
  },
  editSection: {
    margin: 20,
    padding: 20,
    backgroundColor: Colors.light.surface,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: Colors.light.borderLight,
  },
  editTitle: {
    fontSize: 18,
    fontFamily: "Poppins_700Bold",
    color: Colors.light.text,
    marginBottom: 16,
  },
  editInputGroup: {
    marginBottom: 14,
  },
  editLabel: {
    fontSize: 12,
    fontFamily: "Poppins_600SemiBold",
    color: Colors.light.textSecondary,
    marginBottom: 4,
  },
  editInput: {
    backgroundColor: Colors.light.surfaceElevated,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 10,
    fontSize: 14,
    fontFamily: "Poppins_400Regular",
    color: Colors.light.text,
    borderWidth: 1,
    borderColor: Colors.light.borderLight,
  },
  editLocationRow: {
    flexDirection: "row",
    gap: 12,
  },
  editBtnRow: {
    flexDirection: "row",
    gap: 12,
    marginTop: 8,
  },
  editCancelBtn: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: "center",
    backgroundColor: Colors.light.surfaceElevated,
  },
  editCancelText: {
    fontSize: 14,
    fontFamily: "Poppins_600SemiBold",
    color: Colors.light.textSecondary,
  },
  editSaveBtn: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: "center",
    backgroundColor: Colors.light.primary,
  },
  editSaveText: {
    fontSize: 14,
    fontFamily: "Poppins_700Bold",
    color: "#fff",
  },
  tabRow: {
    flexDirection: "row",
    marginHorizontal: 20,
    gap: 8,
    marginTop: 20,
    marginBottom: 16,
  },
  tab: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 12,
    alignItems: "center",
    backgroundColor: Colors.light.surfaceElevated,
    borderWidth: 1,
    borderColor: Colors.light.borderLight,
  },
  activeTab: {
    backgroundColor: Colors.light.primary,
    borderColor: Colors.light.primary,
  },
  tabText: {
    fontSize: 12,
    fontFamily: "Poppins_600SemiBold",
    color: Colors.light.textSecondary,
  },
  activeTabText: {
    color: "#fff",
  },
  contentSection: {
    paddingHorizontal: 20,
    minHeight: 150,
  },
  emptyState: {
    alignItems: "center",
    paddingVertical: 40,
    gap: 8,
  },
  emptyTitle: {
    fontSize: 16,
    fontFamily: "Poppins_600SemiBold",
    color: Colors.light.text,
  },
  emptyText: {
    fontSize: 13,
    fontFamily: "Poppins_400Regular",
    color: Colors.light.textSecondary,
    textAlign: "center",
    maxWidth: 260,
  },
  ticketCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.light.surface,
    padding: 14,
    borderRadius: 16,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: Colors.light.borderLight,
    gap: 12,
  },
  ticketLeft: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: Colors.light.primary + "12",
    alignItems: "center",
    justifyContent: "center",
  },
  ticketInfo: {
    flex: 1,
  },
  ticketTitle: {
    fontSize: 14,
    fontFamily: "Poppins_600SemiBold",
    color: Colors.light.text,
  },
  ticketMeta: {
    fontSize: 12,
    fontFamily: "Poppins_400Regular",
    color: Colors.light.textSecondary,
    marginTop: 2,
  },
  ticketDate: {
    fontSize: 11,
    fontFamily: "Poppins_500Medium",
    color: Colors.light.primary,
    marginTop: 2,
  },
  ticketStatus: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  ticketStatusText: {
    fontSize: 10,
    fontFamily: "Poppins_600SemiBold",
    textTransform: "capitalize" as const,
  },
  communityCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.light.surface,
    padding: 14,
    borderRadius: 16,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: Colors.light.borderLight,
    gap: 12,
  },
  communityAvatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: Colors.light.secondary + "15",
    alignItems: "center",
    justifyContent: "center",
  },
  communityAvatarText: {
    fontSize: 18,
    fontFamily: "Poppins_700Bold",
    color: Colors.light.secondary,
  },
  communityInfo: {
    flex: 1,
  },
  communityName: {
    fontSize: 14,
    fontFamily: "Poppins_600SemiBold",
    color: Colors.light.text,
  },
  communityMeta: {
    fontSize: 12,
    fontFamily: "Poppins_400Regular",
    color: Colors.light.textSecondary,
    marginTop: 2,
  },
  menuSection: {
    marginTop: 24,
    paddingHorizontal: 20,
  },
  menuTitle: {
    fontSize: 18,
    fontFamily: "Poppins_700Bold",
    color: Colors.light.text,
    marginBottom: 12,
  },
  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 14,
    gap: 12,
  },
  menuItemBorder: {
    borderBottomWidth: 1,
    borderBottomColor: Colors.light.borderLight,
  },
  menuLabel: {
    flex: 1,
    fontSize: 15,
    fontFamily: "Poppins_500Medium",
    color: Colors.light.text,
  },
  logoutBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingVertical: 16,
    marginTop: 8,
    borderTopWidth: 1,
    borderTopColor: Colors.light.borderLight,
  },
  logoutText: {
    fontSize: 15,
    fontFamily: "Poppins_600SemiBold",
    color: Colors.light.error,
  },
});
