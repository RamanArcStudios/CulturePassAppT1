import React, { useState } from "react";
import {
  View,
  Text,
  ScrollView,
  Pressable,
  StyleSheet,
  Platform,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import Colors from "@/constants/colors";
import CommunityCard from "@/components/CommunityCard";
import BusinessCard from "@/components/BusinessCard";
import ArtistCard from "@/components/ArtistCard";
import SectionHeader from "@/components/SectionHeader";
import { getOrganisations, getBusinesses, getArtists } from "@/lib/data";

type TabKey = "organisations" | "businesses" | "artists";

const TABS: { key: TabKey; label: string; icon: string }[] = [
  { key: "organisations", label: "Organisations", icon: "people" },
  { key: "businesses", label: "Businesses", icon: "storefront" },
  { key: "artists", label: "Artists", icon: "color-palette" },
];

export default function CommunityScreen() {
  const insets = useSafeAreaInsets();
  const [activeTab, setActiveTab] = useState<TabKey>("organisations");

  const organisations = getOrganisations();
  const businesses = getBusinesses();
  const artists = getArtists();

  const webTopInset = Platform.OS === "web" ? 67 : 0;

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={{ paddingBottom: 100 }}
      showsVerticalScrollIndicator={false}
    >
      <View style={[styles.header, { paddingTop: insets.top + webTopInset + 16 }]}>
        <Text style={styles.headerTitle}>Community</Text>
        <Text style={styles.headerSubtitle}>Connect with Malayalee communities across Australia</Text>
      </View>

      <View style={styles.tabRow}>
        {TABS.map(tab => {
          const isActive = activeTab === tab.key;
          return (
            <Pressable
              key={tab.key}
              onPress={() => {
                if (Platform.OS !== "web") Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                setActiveTab(tab.key);
              }}
              style={[styles.tab, isActive && styles.activeTab]}
            >
              <Ionicons
                name={tab.icon as any}
                size={18}
                color={isActive ? "#fff" : Colors.light.textSecondary}
              />
              <Text style={[styles.tabText, isActive && styles.activeTabText]}>
                {tab.label}
              </Text>
            </Pressable>
          );
        })}
      </View>

      {activeTab === "organisations" && (
        <View style={styles.listSection}>
          <Text style={styles.countText}>
            {organisations.length} organisations
          </Text>
          {organisations.map(org => (
            <CommunityCard key={org.id} org={org} variant="list" />
          ))}
        </View>
      )}

      {activeTab === "businesses" && (
        <View style={styles.listSection}>
          <Text style={styles.countText}>
            {businesses.length} businesses
          </Text>
          {businesses.map(biz => (
            <BusinessCard key={biz.id} business={biz} />
          ))}
        </View>
      )}

      {activeTab === "artists" && (
        <View style={styles.listSection}>
          <Text style={styles.countText}>
            {artists.length} artists
          </Text>
          {artists.map(artist => (
            <ArtistCard key={artist.id} artist={artist} variant="list" />
          ))}
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.light.background,
  },
  header: {
    paddingHorizontal: 20,
    paddingBottom: 16,
  },
  headerTitle: {
    fontSize: 28,
    fontFamily: "Poppins_700Bold",
    color: Colors.light.text,
  },
  headerSubtitle: {
    fontSize: 14,
    fontFamily: "Poppins_400Regular",
    color: Colors.light.textSecondary,
    marginTop: 2,
    lineHeight: 20,
  },
  tabRow: {
    flexDirection: "row",
    marginHorizontal: 20,
    gap: 8,
    marginBottom: 20,
  },
  tab: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    paddingVertical: 10,
    borderRadius: 14,
    backgroundColor: Colors.light.surfaceElevated,
    borderWidth: 1,
    borderColor: Colors.light.borderLight,
  },
  activeTab: {
    backgroundColor: Colors.light.secondary,
    borderColor: Colors.light.secondary,
  },
  tabText: {
    fontSize: 12,
    fontFamily: "Poppins_600SemiBold",
    color: Colors.light.textSecondary,
  },
  activeTabText: {
    color: "#fff",
  },
  listSection: {
    paddingHorizontal: 20,
  },
  countText: {
    fontSize: 13,
    fontFamily: "Poppins_500Medium",
    color: Colors.light.textSecondary,
    marginBottom: 12,
  },
});
