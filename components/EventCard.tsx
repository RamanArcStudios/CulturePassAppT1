import React, { useCallback } from "react";
import {
  View,
  Text,
  Pressable,
  StyleSheet,
  Platform,
} from "react-native";
import { Image } from "expo-image";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import * as Haptics from "expo-haptics";
import { router } from "expo-router";
import Colors from "@/constants/colors";
import type { Event } from "@/lib/data";
import { CATEGORY_COLORS } from "@/lib/data";

interface EventCardProps {
  event: Event;
  variant?: "featured" | "compact" | "list";
  onSave?: (id: string) => void;
  isSaved?: boolean;
}

export default function EventCard({ event, variant = "compact", onSave, isSaved }: EventCardProps) {
  const handlePress = useCallback(() => {
    if (Platform.OS !== "web") Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.push({ pathname: "/event/[id]", params: { id: event.id } });
  }, [event.id]);

  const handleSave = useCallback(() => {
    if (Platform.OS !== "web") Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    onSave?.(event.id);
  }, [event.id, onSave]);

  const formatDate = (dateStr: string) => {
    const d = new Date(dateStr + "T00:00:00");
    return d.toLocaleDateString("en-AU", { day: "numeric", month: "short" });
  };

  const categoryColor = CATEGORY_COLORS[event.category] || Colors.light.primary;
  const spotsLeft = event.ticketsAvailable - event.ticketsSold;
  const almostSoldOut = spotsLeft < 20;

  if (variant === "featured") {
    return (
      <Pressable
        onPress={handlePress}
        style={({ pressed }) => [
          styles.featuredCard,
          { transform: [{ scale: pressed ? 0.98 : 1 }] },
        ]}
      >
        <Image
          source={{ uri: event.imageUrl }}
          style={styles.featuredImage}
          contentFit="cover"
          transition={300}
        />
        <LinearGradient
          colors={["transparent", "rgba(0,0,0,0.8)"]}
          style={styles.featuredGradient}
        />
        <View style={styles.featuredBadgeRow}>
          <View style={[styles.categoryBadge, { backgroundColor: categoryColor }]}>
            <Text style={styles.categoryBadgeText}>{event.category}</Text>
          </View>
          {event.trending && (
            <View style={[styles.categoryBadge, { backgroundColor: Colors.light.accent }]}>
              <Ionicons name="trending-up" size={12} color="#fff" />
              <Text style={styles.categoryBadgeText}> Trending</Text>
            </View>
          )}
        </View>
        {onSave && (
          <Pressable onPress={handleSave} style={styles.featuredSaveBtn}>
            <Ionicons
              name={isSaved ? "bookmark" : "bookmark-outline"}
              size={22}
              color="#fff"
            />
          </Pressable>
        )}
        <View style={styles.featuredContent}>
          <Text style={styles.featuredTitle} numberOfLines={2}>
            {event.title}
          </Text>
          <View style={styles.featuredMeta}>
            <View style={styles.metaItem}>
              <Ionicons name="calendar-outline" size={14} color="rgba(255,255,255,0.8)" />
              <Text style={styles.featuredMetaText}>{formatDate(event.date)}</Text>
            </View>
            <View style={styles.metaItem}>
              <Ionicons name="location-outline" size={14} color="rgba(255,255,255,0.8)" />
              <Text style={styles.featuredMetaText}>{event.city}</Text>
            </View>
            <View style={styles.metaItem}>
              <Text style={styles.featuredPrice}>${event.price}</Text>
            </View>
          </View>
        </View>
      </Pressable>
    );
  }

  if (variant === "list") {
    return (
      <Pressable
        onPress={handlePress}
        style={({ pressed }) => [
          styles.listCard,
          { opacity: pressed ? 0.9 : 1 },
        ]}
      >
        <Image
          source={{ uri: event.imageUrl }}
          style={styles.listImage}
          contentFit="cover"
          transition={200}
        />
        <View style={styles.listContent}>
          <View style={[styles.smallBadge, { backgroundColor: categoryColor + "20" }]}>
            <Text style={[styles.smallBadgeText, { color: categoryColor }]}>{event.category}</Text>
          </View>
          <Text style={styles.listTitle} numberOfLines={2}>{event.title}</Text>
          <View style={styles.listMeta}>
            <Ionicons name="calendar-outline" size={12} color={Colors.light.textSecondary} />
            <Text style={styles.listMetaText}>{formatDate(event.date)} {event.time}</Text>
          </View>
          <View style={styles.listMeta}>
            <Ionicons name="location-outline" size={12} color={Colors.light.textSecondary} />
            <Text style={styles.listMetaText}>{event.venue}, {event.city}</Text>
          </View>
          <View style={styles.listBottom}>
            <Text style={styles.listPrice}>${event.price} AUD</Text>
            {almostSoldOut && (
              <Text style={styles.almostSoldOut}>{spotsLeft} left</Text>
            )}
          </View>
        </View>
        {onSave && (
          <Pressable onPress={handleSave} style={styles.listSaveBtn}>
            <Ionicons
              name={isSaved ? "bookmark" : "bookmark-outline"}
              size={20}
              color={isSaved ? Colors.light.primary : Colors.light.textTertiary}
            />
          </Pressable>
        )}
      </Pressable>
    );
  }

  return (
    <Pressable
      onPress={handlePress}
      style={({ pressed }) => [
        styles.compactCard,
        { transform: [{ scale: pressed ? 0.97 : 1 }] },
      ]}
    >
      <Image
        source={{ uri: event.imageUrl }}
        style={styles.compactImage}
        contentFit="cover"
        transition={200}
      />
      <LinearGradient
        colors={["transparent", "rgba(0,0,0,0.7)"]}
        style={styles.compactGradient}
      />
      <View style={[styles.smallBadgeAbs, { backgroundColor: categoryColor }]}>
        <Text style={styles.categoryBadgeText}>{event.category}</Text>
      </View>
      <View style={styles.compactContent}>
        <Text style={styles.compactTitle} numberOfLines={2}>{event.title}</Text>
        <View style={styles.compactMeta}>
          <Text style={styles.compactDate}>{formatDate(event.date)}</Text>
          <Text style={styles.compactPrice}>${event.price}</Text>
        </View>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  featuredCard: {
    width: 320,
    height: 220,
    borderRadius: 20,
    overflow: "hidden",
    marginRight: 16,
    backgroundColor: Colors.light.surfaceElevated,
  },
  featuredImage: {
    width: "100%",
    height: "100%",
  },
  featuredGradient: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    height: "70%",
  },
  featuredBadgeRow: {
    position: "absolute",
    top: 12,
    left: 12,
    flexDirection: "row",
    gap: 6,
  },
  categoryBadge: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  categoryBadgeText: {
    color: "#fff",
    fontSize: 11,
    fontFamily: "Poppins_600SemiBold",
  },
  featuredSaveBtn: {
    position: "absolute",
    top: 12,
    right: 12,
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "rgba(0,0,0,0.3)",
    alignItems: "center",
    justifyContent: "center",
  },
  featuredContent: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    padding: 16,
  },
  featuredTitle: {
    color: "#fff",
    fontSize: 18,
    fontFamily: "Poppins_700Bold",
    marginBottom: 8,
  },
  featuredMeta: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
  },
  metaItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  featuredMetaText: {
    color: "rgba(255,255,255,0.8)",
    fontSize: 12,
    fontFamily: "Poppins_400Regular",
  },
  featuredPrice: {
    color: Colors.light.accentLight,
    fontSize: 14,
    fontFamily: "Poppins_700Bold",
  },
  compactCard: {
    width: 180,
    height: 200,
    borderRadius: 16,
    overflow: "hidden",
    marginRight: 12,
    backgroundColor: Colors.light.surfaceElevated,
  },
  compactImage: {
    width: "100%",
    height: "100%",
  },
  compactGradient: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    height: "60%",
  },
  smallBadgeAbs: {
    position: "absolute",
    top: 10,
    left: 10,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
  },
  compactContent: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    padding: 12,
  },
  compactTitle: {
    color: "#fff",
    fontSize: 14,
    fontFamily: "Poppins_600SemiBold",
    marginBottom: 4,
  },
  compactMeta: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  compactDate: {
    color: "rgba(255,255,255,0.7)",
    fontSize: 11,
    fontFamily: "Poppins_400Regular",
  },
  compactPrice: {
    color: Colors.light.accentLight,
    fontSize: 13,
    fontFamily: "Poppins_700Bold",
  },
  listCard: {
    flexDirection: "row",
    backgroundColor: Colors.light.surface,
    borderRadius: 16,
    overflow: "hidden",
    marginBottom: 12,
    borderWidth: 1,
    borderColor: Colors.light.borderLight,
  },
  listImage: {
    width: 110,
    height: 130,
  },
  listContent: {
    flex: 1,
    padding: 12,
    gap: 4,
  },
  smallBadge: {
    alignSelf: "flex-start",
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
    marginBottom: 2,
  },
  smallBadgeText: {
    fontSize: 10,
    fontFamily: "Poppins_600SemiBold",
  },
  listTitle: {
    fontSize: 14,
    fontFamily: "Poppins_600SemiBold",
    color: Colors.light.text,
    lineHeight: 20,
  },
  listMeta: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  listMetaText: {
    fontSize: 11,
    fontFamily: "Poppins_400Regular",
    color: Colors.light.textSecondary,
  },
  listBottom: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: 4,
  },
  listPrice: {
    fontSize: 14,
    fontFamily: "Poppins_700Bold",
    color: Colors.light.primary,
  },
  almostSoldOut: {
    fontSize: 11,
    fontFamily: "Poppins_600SemiBold",
    color: Colors.light.error,
  },
  listSaveBtn: {
    position: "absolute",
    top: 10,
    right: 10,
    width: 32,
    height: 32,
    alignItems: "center",
    justifyContent: "center",
  },
});
