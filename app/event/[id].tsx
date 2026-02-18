import React, { useCallback } from "react";
import {
  View,
  Text,
  ScrollView,
  Pressable,
  StyleSheet,
  Platform,
  Alert,
  ActivityIndicator,
} from "react-native";
import { useLocalSearchParams, router } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Image } from "expo-image";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import * as Haptics from "expo-haptics";
import { useQuery } from "@tanstack/react-query";
import Colors from "@/constants/colors";
import { CATEGORY_COLORS, type Event } from "@/lib/data";
import { useAuth } from "@/lib/auth";
import { apiRequest, queryClient } from "@/lib/query-client";

export default function EventDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const insets = useSafeAreaInsets();
  const { user, isAuthenticated } = useAuth();

  const { data: event, isLoading } = useQuery<Event>({ queryKey: ['/api/events', id] });

  const savedEventIds: string[] = user?.savedEvents ?? [];
  const isSaved = savedEventIds.includes(id!);

  const handleSave = useCallback(async () => {
    if (!isAuthenticated) {
      router.push("/auth");
      return;
    }
    if (Platform.OS !== "web") Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    try {
      await apiRequest("POST", "/api/users/save-event", { eventId: id });
      queryClient.invalidateQueries({ queryKey: ["/api/auth/me"] });
    } catch {
      Alert.alert("Error", "Failed to save event");
    }
  }, [id, isAuthenticated]);

  const handleBook = useCallback(() => {
    if (!isAuthenticated) {
      router.push("/auth");
      return;
    }
    if (Platform.OS !== "web") Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    Alert.alert(
      "Book Tickets",
      `Confirm booking for ${event?.title}?`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Confirm",
          onPress: async () => {
            try {
              await apiRequest("POST", "/api/orders", {
                eventId: id,
                quantity: 1,
                totalPrice: event?.price || 0,
                status: "confirmed",
              });
              queryClient.invalidateQueries({ queryKey: ["/api/orders"] });
              Alert.alert("Success", "Ticket booked successfully!");
            } catch {
              Alert.alert("Error", "Failed to book ticket");
            }
          },
        },
      ]
    );
  }, [id, event, isAuthenticated]);

  if (isLoading) return <View style={{flex:1,justifyContent:'center',alignItems:'center'}}><ActivityIndicator size="large" color={Colors.light.primary} /></View>;

  if (!event) {
    return (
      <View style={styles.notFound}>
        <Ionicons name="alert-circle" size={48} color={Colors.light.textTertiary} />
        <Text style={styles.notFoundText}>Event not found</Text>
        <Pressable onPress={() => router.back()}>
          <Text style={styles.backLink}>Go Back</Text>
        </Pressable>
      </View>
    );
  }

  const categoryColor = CATEGORY_COLORS[event.category] || Colors.light.primary;
  const spotsLeft = (event.ticketsAvailable ?? 0) - (event.ticketsSold ?? 0);
  const soldPercent = event.ticketsAvailable ? Math.round(((event.ticketsSold ?? 0) / event.ticketsAvailable) * 100) : 0;
  const formatDate = (dateStr: string) => {
    const d = new Date(dateStr + "T00:00:00");
    return d.toLocaleDateString("en-AU", { weekday: "long", day: "numeric", month: "long", year: "numeric" });
  };

  const webTopInset = Platform.OS === "web" ? 67 : 0;

  return (
    <View style={styles.container}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 120 }}
      >
        <View style={styles.imageContainer}>
          <Image source={{ uri: event.imageUrl }} style={styles.heroImage} contentFit="cover" transition={300} />
          <LinearGradient
            colors={["rgba(0,0,0,0.4)", "transparent", "rgba(0,0,0,0.6)"]}
            style={StyleSheet.absoluteFill}
          />
          <Pressable
            onPress={() => router.back()}
            style={[styles.backBtn, { top: insets.top + webTopInset + 8 }]}
          >
            <Ionicons name="arrow-back" size={22} color="#fff" />
          </Pressable>
          <Pressable
            onPress={handleSave}
            style={[styles.saveBtn, { top: insets.top + webTopInset + 8 }]}
          >
            <Ionicons
              name={isSaved ? "bookmark" : "bookmark-outline"}
              size={22}
              color="#fff"
            />
          </Pressable>
          <View style={styles.heroOverlay}>
            <View style={[styles.categoryBadge, { backgroundColor: categoryColor }]}>
              <Text style={styles.categoryText}>{event.category}</Text>
            </View>
            {event.trending && (
              <View style={[styles.categoryBadge, { backgroundColor: Colors.light.accent }]}>
                <Ionicons name="trending-up" size={12} color="#fff" />
                <Text style={styles.categoryText}> Trending</Text>
              </View>
            )}
          </View>
        </View>

        <View style={styles.content}>
          <Text style={styles.title}>{event.title}</Text>
          <Text style={styles.orgName}>by {event.orgName}</Text>

          <View style={styles.infoCards}>
            <View style={styles.infoCard}>
              <View style={[styles.infoIconBox, { backgroundColor: Colors.light.primary + "15" }]}>
                <Ionicons name="calendar" size={20} color={Colors.light.primary} />
              </View>
              <View>
                <Text style={styles.infoLabel}>Date</Text>
                <Text style={styles.infoValue}>{formatDate(event.date)}</Text>
              </View>
            </View>

            <View style={styles.infoCard}>
              <View style={[styles.infoIconBox, { backgroundColor: Colors.light.secondary + "15" }]}>
                <Ionicons name="time" size={20} color={Colors.light.secondary} />
              </View>
              <View>
                <Text style={styles.infoLabel}>Time</Text>
                <Text style={styles.infoValue}>{event.time} - {event.endTime}</Text>
              </View>
            </View>

            <View style={styles.infoCard}>
              <View style={[styles.infoIconBox, { backgroundColor: Colors.light.accent + "15" }]}>
                <Ionicons name="location" size={20} color={Colors.light.accent} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.infoLabel}>Venue</Text>
                <Text style={styles.infoValue}>{event.venue}</Text>
                <Text style={styles.infoSub}>{event.city}, {event.state}</Text>
              </View>
            </View>
          </View>

          <View style={styles.ticketInfo}>
            <View style={styles.ticketHeader}>
              <Text style={styles.sectionTitle}>Availability</Text>
              <Text style={styles.spotsText}>
                {spotsLeft} spots left
              </Text>
            </View>
            <View style={styles.progressBar}>
              <View style={[styles.progressFill, { width: `${soldPercent}%` }]} />
            </View>
            <Text style={styles.soldText}>{soldPercent}% sold</Text>
          </View>

          <View style={styles.descSection}>
            <Text style={styles.sectionTitle}>About This Event</Text>
            <Text style={styles.description}>{event.description}</Text>
          </View>

          <View style={styles.cpidSection}>
            <Ionicons name="shield-checkmark" size={16} color={Colors.light.secondary} />
            <Text style={styles.cpidText}>CulturePass ID: {event.cpid}</Text>
          </View>
        </View>
      </ScrollView>

      <View style={[styles.bottomBar, { paddingBottom: insets.bottom + (Platform.OS === "web" ? 34 : 16) }]}>
        <View style={styles.priceContainer}>
          <Text style={styles.priceLabel}>Price</Text>
          <Text style={styles.priceValue}>${event.price} <Text style={styles.priceCurrency}>AUD</Text></Text>
        </View>
        <Pressable
          onPress={handleBook}
          style={({ pressed }) => [
            styles.bookBtn,
            { transform: [{ scale: pressed ? 0.97 : 1 }] },
          ]}
        >
          <LinearGradient
            colors={[Colors.light.primary, Colors.light.primaryDark]}
            style={styles.bookBtnGradient}
          >
            <Ionicons name="ticket" size={18} color="#fff" />
            <Text style={styles.bookBtnText}>Book Tickets</Text>
          </LinearGradient>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.light.background,
  },
  imageContainer: {
    height: 300,
    position: "relative",
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
  saveBtn: {
    position: "absolute",
    right: 16,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(0,0,0,0.3)",
    alignItems: "center",
    justifyContent: "center",
  },
  heroOverlay: {
    position: "absolute",
    bottom: 16,
    left: 16,
    flexDirection: "row",
    gap: 8,
  },
  categoryBadge: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 14,
  },
  categoryText: {
    color: "#fff",
    fontSize: 12,
    fontFamily: "Poppins_600SemiBold",
  },
  content: {
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontFamily: "Poppins_700Bold",
    color: Colors.light.text,
    lineHeight: 32,
  },
  orgName: {
    fontSize: 14,
    fontFamily: "Poppins_500Medium",
    color: Colors.light.primary,
    marginTop: 4,
  },
  infoCards: {
    marginTop: 20,
    gap: 12,
  },
  infoCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    backgroundColor: Colors.light.surface,
    padding: 14,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: Colors.light.borderLight,
  },
  infoIconBox: {
    width: 44,
    height: 44,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  infoLabel: {
    fontSize: 11,
    fontFamily: "Poppins_500Medium",
    color: Colors.light.textTertiary,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  infoValue: {
    fontSize: 14,
    fontFamily: "Poppins_600SemiBold",
    color: Colors.light.text,
  },
  infoSub: {
    fontSize: 12,
    fontFamily: "Poppins_400Regular",
    color: Colors.light.textSecondary,
  },
  ticketInfo: {
    marginTop: 24,
    backgroundColor: Colors.light.surface,
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: Colors.light.borderLight,
  },
  ticketHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
  },
  sectionTitle: {
    fontSize: 16,
    fontFamily: "Poppins_700Bold",
    color: Colors.light.text,
  },
  spotsText: {
    fontSize: 13,
    fontFamily: "Poppins_600SemiBold",
    color: Colors.light.error,
  },
  progressBar: {
    height: 6,
    backgroundColor: Colors.light.surfaceElevated,
    borderRadius: 3,
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    backgroundColor: Colors.light.primary,
    borderRadius: 3,
  },
  soldText: {
    fontSize: 11,
    fontFamily: "Poppins_500Medium",
    color: Colors.light.textSecondary,
    marginTop: 6,
  },
  descSection: {
    marginTop: 24,
  },
  description: {
    fontSize: 14,
    fontFamily: "Poppins_400Regular",
    color: Colors.light.textSecondary,
    lineHeight: 24,
    marginTop: 8,
  },
  cpidSection: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginTop: 20,
    paddingVertical: 10,
    paddingHorizontal: 14,
    backgroundColor: Colors.light.secondary + "10",
    borderRadius: 12,
  },
  cpidText: {
    fontSize: 12,
    fontFamily: "Poppins_500Medium",
    color: Colors.light.secondary,
  },
  bottomBar: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: "row",
    alignItems: "center",
    paddingTop: 16,
    paddingHorizontal: 20,
    backgroundColor: Colors.light.surface,
    borderTopWidth: 1,
    borderTopColor: Colors.light.borderLight,
  },
  priceContainer: {
    flex: 1,
  },
  priceLabel: {
    fontSize: 11,
    fontFamily: "Poppins_500Medium",
    color: Colors.light.textTertiary,
    textTransform: "uppercase",
  },
  priceValue: {
    fontSize: 22,
    fontFamily: "Poppins_700Bold",
    color: Colors.light.text,
  },
  priceCurrency: {
    fontSize: 14,
    fontFamily: "Poppins_400Regular",
    color: Colors.light.textSecondary,
  },
  bookBtn: {
    borderRadius: 16,
    overflow: "hidden",
  },
  bookBtnGradient: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingHorizontal: 28,
    paddingVertical: 16,
    borderRadius: 16,
  },
  bookBtnText: {
    color: "#fff",
    fontSize: 16,
    fontFamily: "Poppins_700Bold",
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
