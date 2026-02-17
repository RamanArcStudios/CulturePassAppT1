import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  ScrollView,
  Pressable,
  StyleSheet,
  Platform,
  Alert,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons, Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { LinearGradient } from "expo-linear-gradient";
import Colors from "@/constants/colors";
import EventCard from "@/components/EventCard";
import { getEvents, type Event } from "@/lib/data";
import { getSavedEventIds, toggleSaveEvent, getUserProfile, type UserProfile } from "@/lib/storage";

type ProfileTab = "saved" | "tickets" | "communities";

export default function ProfileScreen() {
  const insets = useSafeAreaInsets();
  const [activeTab, setActiveTab] = useState<ProfileTab>("saved");
  const [savedEventIds, setSavedEventIds] = useState<string[]>([]);
  const [profile, setProfile] = useState<any>(null);

  const allEvents = getEvents();

  useEffect(() => {
    getSavedEventIds().then(setSavedEventIds);
    getUserProfile().then(setProfile);
  }, []);

  const savedEvents = allEvents.filter(e => savedEventIds.includes(e.id));

  const handleUnsave = useCallback(async (id: string) => {
    if (Platform.OS !== "web") Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    await toggleSaveEvent(id);
    setSavedEventIds(prev => prev.filter(e => e !== id));
  }, []);

  const webTopInset = Platform.OS === "web" ? 67 : 0;

  const menuItems = [
    { icon: "person-outline", label: "Edit Profile", action: () => {} },
    { icon: "card-outline", label: "Payment Methods", action: () => {} },
    { icon: "notifications-outline", label: "Notifications", action: () => {} },
    { icon: "shield-checkmark-outline", label: "Privacy", action: () => {} },
    { icon: "help-circle-outline", label: "Help & Support", action: () => {} },
    { icon: "information-circle-outline", label: "About CulturePass", action: () => {} },
  ];

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={{ paddingBottom: 100 }}
      showsVerticalScrollIndicator={false}
    >
      <LinearGradient
        colors={[Colors.light.secondary, Colors.light.secondaryLight]}
        style={[styles.profileHeader, { paddingTop: insets.top + webTopInset + 20 }]}
      >
        <View style={styles.avatarContainer}>
          <View style={styles.avatar}>
            <Ionicons name="person" size={40} color="#fff" />
          </View>
          <Pressable style={styles.editAvatarBtn}>
            <Feather name="edit-2" size={14} color="#fff" />
          </Pressable>
        </View>
        <Text style={styles.profileName}>{profile?.name || "Guest User"}</Text>
        <Text style={styles.profileCpid}>{profile?.cpid || "CP-U-GUEST"}</Text>
        <View style={styles.statsRow}>
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>{savedEventIds.length}</Text>
            <Text style={styles.statLabel}>Saved</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>0</Text>
            <Text style={styles.statLabel}>Tickets</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>0</Text>
            <Text style={styles.statLabel}>Communities</Text>
          </View>
        </View>
      </LinearGradient>

      <View style={styles.tabRow}>
        {(["saved", "tickets", "communities"] as ProfileTab[]).map(tab => {
          const isActive = activeTab === tab;
          const labels: Record<ProfileTab, string> = {
            saved: "Saved Events",
            tickets: "My Tickets",
            communities: "My Communities",
          };
          return (
            <Pressable
              key={tab}
              onPress={() => {
                if (Platform.OS !== "web") Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                setActiveTab(tab);
              }}
              style={[styles.tab, isActive && styles.activeTab]}
            >
              <Text style={[styles.tabText, isActive && styles.activeTabText]}>
                {labels[tab]}
              </Text>
            </Pressable>
          );
        })}
      </View>

      {activeTab === "saved" && (
        <View style={styles.contentSection}>
          {savedEvents.length > 0 ? (
            savedEvents.map(event => (
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
              <Ionicons name="bookmark-outline" size={48} color={Colors.light.textTertiary} />
              <Text style={styles.emptyTitle}>No saved events</Text>
              <Text style={styles.emptyText}>Browse events and tap the bookmark icon to save them here</Text>
            </View>
          )}
        </View>
      )}

      {activeTab === "tickets" && (
        <View style={styles.contentSection}>
          <View style={styles.emptyState}>
            <Ionicons name="ticket-outline" size={48} color={Colors.light.textTertiary} />
            <Text style={styles.emptyTitle}>No tickets yet</Text>
            <Text style={styles.emptyText}>Your purchased event tickets will appear here</Text>
          </View>
        </View>
      )}

      {activeTab === "communities" && (
        <View style={styles.contentSection}>
          <View style={styles.emptyState}>
            <Ionicons name="people-outline" size={48} color={Colors.light.textTertiary} />
            <Text style={styles.emptyTitle}>No communities joined</Text>
            <Text style={styles.emptyText}>Join organisations to connect with your community</Text>
          </View>
        </View>
      )}

      <View style={styles.menuSection}>
        <Text style={styles.menuTitle}>Settings</Text>
        {menuItems.map((item, idx) => (
          <Pressable
            key={idx}
            onPress={item.action}
            style={({ pressed }) => [
              styles.menuItem,
              { opacity: pressed ? 0.7 : 1 },
              idx < menuItems.length - 1 && styles.menuItemBorder,
            ]}
          >
            <Ionicons name={item.icon as any} size={20} color={Colors.light.textSecondary} />
            <Text style={styles.menuLabel}>{item.label}</Text>
            <Ionicons name="chevron-forward" size={18} color={Colors.light.textTertiary} />
          </Pressable>
        ))}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.light.background,
  },
  profileHeader: {
    alignItems: "center",
    paddingBottom: 24,
    borderBottomLeftRadius: 28,
    borderBottomRightRadius: 28,
  },
  avatarContainer: {
    position: "relative",
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
  editAvatarBtn: {
    position: "absolute",
    bottom: 0,
    right: -4,
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: Colors.light.primary,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
    borderColor: Colors.light.secondary,
  },
  profileName: {
    fontSize: 22,
    fontFamily: "Poppins_700Bold",
    color: "#fff",
  },
  profileCpid: {
    fontSize: 12,
    fontFamily: "Poppins_400Regular",
    color: "rgba(255,255,255,0.7)",
    marginTop: 2,
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
});
