import React, { useState, useCallback } from "react";
import {
  View,
  Text,
  Switch,
  StyleSheet,
  Platform,
  Pressable,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import * as Haptics from "expo-haptics";
import Colors from "@/constants/colors";

interface NotifSetting {
  key: string;
  label: string;
  description: string;
  icon: string;
}

const SECTIONS: { title: string; items: NotifSetting[] }[] = [
  {
    title: "Events",
    items: [
      {
        key: "eventReminders",
        label: "Event Reminders",
        description: "Get notified before events you've saved or booked",
        icon: "calendar",
      },
      {
        key: "newEvents",
        label: "New Events",
        description: "Discover new events from communities you follow",
        icon: "sparkles",
      },
      {
        key: "ticketUpdates",
        label: "Ticket Updates",
        description: "Booking confirmations, changes, and cancellations",
        icon: "ticket",
      },
    ],
  },
  {
    title: "Community",
    items: [
      {
        key: "communityUpdates",
        label: "Community Updates",
        description: "News and announcements from your communities",
        icon: "people",
      },
      {
        key: "memberAlerts",
        label: "New Member Alerts",
        description: "When someone joins your community",
        icon: "person-add",
      },
    ],
  },
  {
    title: "Promotions",
    items: [
      {
        key: "perksAlerts",
        label: "Perks & Deals",
        description: "Exclusive member discounts and offers",
        icon: "pricetag",
      },
      {
        key: "weeklyDigest",
        label: "Weekly Digest",
        description: "A summary of what happened this week",
        icon: "newspaper",
      },
    ],
  },
];

export default function NotificationsSettingsScreen() {
  const insets = useSafeAreaInsets();
  const [settings, setSettings] = useState<Record<string, boolean>>({
    eventReminders: true,
    newEvents: true,
    ticketUpdates: true,
    communityUpdates: true,
    memberAlerts: false,
    perksAlerts: true,
    weeklyDigest: false,
  });

  const toggleSetting = useCallback((key: string) => {
    if (Platform.OS !== "web") Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setSettings((prev) => ({ ...prev, [key]: !prev[key] }));
  }, []);

  const webTopInset = Platform.OS === "web" ? 67 : 0;

  return (
    <View style={styles.container}>
      <View style={[styles.header, { paddingTop: insets.top + webTopInset + 12 }]}>
        <Pressable onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={22} color={Colors.light.text} />
        </Pressable>
        <Text style={styles.headerTitle}>Notifications</Text>
        <View style={{ width: 36 }} />
      </View>

      <View style={styles.scrollContent}>
        {SECTIONS.map((section) => (
          <View key={section.title} style={styles.section}>
            <Text style={styles.sectionTitle}>{section.title}</Text>
            <View style={styles.sectionCard}>
              {section.items.map((item, idx) => (
                <View
                  key={item.key}
                  style={[
                    styles.settingRow,
                    idx < section.items.length - 1 && styles.settingRowBorder,
                  ]}
                >
                  <View style={styles.settingIcon}>
                    <Ionicons name={item.icon as any} size={18} color={Colors.light.primary} />
                  </View>
                  <View style={styles.settingInfo}>
                    <Text style={styles.settingLabel}>{item.label}</Text>
                    <Text style={styles.settingDesc}>{item.description}</Text>
                  </View>
                  <Switch
                    value={settings[item.key]}
                    onValueChange={() => toggleSetting(item.key)}
                    trackColor={{ false: "#ddd", true: Colors.light.primary + "60" }}
                    thumbColor={settings[item.key] ? Colors.light.primary : "#f4f4f4"}
                  />
                </View>
              ))}
            </View>
          </View>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.light.background,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: Colors.light.borderLight,
  },
  backBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
  },
  headerTitle: {
    fontSize: 18,
    fontFamily: "Poppins_700Bold",
    color: Colors.light.text,
  },
  scrollContent: {
    padding: 20,
    gap: 24,
  },
  section: {
    gap: 10,
  },
  sectionTitle: {
    fontSize: 13,
    fontFamily: "Poppins_600SemiBold",
    color: Colors.light.textSecondary,
    textTransform: "uppercase",
    letterSpacing: 0.8,
    marginLeft: 4,
  },
  sectionCard: {
    backgroundColor: Colors.light.surface,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: Colors.light.borderLight,
    overflow: "hidden",
  },
  settingRow: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    gap: 12,
  },
  settingRowBorder: {
    borderBottomWidth: 1,
    borderBottomColor: Colors.light.borderLight,
  },
  settingIcon: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: Colors.light.primary + "10",
    alignItems: "center",
    justifyContent: "center",
  },
  settingInfo: {
    flex: 1,
  },
  settingLabel: {
    fontSize: 15,
    fontFamily: "Poppins_600SemiBold",
    color: Colors.light.text,
  },
  settingDesc: {
    fontSize: 12,
    fontFamily: "Poppins_400Regular",
    color: Colors.light.textSecondary,
    marginTop: 2,
    lineHeight: 16,
  },
});
