import React, { useCallback } from "react";
import {
  View,
  Text,
  ScrollView,
  Pressable,
  StyleSheet,
  Platform,
  Linking,
  ActivityIndicator,
  Share,
  Alert,
} from "react-native";
import { useLocalSearchParams, router, useNavigation } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Image } from "expo-image";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useQuery } from "@tanstack/react-query";
import Colors from "@/constants/colors";
import SocialLinksBar from "@/components/SocialLinksBar";
import type { Venue, Event } from "@/lib/data";

const VENUE_TYPE_ICONS: Record<string, string> = {
  "Community Hall": "home",
  "Convention Centre": "business",
  "Temple": "moon",
  "Theatre": "film",
  "Stadium": "football",
  "Outdoor Park": "leaf",
  "Function Centre": "wine",
  "Church": "heart",
  "Mosque": "moon",
};

export default function VenueDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const insets = useSafeAreaInsets();
  const navigation = useNavigation();
  const isWeb = Platform.OS === "web";

  const goBack = useCallback(() => {
    if (navigation.canGoBack()) {
      router.back();
    } else {
      router.replace("/");
    }
  }, [navigation]);

  const { data: venue, isLoading } = useQuery<Venue>({
    queryKey: ["/api/venues", id],
  });

  const { data: venueEvents } = useQuery<Event[]>({
    queryKey: ["/api/venues", id, "events"],
  });

  const handleShare = useCallback(async () => {
    try {
      const url = `https://${process.env.EXPO_PUBLIC_DOMAIN}/venue/${id}`;
      if (Platform.OS === "web") {
        if (typeof navigator !== "undefined" && navigator.share) {
          await navigator.share({ title: venue?.name ?? "", url });
        } else if (typeof navigator !== "undefined" && navigator.clipboard) {
          await navigator.clipboard.writeText(url);
          Alert.alert("Link Copied", "Link copied to clipboard");
        }
      } else {
        await Share.share({ message: `Check out ${venue?.name} on CulturePass! ${url}` });
      }
    } catch {}
  }, [id, venue]);

  const openDirections = useCallback(() => {
    if (!venue) return;
    const url = Platform.select({
      ios: `maps:0,0?q=${encodeURIComponent(venue.address)}`,
      android: `geo:0,0?q=${encodeURIComponent(venue.address)}`,
      default: `https://maps.google.com/?q=${encodeURIComponent(venue.address)}`,
    });
    Linking.openURL(url);
  }, [venue]);

  if (isLoading) {
    return (
      <View style={[styles.container, { paddingTop: insets.top }]}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={Colors.light.primary} />
        </View>
      </View>
    );
  }

  if (!venue) {
    return (
      <View style={[styles.container, { paddingTop: insets.top }]}>
        <View style={styles.loadingContainer}>
          <Text style={styles.errorText}>Venue not found</Text>
          <Pressable onPress={goBack} style={styles.backLink}>
            <Text style={styles.backLinkText}>Go Back</Text>
          </Pressable>
        </View>
      </View>
    );
  }

  const heroImage = venue.images?.[0] || "https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800";
  const amenities: string[] = Array.isArray(venue.amenities) ? venue.amenities : [];
  const venueIcon = VENUE_TYPE_ICONS[venue.venueType] || "location";

  return (
    <View style={styles.container}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: insets.bottom + 100 }}
      >
        <View style={styles.heroContainer}>
          <Image source={{ uri: heroImage }} style={styles.heroImage} contentFit="cover" />
          <LinearGradient
            colors={["rgba(0,0,0,0.5)", "transparent", "rgba(0,0,0,0.7)"]}
            locations={[0, 0.4, 1]}
            style={styles.heroGradient}
          />
          <View style={[styles.heroTopBar, { top: insets.top + 8 }]}>
            <Pressable onPress={goBack} style={styles.heroBtn}>
              <Ionicons name="arrow-back" size={22} color="#fff" />
            </Pressable>
            <View style={{ flexDirection: "row", gap: 10 }}>
              <Pressable onPress={handleShare} style={styles.heroBtn}>
                <Ionicons name="share-outline" size={22} color="#fff" />
              </Pressable>
              <Pressable onPress={openDirections} style={styles.heroBtn}>
                <Ionicons name="navigate" size={22} color="#fff" />
              </Pressable>
            </View>
          </View>
          <View style={styles.heroInfo}>
            <View style={styles.typeBadge}>
              <Ionicons name={venueIcon as any} size={14} color="#fff" />
              <Text style={styles.typeBadgeText}>{venue.venueType}</Text>
            </View>
            <Text style={styles.heroTitle}>{venue.name}</Text>
            <View style={styles.heroLocationRow}>
              <Ionicons name="location-outline" size={16} color="rgba(255,255,255,0.85)" />
              <Text style={styles.heroLocation}>{venue.city}, {venue.state}</Text>
            </View>
          </View>
        </View>

        <View style={[styles.content, isWeb && { paddingTop: 0 }]}>
          <View style={styles.statsRow}>
            {venue.capacity && (
              <View style={styles.statCard}>
                <Ionicons name="people" size={22} color={Colors.light.secondary} />
                <Text style={styles.statValue}>{venue.capacity.toLocaleString()}</Text>
                <Text style={styles.statLabel}>Capacity</Text>
              </View>
            )}
            <View style={styles.statCard}>
              <Ionicons name="calendar" size={22} color={Colors.light.primary} />
              <Text style={styles.statValue}>{venueEvents?.length || 0}</Text>
              <Text style={styles.statLabel}>Events</Text>
            </View>
            <View style={styles.statCard}>
              <Ionicons name="globe-outline" size={22} color={Colors.light.accent} />
              <Text style={styles.statValue}>{venue.country === "New Zealand" ? "NZ" : "AU"}</Text>
              <Text style={styles.statLabel}>Country</Text>
            </View>
          </View>

          <View style={styles.addressCard}>
            <Ionicons name="location" size={20} color={Colors.light.primary} />
            <View style={{ flex: 1 }}>
              <Text style={styles.addressText}>{venue.address}</Text>
            </View>
            <Pressable onPress={openDirections} style={styles.directionsBtn}>
              <Ionicons name="navigate" size={18} color="#fff" />
              <Text style={styles.directionsBtnText}>Directions</Text>
            </Pressable>
          </View>

          {venue.description && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>About</Text>
              <Text style={styles.descriptionText}>{venue.description}</Text>
            </View>
          )}

          {amenities.length > 0 && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Amenities</Text>
              <View style={styles.amenitiesGrid}>
                {amenities.map((amenity, idx) => (
                  <View key={idx} style={styles.amenityChip}>
                    <Ionicons name="checkmark-circle" size={16} color={Colors.light.success} />
                    <Text style={styles.amenityText}>{amenity}</Text>
                  </View>
                ))}
              </View>
            </View>
          )}

          {(venue.contact || venue.phone || venue.website) && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Contact</Text>
              {venue.contact && (
                <Pressable
                  style={styles.contactRow}
                  onPress={() => Linking.openURL(`mailto:${venue.contact}`)}
                >
                  <Ionicons name="mail-outline" size={20} color={Colors.light.secondary} />
                  <Text style={styles.contactText}>{venue.contact}</Text>
                </Pressable>
              )}
              {venue.phone && (
                <Pressable
                  style={styles.contactRow}
                  onPress={() => Linking.openURL(`tel:${venue.phone}`)}
                >
                  <Ionicons name="call-outline" size={20} color={Colors.light.secondary} />
                  <Text style={styles.contactText}>{venue.phone}</Text>
                </Pressable>
              )}
              {venue.website && (
                <Pressable
                  style={styles.contactRow}
                  onPress={() => Linking.openURL(venue.website!)}
                >
                  <Ionicons name="globe-outline" size={20} color={Colors.light.secondary} />
                  <Text style={styles.contactText}>{venue.website}</Text>
                </Pressable>
              )}
            </View>
          )}

          {(venue.socialLinks && Object.values(venue.socialLinks).some(Boolean)) && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Follow Us</Text>
              <SocialLinksBar socialLinks={venue.socialLinks} website={venue.website} />
            </View>
          )}

          {venueEvents && venueEvents.length > 0 && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Upcoming Events</Text>
              {venueEvents.map((event) => (
                <Pressable
                  key={event.id}
                  style={styles.eventCard}
                  onPress={() => router.push(`/event/${event.id}`)}
                >
                  <Image
                    source={{ uri: event.imageUrl || "https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=400" }}
                    style={styles.eventImage}
                    contentFit="cover"
                  />
                  <View style={styles.eventInfo}>
                    <Text style={styles.eventTitle} numberOfLines={2}>{event.title}</Text>
                    <View style={styles.eventMeta}>
                      <Ionicons name="calendar-outline" size={13} color={Colors.light.textSecondary} />
                      <Text style={styles.eventMetaText}>{event.date}</Text>
                    </View>
                    <View style={styles.eventMeta}>
                      <Ionicons name="time-outline" size={13} color={Colors.light.textSecondary} />
                      <Text style={styles.eventMetaText}>{event.time}</Text>
                    </View>
                    <Text style={styles.eventPrice}>
                      {event.price > 0 ? `$${event.price}` : "Free"}
                    </Text>
                  </View>
                  <Ionicons name="chevron-forward" size={20} color={Colors.light.textTertiary} />
                </Pressable>
              ))}
            </View>
          )}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.light.background },
  loadingContainer: { flex: 1, justifyContent: "center", alignItems: "center" },
  errorText: { fontFamily: "Poppins_500Medium", fontSize: 16, color: Colors.light.textSecondary },
  backLink: { marginTop: 12, padding: 12 },
  backLinkText: { fontFamily: "Poppins_600SemiBold", fontSize: 14, color: Colors.light.primary },

  heroContainer: { height: 320, position: "relative" },
  heroImage: { width: "100%", height: "100%" },
  heroGradient: { ...StyleSheet.absoluteFillObject },
  heroTopBar: {
    position: "absolute",
    left: 16,
    right: 16,
    flexDirection: "row",
    justifyContent: "space-between",
  },
  heroBtn: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: "rgba(0,0,0,0.35)",
    justifyContent: "center",
    alignItems: "center",
  },
  heroInfo: {
    position: "absolute",
    bottom: 20,
    left: 16,
    right: 16,
  },
  typeBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(26,83,92,0.8)",
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 16,
    gap: 6,
    alignSelf: "flex-start",
    marginBottom: 8,
  },
  typeBadgeText: {
    fontFamily: "Poppins_500Medium",
    fontSize: 12,
    color: "#fff",
  },
  heroTitle: {
    fontFamily: "Poppins_700Bold",
    fontSize: 26,
    color: "#fff",
    marginBottom: 4,
  },
  heroLocationRow: { flexDirection: "row", alignItems: "center", gap: 4 },
  heroLocation: {
    fontFamily: "Poppins_400Regular",
    fontSize: 14,
    color: "rgba(255,255,255,0.85)",
  },

  content: { padding: 16 },

  statsRow: {
    flexDirection: "row",
    gap: 10,
    marginBottom: 16,
  },
  statCard: {
    flex: 1,
    backgroundColor: Colors.light.surface,
    borderRadius: 14,
    padding: 14,
    alignItems: "center",
    borderWidth: 1,
    borderColor: Colors.light.borderLight,
  },
  statValue: {
    fontFamily: "Poppins_700Bold",
    fontSize: 20,
    color: Colors.light.text,
    marginTop: 6,
  },
  statLabel: {
    fontFamily: "Poppins_400Regular",
    fontSize: 12,
    color: Colors.light.textSecondary,
  },

  addressCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.light.surface,
    borderRadius: 14,
    padding: 14,
    gap: 12,
    borderWidth: 1,
    borderColor: Colors.light.borderLight,
    marginBottom: 20,
  },
  addressText: {
    fontFamily: "Poppins_400Regular",
    fontSize: 14,
    color: Colors.light.text,
    lineHeight: 20,
  },
  directionsBtn: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.light.secondary,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 10,
    gap: 6,
  },
  directionsBtnText: {
    fontFamily: "Poppins_600SemiBold",
    fontSize: 13,
    color: "#fff",
  },

  section: { marginBottom: 24 },
  sectionTitle: {
    fontFamily: "Poppins_700Bold",
    fontSize: 18,
    color: Colors.light.text,
    marginBottom: 12,
  },
  descriptionText: {
    fontFamily: "Poppins_400Regular",
    fontSize: 15,
    color: Colors.light.textSecondary,
    lineHeight: 24,
  },

  amenitiesGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  amenityChip: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.light.surfaceElevated,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
    gap: 6,
  },
  amenityText: {
    fontFamily: "Poppins_500Medium",
    fontSize: 13,
    color: Colors.light.text,
  },

  contactRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 10,
    gap: 12,
    borderBottomWidth: 1,
    borderBottomColor: Colors.light.borderLight,
  },
  contactText: {
    fontFamily: "Poppins_400Regular",
    fontSize: 14,
    color: Colors.light.secondary,
  },

  eventCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.light.surface,
    borderRadius: 14,
    padding: 12,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: Colors.light.borderLight,
    gap: 12,
  },
  eventImage: {
    width: 70,
    height: 70,
    borderRadius: 10,
  },
  eventInfo: { flex: 1 },
  eventTitle: {
    fontFamily: "Poppins_600SemiBold",
    fontSize: 14,
    color: Colors.light.text,
    marginBottom: 4,
  },
  eventMeta: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    marginBottom: 2,
  },
  eventMetaText: {
    fontFamily: "Poppins_400Regular",
    fontSize: 12,
    color: Colors.light.textSecondary,
  },
  eventPrice: {
    fontFamily: "Poppins_600SemiBold",
    fontSize: 13,
    color: Colors.light.primary,
    marginTop: 4,
  },
});
