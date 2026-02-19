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
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import * as Haptics from "expo-haptics";
import { useQuery } from "@tanstack/react-query";
import Colors from "@/constants/colors";
import SocialLinksBar from "@/components/SocialLinksBar";
import type { Business } from "@/lib/data";

export default function BusinessDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const insets = useSafeAreaInsets();
  const navigation = useNavigation();
  const goBack = () => navigation.canGoBack() ? router.back() : router.replace("/");

  const { data: business, isLoading } = useQuery<Business>({ queryKey: ['/api/businesses', id] });

  const handleShare = useCallback(async () => {
    try {
      const url = `https://${process.env.EXPO_PUBLIC_DOMAIN}/business/${id}`;
      if (Platform.OS === "web") {
        if (typeof navigator !== "undefined" && navigator.share) {
          await navigator.share({ title: business?.name ?? "", url });
        } else if (typeof navigator !== "undefined" && navigator.clipboard) {
          await navigator.clipboard.writeText(url);
          Alert.alert("Link Copied", "Link copied to clipboard");
        }
      } else {
        await Share.share({ message: `Check out ${business?.name} on CulturePass! ${url}` });
      }
    } catch {}
  }, [id, business]);

  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" color={Colors.light.primary} />
      </View>
    );
  }

  if (!business) {
    return (
      <View style={styles.notFound}>
        <Ionicons name="alert-circle" size={48} color={Colors.light.textTertiary} />
        <Text style={styles.notFoundText}>Business not found</Text>
        <Pressable onPress={goBack}>
          <Text style={styles.backLink}>Go Back</Text>
        </Pressable>
      </View>
    );
  }

  const renderStars = (rating: number) => {
    const full = Math.floor(rating);
    const half = rating % 1 >= 0.5;
    const stars = [];
    for (let i = 0; i < full; i++) stars.push(<Ionicons key={`f${i}`} name="star" size={18} color={Colors.light.accent} />);
    if (half) stars.push(<Ionicons key="h" name="star-half" size={18} color={Colors.light.accent} />);
    return stars;
  };

  const webTopInset = Platform.OS === "web" ? 67 : 0;

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={{ paddingBottom: 100 }}
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.imageContainer}>
        <Image source={{ uri: business.imageUrl ?? undefined }} style={styles.heroImage} contentFit="cover" transition={300} />
        <LinearGradient
          colors={["rgba(0,0,0,0.3)", "transparent", "rgba(0,0,0,0.6)"]}
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
      </View>

      <View style={styles.content}>
        <View style={styles.catBadge}>
          <Text style={styles.catText}>{business.category}</Text>
        </View>
        <Text style={styles.name}>{business.name}</Text>

        <View style={styles.ratingRow}>
          {renderStars(business.rating ?? 0)}
          <Text style={styles.ratingText}>{business.rating ?? 0}</Text>
        </View>

        <Pressable
          style={styles.infoRow}
          onPress={() => {
            if (business.lat && business.lng) {
              const url = Platform.select({
                ios: `http://maps.apple.com/?daddr=${business.lat},${business.lng}&q=${encodeURIComponent(business.name)}`,
                default: `https://www.google.com/maps/dir/?api=1&destination=${business.lat},${business.lng}`,
              });
              Linking.openURL(url);
            } else {
              const q = encodeURIComponent(`${business.name}, ${business.city}, ${business.state}`);
              Linking.openURL(`https://www.google.com/maps/search/?api=1&query=${q}`);
            }
          }}
        >
          <Ionicons name="location" size={16} color={Colors.light.primary} />
          <Text style={styles.infoText}>{business.city}, {business.state}</Text>
          <Ionicons name="navigate" size={14} color={Colors.light.primary} style={{ marginLeft: "auto" }} />
        </Pressable>

        <View style={styles.cpidRow}>
          <Ionicons name="shield-checkmark" size={14} color={Colors.light.secondary} />
          <Text style={styles.cpidText}>{business.cpid}</Text>
        </View>

        {business.abn ? (
          <View style={styles.abnRow}>
            <Ionicons name="document-text" size={14} color={Colors.light.accent} />
            <Text style={styles.abnLabel}>ABN:</Text>
            <Text style={styles.abnValue}>{business.abn}</Text>
          </View>
        ) : null}

        <Text style={styles.sectionTitle}>About</Text>
        <Text style={styles.description}>{business.description}</Text>

        <Text style={styles.sectionTitle}>Contact</Text>
        <View style={styles.contactCards}>
          <Pressable
            onPress={() => {
              if (Platform.OS !== "web") Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              if (business.phone) Linking.openURL(`tel:${business.phone}`);
            }}
            style={styles.contactCard}
          >
            <View style={[styles.contactIcon, { backgroundColor: Colors.light.primary + "15" }]}>
              <Ionicons name="call" size={20} color={Colors.light.primary} />
            </View>
            <Text style={styles.contactLabel}>Call</Text>
            <Text style={styles.contactValue}>{business.phone ?? "N/A"}</Text>
          </Pressable>
          <Pressable
            onPress={() => {
              if (Platform.OS !== "web") Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              if (business.website) Linking.openURL(`https://${business.website}`);
            }}
            style={styles.contactCard}
          >
            <View style={[styles.contactIcon, { backgroundColor: Colors.light.secondary + "15" }]}>
              <Ionicons name="globe" size={20} color={Colors.light.secondary} />
            </View>
            <Text style={styles.contactLabel}>Website</Text>
            <Text style={styles.contactValue} numberOfLines={1}>{business.website ?? "N/A"}</Text>
          </Pressable>
        </View>
        <SocialLinksBar socialLinks={business?.socialLinks} website={business?.website} style={{ marginTop: 16 }} />
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.light.background,
  },
  imageContainer: {
    height: 260,
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
  content: {
    padding: 20,
  },
  catBadge: {
    alignSelf: "flex-start",
    backgroundColor: Colors.light.secondary + "15",
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 12,
    marginBottom: 8,
  },
  catText: {
    fontSize: 12,
    fontFamily: "Poppins_600SemiBold",
    color: Colors.light.secondary,
  },
  name: {
    fontSize: 24,
    fontFamily: "Poppins_700Bold",
    color: Colors.light.text,
  },
  ratingRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    marginTop: 8,
  },
  ratingText: {
    fontSize: 16,
    fontFamily: "Poppins_700Bold",
    color: Colors.light.text,
    marginLeft: 4,
  },
  infoRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginTop: 12,
  },
  infoText: {
    fontSize: 14,
    fontFamily: "Poppins_500Medium",
    color: Colors.light.textSecondary,
  },
  cpidRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginTop: 12,
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
  abnRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginTop: 8,
    paddingVertical: 8,
    paddingHorizontal: 12,
    backgroundColor: Colors.light.accent + "15",
    borderRadius: 10,
    alignSelf: "flex-start",
  },
  abnLabel: {
    fontSize: 12,
    fontFamily: "Poppins_500Medium",
    color: Colors.light.accent,
  },
  abnValue: {
    fontSize: 12,
    fontFamily: "Poppins_700Bold",
    color: Colors.light.accent,
  },
  sectionTitle: {
    fontSize: 18,
    fontFamily: "Poppins_700Bold",
    color: Colors.light.text,
    marginTop: 24,
    marginBottom: 8,
  },
  description: {
    fontSize: 14,
    fontFamily: "Poppins_400Regular",
    color: Colors.light.textSecondary,
    lineHeight: 24,
  },
  contactCards: {
    flexDirection: "row",
    gap: 12,
  },
  contactCard: {
    flex: 1,
    alignItems: "center",
    gap: 6,
    backgroundColor: Colors.light.surface,
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: Colors.light.borderLight,
  },
  contactIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: "center",
    justifyContent: "center",
  },
  contactLabel: {
    fontSize: 14,
    fontFamily: "Poppins_600SemiBold",
    color: Colors.light.text,
  },
  contactValue: {
    fontSize: 11,
    fontFamily: "Poppins_400Regular",
    color: Colors.light.textSecondary,
    textAlign: "center",
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
