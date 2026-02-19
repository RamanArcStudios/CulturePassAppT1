import React, { useCallback, useState } from "react";
import {
  View,
  Text,
  ScrollView,
  Pressable,
  StyleSheet,
  Platform,
  Alert,
  Modal,
  ActivityIndicator,
  Linking,
  Share,
} from "react-native";
import { useLocalSearchParams, router, useNavigation } from "expo-router";
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
  const navigation = useNavigation();

  const goBack = useCallback(() => {
    if (navigation.canGoBack()) {
      router.back();
    } else {
      router.replace("/");
    }
  }, [navigation]);

  const { data: event, isLoading } = useQuery<Event>({ queryKey: ['/api/events', id] });

  const [showBookModal, setShowBookModal] = useState(false);
  const [bookingStatus, setBookingStatus] = useState<"idle" | "loading" | "success" | "error">("idle");

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

  const handleShare = useCallback(async () => {
    if (Platform.OS !== "web") Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    try {
      const shareUrl = `https://${process.env.EXPO_PUBLIC_DOMAIN}/event/${id}`;
      if (Platform.OS === "web") {
        if (typeof navigator !== "undefined" && navigator.share) {
          await navigator.share({ title: event?.title ?? "", text: event?.description ?? "", url: shareUrl });
        } else if (typeof navigator !== "undefined" && navigator.clipboard) {
          await navigator.clipboard.writeText(shareUrl);
          Alert.alert("Link Copied", "Event link copied to clipboard");
        }
      } else {
        await Share.share({ message: `Check out ${event?.title} on CulturePass! ${shareUrl}` });
      }
    } catch {}
  }, [id, event]);

  const handleBook = useCallback(() => {
    if (!isAuthenticated) {
      router.push("/auth");
      return;
    }
    if (Platform.OS !== "web") Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    setBookingStatus("idle");
    setShowBookModal(true);
  }, [isAuthenticated]);

  const confirmBooking = useCallback(async () => {
    setBookingStatus("loading");
    try {
      const res = await apiRequest("POST", "/api/checkout", {
        eventId: id,
        quantity: 1,
      });
      const data = await res.json();

      if (data.free) {
        queryClient.invalidateQueries({ queryKey: ["/api/orders"] });
        setBookingStatus("success");
      } else if (data.url) {
        queryClient.invalidateQueries({ queryKey: ["/api/orders"] });
        setBookingStatus("success");
        Linking.openURL(data.url);
      } else {
        setBookingStatus("error");
      }
    } catch {
      setBookingStatus("error");
    }
  }, [id, event]);

  if (isLoading) return <View style={{flex:1,justifyContent:'center',alignItems:'center'}}><ActivityIndicator size="large" color={Colors.light.primary} /></View>;

  if (!event) {
    return (
      <View style={styles.notFound}>
        <Ionicons name="alert-circle" size={48} color={Colors.light.textTertiary} />
        <Text style={styles.notFoundText}>Event not found</Text>
        <Pressable onPress={goBack}>
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
            onPress={goBack}
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
          <Pressable
            onPress={handleShare}
            style={[styles.shareBtn, { top: insets.top + webTopInset + 8 }]}
          >
            <Ionicons name="share-outline" size={22} color="#fff" />
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

            <Pressable 
              style={styles.infoCard}
              onPress={() => {
                if (event.lat && event.lng) {
                  const scheme = Platform.select({
                    ios: `http://maps.apple.com/?daddr=${event.lat},${event.lng}&q=${encodeURIComponent(event.venue)}`,
                    android: `https://www.google.com/maps/dir/?api=1&destination=${event.lat},${event.lng}`,
                    default: `https://www.google.com/maps/dir/?api=1&destination=${event.lat},${event.lng}`,
                  });
                  Linking.openURL(scheme);
                }
              }}
            >
              <View style={[styles.infoIconBox, { backgroundColor: Colors.light.accent + "15" }]}>
                <Ionicons name="location" size={20} color={Colors.light.accent} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.infoLabel}>Venue</Text>
                <Text style={styles.infoValue}>{event.venue}</Text>
                <Text style={styles.infoSub}>{event.city}, {event.state}</Text>
              </View>
              <Ionicons name="navigate" size={18} color={Colors.light.accent} />
            </Pressable>
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

      <Modal
        visible={showBookModal}
        transparent
        animationType="fade"
        onRequestClose={() => { setShowBookModal(false); setBookingStatus("idle"); }}
      >
        <Pressable
          style={styles.modalOverlay}
          onPress={() => { if (bookingStatus !== "loading") { setShowBookModal(false); setBookingStatus("idle"); } }}
        >
          <Pressable style={styles.modalContent} onPress={() => {}}>
            {bookingStatus === "success" ? (
              <>
                <View style={styles.modalIconCircle}>
                  <Ionicons name="checkmark-circle" size={48} color="#4CAF50" />
                </View>
                <Text style={styles.modalTitle}>Booking Confirmed!</Text>
                <Text style={styles.modalMessage}>Your ticket for {event.title} has been booked.</Text>
                <Pressable
                  onPress={() => { setShowBookModal(false); setBookingStatus("idle"); }}
                  style={({ pressed }) => [styles.modalConfirmBtn, { opacity: pressed ? 0.9 : 1 }]}
                >
                  <LinearGradient colors={[Colors.light.primary, Colors.light.primaryDark]} style={styles.modalBtnGradient}>
                    <Text style={styles.modalBtnText}>Done</Text>
                  </LinearGradient>
                </Pressable>
              </>
            ) : bookingStatus === "error" ? (
              <>
                <View style={styles.modalIconCircle}>
                  <Ionicons name="close-circle" size={48} color="#F44336" />
                </View>
                <Text style={styles.modalTitle}>Booking Failed</Text>
                <Text style={styles.modalMessage}>Something went wrong. Please try again.</Text>
                <View style={styles.modalBtnRow}>
                  <Pressable
                    onPress={() => { setShowBookModal(false); setBookingStatus("idle"); }}
                    style={({ pressed }) => [styles.modalCancelBtn, { opacity: pressed ? 0.8 : 1 }]}
                  >
                    <Text style={styles.modalCancelText}>Close</Text>
                  </Pressable>
                  <Pressable
                    onPress={confirmBooking}
                    style={({ pressed }) => [styles.modalConfirmBtn, { opacity: pressed ? 0.9 : 1 }]}
                  >
                    <LinearGradient colors={[Colors.light.primary, Colors.light.primaryDark]} style={styles.modalBtnGradient}>
                      <Text style={styles.modalBtnText}>Retry</Text>
                    </LinearGradient>
                  </Pressable>
                </View>
              </>
            ) : (
              <>
                <View style={styles.modalIconCircle}>
                  <Ionicons name="ticket" size={36} color={Colors.light.primary} />
                </View>
                <Text style={styles.modalTitle}>Book Tickets</Text>
                <Text style={styles.modalMessage}>Confirm booking for {event.title}?</Text>
                <View style={styles.modalPriceRow}>
                  <Text style={styles.modalPriceLabel}>Total</Text>
                  <Text style={styles.modalPriceValue}>${event.price} AUD</Text>
                </View>
                <View style={styles.modalBtnRow}>
                  <Pressable
                    onPress={() => { setShowBookModal(false); setBookingStatus("idle"); }}
                    style={({ pressed }) => [styles.modalCancelBtn, { opacity: pressed ? 0.8 : 1 }]}
                  >
                    <Text style={styles.modalCancelText}>Cancel</Text>
                  </Pressable>
                  <Pressable
                    onPress={confirmBooking}
                    disabled={bookingStatus === "loading"}
                    style={({ pressed }) => [styles.modalConfirmBtn, { opacity: pressed ? 0.9 : 1 }]}
                  >
                    <LinearGradient colors={[Colors.light.primary, Colors.light.primaryDark]} style={styles.modalBtnGradient}>
                      {bookingStatus === "loading" ? (
                        <ActivityIndicator size="small" color="#fff" />
                      ) : (
                        <Text style={styles.modalBtnText}>Confirm</Text>
                      )}
                    </LinearGradient>
                  </Pressable>
                </View>
              </>
            )}
          </Pressable>
        </Pressable>
      </Modal>
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
  shareBtn: {
    position: "absolute",
    right: 64,
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
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
  },
  modalContent: {
    backgroundColor: "#fff",
    borderRadius: 24,
    padding: 28,
    width: "100%",
    maxWidth: 360,
    alignItems: "center",
  },
  modalIconCircle: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: Colors.light.surfaceElevated,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: 20,
    fontFamily: "Poppins_700Bold",
    color: Colors.light.text,
    textAlign: "center",
    marginBottom: 8,
  },
  modalMessage: {
    fontSize: 14,
    fontFamily: "Poppins_400Regular",
    color: Colors.light.textSecondary,
    textAlign: "center",
    marginBottom: 20,
    lineHeight: 22,
  },
  modalPriceRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    width: "100%",
    backgroundColor: Colors.light.surfaceElevated,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginBottom: 20,
  },
  modalPriceLabel: {
    fontSize: 14,
    fontFamily: "Poppins_500Medium",
    color: Colors.light.textSecondary,
  },
  modalPriceValue: {
    fontSize: 18,
    fontFamily: "Poppins_700Bold",
    color: Colors.light.text,
  },
  modalBtnRow: {
    flexDirection: "row",
    gap: 12,
    width: "100%",
  },
  modalCancelBtn: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 14,
    backgroundColor: Colors.light.surfaceElevated,
    alignItems: "center",
  },
  modalCancelText: {
    fontSize: 15,
    fontFamily: "Poppins_600SemiBold",
    color: Colors.light.textSecondary,
  },
  modalConfirmBtn: {
    flex: 1,
    borderRadius: 14,
    overflow: "hidden",
  },
  modalBtnGradient: {
    paddingVertical: 14,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
  },
  modalBtnText: {
    fontSize: 15,
    fontFamily: "Poppins_700Bold",
    color: "#fff",
  },
});
