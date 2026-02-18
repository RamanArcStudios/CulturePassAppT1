import React, { useState, useCallback } from "react";
import {
  View,
  Text,
  ScrollView,
  FlatList,
  Pressable,
  TextInput,
  StyleSheet,
  Platform,
  RefreshControl,
  ActivityIndicator,
  Alert,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import * as Haptics from "expo-haptics";
import { useQuery } from "@tanstack/react-query";
import Colors from "@/constants/colors";
import EventCard from "@/components/EventCard";
import CategoryFilter from "@/components/CategoryFilter";
import SectionHeader from "@/components/SectionHeader";
import CommunityCard from "@/components/CommunityCard";
import ArtistCard from "@/components/ArtistCard";
import {
  type EventCategory,
  type Event,
  type Organisation,
  type Artist,
} from "@/lib/data";
import { useAuth } from "@/lib/auth";
import { apiRequest, queryClient } from "@/lib/query-client";

export default function DiscoverScreen() {
  const insets = useSafeAreaInsets();
  const { user, isAuthenticated } = useAuth();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<EventCategory | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  const { data: allEvents = [], isLoading: loadingEvents } = useQuery<Event[]>({ queryKey: ['/api/events'] });
  const { data: featuredEvents = [] } = useQuery<Event[]>({ queryKey: ['/api/events/featured'] });
  const { data: trendingEvents = [] } = useQuery<Event[]>({ queryKey: ['/api/events/trending'] });
  const { data: allOrganisations = [] } = useQuery<Organisation[]>({ queryKey: ['/api/organisations'] });
  const { data: featuredArtists = [] } = useQuery<Artist[]>({ queryKey: ['/api/artists/featured'] });

  const organisations = allOrganisations.slice(0, 5);

  const savedEventIds: string[] = user?.savedEvents ?? [];

  const handleSave = useCallback(async (id: string) => {
    if (!isAuthenticated) {
      router.push("/auth");
      return;
    }
    if (Platform.OS !== "web") Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    try {
      await apiRequest("POST", "/api/users/save-event", { eventId: id });
      queryClient.invalidateQueries({ queryKey: ["/api/auth/me"] });
    } catch (err: any) {
      Alert.alert("Error", "Failed to save event");
    }
  }, [isAuthenticated]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    queryClient.invalidateQueries().then(() => {
      setRefreshing(false);
    });
  }, []);

  const filteredEvents = allEvents.filter(e => {
    const matchesSearch = !searchQuery ||
      e.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      e.city.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = !selectedCategory || e.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const webTopInset = Platform.OS === "web" ? 67 : 0;

  if (loadingEvents) return <View style={{flex:1,justifyContent:'center',alignItems:'center'}}><ActivityIndicator size="large" color={Colors.light.primary} /></View>;

  return (
    <View style={styles.container}>
    <ScrollView
      style={{ flex: 1 }}
      contentContainerStyle={{ paddingBottom: 100 }}
      showsVerticalScrollIndicator={false}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={Colors.light.primary} />
      }
    >
      <LinearGradient
        colors={["#E2725B", "#D4A017"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={[styles.headerGradient, { paddingTop: insets.top + webTopInset + 16 }]}
      >
        <View style={styles.headerContent}>
          <View>
            <Text style={styles.greeting}>Discover</Text>
            <Text style={styles.subtitle}>Cultural events in Australia</Text>
          </View>
          <Pressable
            onPress={() => {
              if (Platform.OS !== "web") Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            }}
            style={styles.notifBtn}
          >
            <Ionicons name="notifications-outline" size={22} color="#fff" />
          </Pressable>
        </View>
        <View style={styles.searchContainer}>
          <Ionicons name="search" size={18} color={Colors.light.textTertiary} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search events, cities..."
            placeholderTextColor={Colors.light.textTertiary}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          {!!searchQuery && (
            <Pressable onPress={() => setSearchQuery("")}>
              <Ionicons name="close-circle" size={18} color={Colors.light.textTertiary} />
            </Pressable>
          )}
        </View>
      </LinearGradient>

      <View style={styles.categorySection}>
        <CategoryFilter selected={selectedCategory} onSelect={setSelectedCategory} />
      </View>

      {searchQuery || selectedCategory ? (
        <View style={styles.filteredSection}>
          <Text style={styles.resultsText}>
            {filteredEvents.length} event{filteredEvents.length !== 1 ? "s" : ""} found
          </Text>
          {filteredEvents.map(event => (
            <EventCard
              key={event.id}
              event={event}
              variant="list"
              onSave={handleSave}
              isSaved={savedEventIds.includes(event.id)}
            />
          ))}
          {filteredEvents.length === 0 && (
            <View style={styles.emptyState}>
              <Ionicons name="search" size={48} color={Colors.light.textTertiary} />
              <Text style={styles.emptyTitle}>No events found</Text>
              <Text style={styles.emptyText}>Try a different search or category</Text>
            </View>
          )}
        </View>
      ) : (
        <>
          <SectionHeader title="Featured Events" />
          <FlatList
            data={featuredEvents}
            keyExtractor={item => item.id}
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.horizontalList}
            renderItem={({ item }) => (
              <EventCard
                event={item}
                variant="featured"
                onSave={handleSave}
                isSaved={savedEventIds.includes(item.id)}
              />
            )}
            scrollEnabled={featuredEvents.length > 0}
          />

          <SectionHeader
            title="Trending Now"
            onSeeAll={() => router.push("/allevents")}
          />
          <FlatList
            data={trendingEvents}
            keyExtractor={item => item.id}
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.horizontalList}
            renderItem={({ item }) => (
              <EventCard event={item} variant="compact" />
            )}
            scrollEnabled={trendingEvents.length > 0}
          />

          <SectionHeader title="Communities" />
          <FlatList
            data={organisations}
            keyExtractor={item => item.id}
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.horizontalList}
            renderItem={({ item }) => (
              <CommunityCard org={item} variant="card" />
            )}
            scrollEnabled={organisations.length > 0}
          />

          <SectionHeader title="Featured Artists" />
          <FlatList
            data={featuredArtists}
            keyExtractor={item => item.id}
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.horizontalList}
            renderItem={({ item }) => (
              <ArtistCard artist={item} variant="card" />
            )}
            scrollEnabled={featuredArtists.length > 0}
          />

          <SectionHeader
            title="Upcoming Events"
            onSeeAll={() => router.push("/allevents")}
          />
          <View style={styles.upcomingList}>
            {allEvents.slice(0, 4).map(event => (
              <EventCard
                key={event.id}
                event={event}
                variant="list"
                onSave={handleSave}
                isSaved={savedEventIds.includes(event.id)}
              />
            ))}
          </View>
        </>
      )}
    </ScrollView>

    <Pressable
      style={styles.mapFab}
      onPress={() => {
        if (Platform.OS !== "web") Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
        router.push("/map");
      }}
    >
      <Ionicons name="map" size={22} color="#fff" />
    </Pressable>
  </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.light.background,
  },
  headerGradient: {
    paddingHorizontal: 20,
    paddingBottom: 24,
    borderBottomLeftRadius: 28,
    borderBottomRightRadius: 28,
  },
  headerContent: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 16,
  },
  greeting: {
    fontSize: 28,
    fontFamily: "Poppins_700Bold",
    color: "#fff",
  },
  subtitle: {
    fontSize: 14,
    fontFamily: "Poppins_400Regular",
    color: "rgba(255,255,255,0.8)",
    marginTop: 2,
  },
  notifBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(255,255,255,0.2)",
    alignItems: "center",
    justifyContent: "center",
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 10,
    gap: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    fontFamily: "Poppins_400Regular",
    color: Colors.light.text,
    padding: 0,
  },
  categorySection: {
    marginTop: 16,
  },
  horizontalList: {
    paddingHorizontal: 20,
  },
  filteredSection: {
    paddingHorizontal: 20,
    marginTop: 8,
  },
  resultsText: {
    fontSize: 13,
    fontFamily: "Poppins_500Medium",
    color: Colors.light.textSecondary,
    marginBottom: 12,
  },
  upcomingList: {
    paddingHorizontal: 20,
  },
  emptyState: {
    alignItems: "center",
    paddingVertical: 48,
    gap: 8,
  },
  emptyTitle: {
    fontSize: 18,
    fontFamily: "Poppins_600SemiBold",
    color: Colors.light.text,
  },
  emptyText: {
    fontSize: 14,
    fontFamily: "Poppins_400Regular",
    color: Colors.light.textSecondary,
  },
  mapFab: {
    position: "absolute",
    right: 20,
    bottom: Platform.OS === "web" ? 100 : 90,
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: Colors.light.secondary,
    justifyContent: "center" as const,
    alignItems: "center" as const,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 6,
    zIndex: 100,
  },
});
