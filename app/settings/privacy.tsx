import React, { useState, useCallback } from "react";
import {
  View,
  Text,
  Switch,
  StyleSheet,
  Platform,
  Pressable,
  ScrollView,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import * as Haptics from "expo-haptics";
import Colors from "@/constants/colors";

export default function PrivacySettingsScreen() {
  const insets = useSafeAreaInsets();
  const [settings, setSettings] = useState<Record<string, boolean>>({
    profileVisible: true,
    showCommunities: true,
    showSavedEvents: false,
    analyticsSharing: true,
    personalizedRecs: true,
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
        <Text style={styles.headerTitle}>Privacy</Text>
        <View style={{ width: 36 }} />
      </View>

      <ScrollView style={styles.scrollContent} showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 40 }}>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Profile Visibility</Text>
          <View style={styles.sectionCard}>
            <View style={styles.settingRow}>
              <View style={styles.settingIcon}>
                <Ionicons name="eye" size={18} color={Colors.light.secondary} />
              </View>
              <View style={styles.settingInfo}>
                <Text style={styles.settingLabel}>Public Profile</Text>
                <Text style={styles.settingDesc}>Allow other members to see your profile</Text>
              </View>
              <Switch
                value={settings.profileVisible}
                onValueChange={() => toggleSetting("profileVisible")}
                trackColor={{ false: "#ddd", true: Colors.light.secondary + "60" }}
                thumbColor={settings.profileVisible ? Colors.light.secondary : "#f4f4f4"}
              />
            </View>
            <View style={[styles.settingRow, styles.settingRowBorder]}>
              <View style={styles.settingIcon}>
                <Ionicons name="people" size={18} color={Colors.light.secondary} />
              </View>
              <View style={styles.settingInfo}>
                <Text style={styles.settingLabel}>Show Communities</Text>
                <Text style={styles.settingDesc}>Display communities you've joined on your profile</Text>
              </View>
              <Switch
                value={settings.showCommunities}
                onValueChange={() => toggleSetting("showCommunities")}
                trackColor={{ false: "#ddd", true: Colors.light.secondary + "60" }}
                thumbColor={settings.showCommunities ? Colors.light.secondary : "#f4f4f4"}
              />
            </View>
            <View style={styles.settingRow}>
              <View style={styles.settingIcon}>
                <Ionicons name="bookmark" size={18} color={Colors.light.secondary} />
              </View>
              <View style={styles.settingInfo}>
                <Text style={styles.settingLabel}>Show Saved Events</Text>
                <Text style={styles.settingDesc}>Let others see events you've saved</Text>
              </View>
              <Switch
                value={settings.showSavedEvents}
                onValueChange={() => toggleSetting("showSavedEvents")}
                trackColor={{ false: "#ddd", true: Colors.light.secondary + "60" }}
                thumbColor={settings.showSavedEvents ? Colors.light.secondary : "#f4f4f4"}
              />
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Data & Analytics</Text>
          <View style={styles.sectionCard}>
            <View style={[styles.settingRow, styles.settingRowBorder]}>
              <View style={styles.settingIcon}>
                <Ionicons name="analytics" size={18} color={Colors.light.accent} />
              </View>
              <View style={styles.settingInfo}>
                <Text style={styles.settingLabel}>Analytics Sharing</Text>
                <Text style={styles.settingDesc}>Help improve CulturePass by sharing usage data</Text>
              </View>
              <Switch
                value={settings.analyticsSharing}
                onValueChange={() => toggleSetting("analyticsSharing")}
                trackColor={{ false: "#ddd", true: Colors.light.accent + "60" }}
                thumbColor={settings.analyticsSharing ? Colors.light.accent : "#f4f4f4"}
              />
            </View>
            <View style={styles.settingRow}>
              <View style={styles.settingIcon}>
                <Ionicons name="bulb" size={18} color={Colors.light.accent} />
              </View>
              <View style={styles.settingInfo}>
                <Text style={styles.settingLabel}>Personalised Recommendations</Text>
                <Text style={styles.settingDesc}>Get event suggestions based on your activity</Text>
              </View>
              <Switch
                value={settings.personalizedRecs}
                onValueChange={() => toggleSetting("personalizedRecs")}
                trackColor={{ false: "#ddd", true: Colors.light.accent + "60" }}
                thumbColor={settings.personalizedRecs ? Colors.light.accent : "#f4f4f4"}
              />
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Account</Text>
          <View style={styles.sectionCard}>
            <Pressable style={styles.actionRow} onPress={() => {
              if (Platform.OS !== "web") Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
            }}>
              <View style={styles.settingIcon}>
                <Ionicons name="download" size={18} color={Colors.light.textSecondary} />
              </View>
              <View style={styles.settingInfo}>
                <Text style={styles.settingLabel}>Download My Data</Text>
                <Text style={styles.settingDesc}>Request a copy of your personal data</Text>
              </View>
              <Ionicons name="chevron-forward" size={18} color={Colors.light.textTertiary} />
            </Pressable>
            <Pressable style={[styles.actionRow, styles.settingRowBorder]} onPress={() => {
              if (Platform.OS !== "web") Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
            }}>
              <View style={[styles.settingIcon, { backgroundColor: Colors.light.error + "10" }]}>
                <Ionicons name="trash" size={18} color={Colors.light.error} />
              </View>
              <View style={styles.settingInfo}>
                <Text style={[styles.settingLabel, { color: Colors.light.error }]}>Delete Account</Text>
                <Text style={styles.settingDesc}>Permanently delete your account and data</Text>
              </View>
              <Ionicons name="chevron-forward" size={18} color={Colors.light.textTertiary} />
            </Pressable>
          </View>
        </View>
      </ScrollView>
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
  },
  section: {
    gap: 10,
    marginBottom: 24,
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
    borderTopWidth: 1,
    borderTopColor: Colors.light.borderLight,
  },
  settingIcon: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: Colors.light.secondary + "10",
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
  actionRow: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    gap: 12,
  },
});
