import React, { useState } from "react";
import {
  View,
  Text,
  ScrollView,
  Pressable,
  StyleSheet,
  Platform,
  ActivityIndicator,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { useQuery } from "@tanstack/react-query";
import Colors from "@/constants/colors";
import CommunityCard from "@/components/CommunityCard";
import BusinessCard from "@/components/BusinessCard";
import ArtistCard from "@/components/ArtistCard";
import SectionHeader from "@/components/SectionHeader";
import { type Organisation, type Business, type Artist } from "@/lib/data";

type TabKey = "organisations" | "businesses" | "artists";

const TABS: { key: TabKey; label: string; icon: string }[] = [
  { key: "organisations", label: "Organisations", icon: "people" },
  { key: "businesses", label: "Businesses", icon: "storefront" },
  { key: "artists", label: "Artists", icon: "color-palette" },
];

export default function CommunityScreen() {
  const insets = useSafeAreaInsets();
  const [activeTab, setActiveTab] = useState<TabKey>("organisations");
  const [bizFilter, setBizFilter] = useState<string | null>(null);
  const [bizCityFilter, setBizCityFilter] = useState<string | null>(null);

  const { data: organisations = [], isLoading: loadingOrgs } = useQuery<Organisation[]>({ queryKey: ['/api/organisations'] });
  const { data: businesses = [], isLoading: loadingBiz } = useQuery<Business[]>({ queryKey: ['/api/businesses'] });
  const { data: artists = [], isLoading: loadingArtists } = useQuery<Artist[]>({ queryKey: ['/api/artists'] });

  const bizCategories = [...new Set(businesses.map(b => b.category).filter(Boolean))];
  const bizCities = [...new Set(businesses.map(b => b.city).filter(Boolean))];
  const filteredBusinesses = businesses.filter(biz => {
    if (bizFilter && biz.category !== bizFilter) return false;
    if (bizCityFilter && biz.city !== bizCityFilter) return false;
    return true;
  });

  const webTopInset = Platform.OS === "web" ? 67 : 0;

  const isLoading = loadingOrgs || loadingBiz || loadingArtists;
  if (isLoading) return <View style={{flex:1,justifyContent:'center',alignItems:'center'}}><ActivityIndicator size="large" color={Colors.light.primary} /></View>;

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
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filterRow}>
            <Pressable
              style={[styles.filterChip, !bizFilter && styles.filterChipActive]}
              onPress={() => setBizFilter(null)}
            >
              <Text style={[styles.filterChipText, !bizFilter && styles.filterChipTextActive]}>All</Text>
            </Pressable>
            {bizCategories.map(cat => (
              <Pressable
                key={cat}
                style={[styles.filterChip, bizFilter === cat && styles.filterChipActive]}
                onPress={() => setBizFilter(bizFilter === cat ? null : cat)}
              >
                <Text style={[styles.filterChipText, bizFilter === cat && styles.filterChipTextActive]}>{cat}</Text>
              </Pressable>
            ))}
          </ScrollView>
          {bizCities.length > 1 && (
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filterRow}>
              <Pressable
                style={[styles.filterChip, styles.filterChipCity, !bizCityFilter && styles.filterChipCityActive]}
                onPress={() => setBizCityFilter(null)}
              >
                <Ionicons name="location" size={12} color={!bizCityFilter ? "#fff" : Colors.light.textSecondary} />
                <Text style={[styles.filterChipText, !bizCityFilter && styles.filterChipTextActive]}>All Cities</Text>
              </Pressable>
              {bizCities.map(city => (
                <Pressable
                  key={city}
                  style={[styles.filterChip, styles.filterChipCity, bizCityFilter === city && styles.filterChipCityActive]}
                  onPress={() => setBizCityFilter(bizCityFilter === city ? null : city)}
                >
                  <Ionicons name="location" size={12} color={bizCityFilter === city ? "#fff" : Colors.light.textSecondary} />
                  <Text style={[styles.filterChipText, bizCityFilter === city && styles.filterChipTextActive]}>{city}</Text>
                </Pressable>
              ))}
            </ScrollView>
          )}
          <Text style={styles.countText}>
            {filteredBusinesses.length} business{filteredBusinesses.length !== 1 ? "es" : ""}
          </Text>
          {filteredBusinesses.map(biz => (
            <BusinessCard key={biz.id} business={biz} />
          ))}
          {filteredBusinesses.length === 0 && (
            <View style={styles.emptyState}>
              <Ionicons name="search" size={36} color={Colors.light.textTertiary} />
              <Text style={styles.emptyText}>No businesses match your filters</Text>
            </View>
          )}
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
  filterRow: {
    gap: 8,
    paddingBottom: 10,
  },
  filterChip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 20,
    backgroundColor: Colors.light.surfaceElevated,
    borderWidth: 1,
    borderColor: Colors.light.borderLight,
  },
  filterChipActive: {
    backgroundColor: Colors.light.primary,
    borderColor: Colors.light.primary,
  },
  filterChipCity: {
    backgroundColor: Colors.light.surfaceElevated,
  },
  filterChipCityActive: {
    backgroundColor: Colors.light.secondary,
    borderColor: Colors.light.secondary,
  },
  filterChipText: {
    fontSize: 12,
    fontFamily: "Poppins_500Medium",
    color: Colors.light.textSecondary,
  },
  filterChipTextActive: {
    color: "#fff",
  },
  emptyState: {
    alignItems: "center",
    paddingVertical: 32,
    gap: 8,
  },
  emptyText: {
    fontSize: 14,
    fontFamily: "Poppins_400Regular",
    color: Colors.light.textTertiary,
  },
});
