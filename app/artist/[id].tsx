import React, { useMemo, useState, useCallback } from "react";
import {
  View,
  Text,
  ScrollView,
  Pressable,
  StyleSheet,
  Platform,
  ActivityIndicator,
  FlatList,
  Share,
  Alert,
  Linking,
} from "react-native";
import { useLocalSearchParams, router, useNavigation } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Image } from "expo-image";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useQuery } from "@tanstack/react-query";
import Colors from "@/constants/colors";
import SocialLinksBar from "@/components/SocialLinksBar";
import type { Artist, Event } from "@/lib/data";

type LocationTab = "local" | "state" | "country" | "world";

const TABS: { key: LocationTab; label: string; icon: keyof typeof Ionicons.glyphMap }[] = [
  { key: "local", label: "Local Area", icon: "navigate" },
  { key: "state", label: "State", icon: "map" },
  { key: "country", label: "Country", icon: "flag" },
  { key: "world", label: "Worldwide", icon: "globe" },
];

function EventRow({ event }: { event: Event }) {
  const formatDate = (dateStr: string) => {
    const d = new Date(dateStr + "T00:00:00");
    return d.toLocaleDateString("en-AU", { day: "numeric", month: "short", year: "numeric" });
  };

  return (
    <Pressable
      onPress={() => router.push({ pathname: "/event/[id]", params: { id: event.id } })}
      style={({ pressed }) => [
        eventStyles.card,
        { opacity: pressed ? 0.85 : 1 },
      ]}
    >
      <View style={eventStyles.dateBlock}>
        <Text style={eventStyles.dateDay}>
          {new Date(event.date + "T00:00:00").getDate()}
        </Text>
        <Text style={eventStyles.dateMonth}>
          {new Date(event.date + "T00:00:00").toLocaleDateString("en-AU", { month: "short" }).toUpperCase()}
        </Text>
      </View>
      <View style={eventStyles.info}>
        <Text style={eventStyles.title} numberOfLines={1}>{event.title}</Text>
        <View style={eventStyles.meta}>
          <Ionicons name="location-outline" size={12} color={Colors.light.textSecondary} />
          <Text style={eventStyles.metaText}>{event.venue}, {event.city}</Text>
        </View>
        <View style={eventStyles.meta}>
          <Ionicons name="time-outline" size={12} color={Colors.light.textSecondary} />
          <Text style={eventStyles.metaText}>{event.time}</Text>
        </View>
        <View style={eventStyles.bottom}>
          <Text style={eventStyles.price}>
            {event.price === 0 ? "Free" : `$${event.price} ${event.currency || "AUD"}`}
          </Text>
          {(event.ticketsAvailable! - event.ticketsSold!) < 30 && (event.ticketsAvailable! - event.ticketsSold!) > 0 && (
            <Text style={eventStyles.spotsLeft}>
              {event.ticketsAvailable! - event.ticketsSold!} left
            </Text>
          )}
        </View>
      </View>
      <View style={eventStyles.arrow}>
        <Ionicons name="chevron-forward" size={18} color={Colors.light.textTertiary} />
      </View>
    </Pressable>
  );
}

export default function ArtistDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const insets = useSafeAreaInsets();
  const navigation = useNavigation();
  const goBack = () => navigation.canGoBack() ? router.back() : router.replace("/");
  const [activeTab, setActiveTab] = useState<LocationTab>("local");

  const { data: artist, isLoading } = useQuery<Artist>({ queryKey: ['/api/artists', id] });
  const { data: artistEvents = [], isLoading: eventsLoading } = useQuery<Event[]>({
    queryKey: ['/api/artists', id, 'events'],
    enabled: !!artist,
  });

  const groupedEvents = useMemo(() => {
    if (!artist || artistEvents.length === 0) return { local: [], state: [], country: [], world: [] };

    const now = new Date().toISOString().split("T")[0];
    const upcoming = artistEvents.filter(e => e.date >= now);

    const local = upcoming.filter(e => e.city === artist.city);
    const state = upcoming.filter(e => e.state === artist.state && e.city !== artist.city);
    const country = upcoming.filter(e => (e.country || "Australia") === "Australia" && e.state !== artist.state);
    const world = upcoming.filter(e => (e.country || "Australia") !== "Australia");

    return { local, state, country, world };
  }, [artist, artistEvents]);

  const activeEvents = groupedEvents[activeTab];
  const totalUpcoming = groupedEvents.local.length + groupedEvents.state.length + groupedEvents.country.length + groupedEvents.world.length;

  const handleShare = useCallback(async () => {
    try {
      const url = `https://${process.env.EXPO_PUBLIC_DOMAIN}/artist/${id}`;
      if (Platform.OS === "web") {
        if (typeof navigator !== "undefined" && navigator.share) {
          await navigator.share({ title: artist?.name ?? "", url });
        } else if (typeof navigator !== "undefined" && navigator.clipboard) {
          await navigator.clipboard.writeText(url);
          Alert.alert("Link Copied", "Link copied to clipboard");
        }
      } else {
        await Share.share({ message: `Check out ${artist?.name} on CulturePass! ${url}` });
      }
    } catch {}
  }, [id, artist]);

  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" color={Colors.light.primary} />
      </View>
    );
  }

  if (!artist) {
    return (
      <View style={styles.notFound}>
        <Ionicons name="alert-circle" size={48} color={Colors.light.textTertiary} />
        <Text style={styles.notFoundText}>Artist not found</Text>
        <Pressable onPress={goBack}>
          <Text style={styles.backLink}>Go Back</Text>
        </Pressable>
      </View>
    );
  }

  const webTopInset = Platform.OS === "web" ? 67 : 0;

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={{ paddingBottom: 100 }}
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.imageContainer}>
        <Image source={{ uri: artist.imageUrl ?? undefined }} style={styles.heroImage} contentFit="cover" transition={300} />
        <LinearGradient
          colors={["rgba(0,0,0,0.3)", "transparent", "rgba(0,0,0,0.8)"]}
          style={StyleSheet.absoluteFill}
        />
        <Pressable
          onPress={goBack}
          style={[styles.backBtn, { top: insets.top + webTopInset + 8 }]}
        >
          <Ionicons name="arrow-back" size={22} color="#fff" />
        </Pressable>
        <Pressable
          onPress={handleShare}
          style={[styles.shareBtn, { top: insets.top + webTopInset + 8 }]}
        >
          <Ionicons name="share-outline" size={22} color="#fff" />
        </Pressable>
        {artist.featured && (
          <View style={styles.featuredBadge}>
            <Ionicons name="star" size={14} color={Colors.light.accent} />
            <Text style={styles.featuredText}>Featured Artist</Text>
          </View>
        )}
        <View style={styles.heroContent}>
          <Text style={styles.artistName}>{artist.name}</Text>
          <Text style={styles.artistGenre}>{artist.genre}</Text>
        </View>
      </View>

      <View style={styles.content}>
        <View style={styles.statsRow}>
          <View style={styles.statCard}>
            <Ionicons name="musical-notes" size={20} color={Colors.light.primary} />
            <Text style={styles.statValue}>{artist.performances ?? 0}</Text>
            <Text style={styles.statLabel}>Shows</Text>
          </View>
          <Pressable
            style={styles.statCard}
            onPress={() => {
              const q = encodeURIComponent(`${artist.city}, ${artist.state}, Australia`);
              const url = Platform.select({
                ios: `http://maps.apple.com/?q=${q}`,
                default: `https://www.google.com/maps/search/?api=1&query=${q}`,
              });
              Linking.openURL(url);
            }}
          >
            <Ionicons name="location" size={20} color={Colors.light.secondary} />
            <Text style={styles.statValue}>{artist.city}</Text>
            <Text style={styles.statLabel}>{artist.state}</Text>
          </Pressable>
        </View>

        <View style={styles.cpidRow}>
          <Ionicons name="shield-checkmark" size={14} color={Colors.light.secondary} />
          <Text style={styles.cpidText}>{artist.cpid}</Text>
        </View>

        <Text style={styles.sectionTitle}>About</Text>
        <Text style={styles.bio}>{artist.bio}</Text>
        <SocialLinksBar socialLinks={artist?.socialLinks} website={artist?.website} style={{ marginTop: 16 }} />

        <View style={styles.eventsHeader}>
          <Text style={styles.sectionTitle}>Upcoming Events</Text>
          {totalUpcoming > 0 && (
            <View style={styles.eventCountBadge}>
              <Text style={styles.eventCountText}>{totalUpcoming}</Text>
            </View>
          )}
        </View>

        {eventsLoading ? (
          <ActivityIndicator size="small" color={Colors.light.primary} style={{ marginTop: 12 }} />
        ) : totalUpcoming === 0 ? (
          <View style={styles.emptyEvents}>
            <Ionicons name="calendar-outline" size={32} color={Colors.light.textTertiary} />
            <Text style={styles.emptyEventsText}>No upcoming events scheduled</Text>
          </View>
        ) : (
          <>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.tabsContainer}
            >
              {TABS.map(tab => {
                const count = groupedEvents[tab.key].length;
                const isActive = activeTab === tab.key;
                return (
                  <Pressable
                    key={tab.key}
                    onPress={() => setActiveTab(tab.key)}
                    style={[
                      styles.tab,
                      isActive && styles.tabActive,
                    ]}
                  >
                    <Ionicons
                      name={tab.icon}
                      size={14}
                      color={isActive ? "#fff" : Colors.light.textSecondary}
                    />
                    <Text style={[styles.tabText, isActive && styles.tabTextActive]}>
                      {tab.label}
                    </Text>
                    {count > 0 && (
                      <View style={[styles.tabCount, isActive && styles.tabCountActive]}>
                        <Text style={[styles.tabCountText, isActive && styles.tabCountTextActive]}>
                          {count}
                        </Text>
                      </View>
                    )}
                  </Pressable>
                );
              })}
            </ScrollView>

            {activeEvents.length === 0 ? (
              <View style={styles.emptyTab}>
                <Text style={styles.emptyTabText}>
                  No events in this area yet
                </Text>
              </View>
            ) : (
              <View style={styles.eventsList}>
                {activeEvents.map(event => (
                  <EventRow key={event.id} event={event} />
                ))}
              </View>
            )}
          </>
        )}
      </View>
    </ScrollView>
  );
}

const eventStyles = StyleSheet.create({
  card: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.light.surface,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: Colors.light.borderLight,
    padding: 12,
    marginBottom: 10,
  },
  dateBlock: {
    width: 48,
    height: 52,
    borderRadius: 12,
    backgroundColor: Colors.light.primary + "12",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  dateDay: {
    fontSize: 18,
    fontFamily: "Poppins_700Bold",
    color: Colors.light.primary,
    lineHeight: 22,
  },
  dateMonth: {
    fontSize: 10,
    fontFamily: "Poppins_600SemiBold",
    color: Colors.light.primary,
    lineHeight: 12,
  },
  info: {
    flex: 1,
    gap: 2,
  },
  title: {
    fontSize: 14,
    fontFamily: "Poppins_600SemiBold",
    color: Colors.light.text,
  },
  meta: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  metaText: {
    fontSize: 11,
    fontFamily: "Poppins_400Regular",
    color: Colors.light.textSecondary,
  },
  bottom: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginTop: 2,
  },
  price: {
    fontSize: 13,
    fontFamily: "Poppins_700Bold",
    color: Colors.light.secondary,
  },
  spotsLeft: {
    fontSize: 10,
    fontFamily: "Poppins_600SemiBold",
    color: Colors.light.error,
  },
  arrow: {
    marginLeft: 8,
  },
});

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.light.background,
  },
  imageContainer: {
    height: 320,
  },
  heroImage: {
    width: "100%",
    height: "100%",
  },
  backBtn: {
    position: "absolute",
    left: 16,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(0,0,0,0.3)",
    alignItems: "center",
    justifyContent: "center",
  },
  shareBtn: {
    position: "absolute",
    right: 16,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(0,0,0,0.3)",
    alignItems: "center",
    justifyContent: "center",
  },
  featuredBadge: {
    position: "absolute",
    top: 16,
    right: 64,
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: "rgba(0,0,0,0.5)",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 14,
  },
  featuredText: {
    color: Colors.light.accent,
    fontSize: 12,
    fontFamily: "Poppins_600SemiBold",
  },
  heroContent: {
    position: "absolute",
    bottom: 20,
    left: 20,
    right: 20,
  },
  artistName: {
    fontSize: 28,
    fontFamily: "Poppins_700Bold",
    color: "#fff",
  },
  artistGenre: {
    fontSize: 16,
    fontFamily: "Poppins_500Medium",
    color: "rgba(255,255,255,0.8)",
    marginTop: 4,
  },
  content: {
    padding: 20,
  },
  statsRow: {
    flexDirection: "row",
    gap: 12,
  },
  statCard: {
    flex: 1,
    alignItems: "center",
    gap: 4,
    backgroundColor: Colors.light.surface,
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: Colors.light.borderLight,
  },
  statValue: {
    fontSize: 20,
    fontFamily: "Poppins_700Bold",
    color: Colors.light.text,
  },
  statLabel: {
    fontSize: 12,
    fontFamily: "Poppins_400Regular",
    color: Colors.light.textSecondary,
  },
  cpidRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginTop: 16,
    paddingVertical: 8,
    paddingHorizontal: 12,
    backgroundColor: Colors.light.secondary + "10",
    borderRadius: 10,
    alignSelf: "flex-start",
  },
  cpidText: {
    fontSize: 12,
    fontFamily: "Poppins_500Medium",
    color: Colors.light.secondary,
  },
  sectionTitle: {
    fontSize: 18,
    fontFamily: "Poppins_700Bold",
    color: Colors.light.text,
    marginTop: 24,
    marginBottom: 8,
  },
  bio: {
    fontSize: 14,
    fontFamily: "Poppins_400Regular",
    color: Colors.light.textSecondary,
    lineHeight: 24,
  },
  eventsHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  eventCountBadge: {
    backgroundColor: Colors.light.primary,
    borderRadius: 10,
    paddingHorizontal: 8,
    paddingVertical: 2,
    marginTop: 16,
  },
  eventCountText: {
    fontSize: 12,
    fontFamily: "Poppins_700Bold",
    color: "#fff",
  },
  tabsContainer: {
    gap: 8,
    paddingVertical: 4,
    marginBottom: 12,
  },
  tab: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: Colors.light.surfaceElevated,
    borderWidth: 1,
    borderColor: Colors.light.borderLight,
  },
  tabActive: {
    backgroundColor: Colors.light.secondary,
    borderColor: Colors.light.secondary,
  },
  tabText: {
    fontSize: 12,
    fontFamily: "Poppins_500Medium",
    color: Colors.light.textSecondary,
  },
  tabTextActive: {
    color: "#fff",
  },
  tabCount: {
    backgroundColor: Colors.light.border,
    borderRadius: 8,
    paddingHorizontal: 6,
    paddingVertical: 1,
  },
  tabCountActive: {
    backgroundColor: "rgba(255,255,255,0.25)",
  },
  tabCountText: {
    fontSize: 10,
    fontFamily: "Poppins_700Bold",
    color: Colors.light.textSecondary,
  },
  tabCountTextActive: {
    color: "#fff",
  },
  emptyEvents: {
    alignItems: "center",
    paddingVertical: 32,
    gap: 8,
  },
  emptyEventsText: {
    fontSize: 14,
    fontFamily: "Poppins_400Regular",
    color: Colors.light.textTertiary,
  },
  emptyTab: {
    alignItems: "center",
    paddingVertical: 24,
  },
  emptyTabText: {
    fontSize: 13,
    fontFamily: "Poppins_400Regular",
    color: Colors.light.textTertiary,
  },
  eventsList: {
    gap: 0,
  },
  notFound: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: 12,
  },
  notFoundText: {
    fontSize: 16,
    fontFamily: "Poppins_500Medium",
    color: Colors.light.textSecondary,
  },
  backLink: {
    fontSize: 14,
    fontFamily: "Poppins_600SemiBold",
    color: Colors.light.primary,
  },
});
