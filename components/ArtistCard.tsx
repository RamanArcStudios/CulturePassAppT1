import React, { useCallback } from "react";
import { View, Text, Pressable, StyleSheet, Platform } from "react-native";
import { Image } from "expo-image";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import * as Haptics from "expo-haptics";
import { router } from "expo-router";
import Colors from "@/constants/colors";
import type { Artist } from "@/lib/data";

interface ArtistCardProps {
  artist: Artist;
  variant?: "card" | "list";
}

export default function ArtistCard({ artist, variant = "card" }: ArtistCardProps) {
  const handlePress = useCallback(() => {
    if (Platform.OS !== "web") Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.push({ pathname: "/artist/[id]", params: { id: artist.id } });
  }, [artist.id]);

  if (variant === "list") {
    return (
      <Pressable
        onPress={handlePress}
        style={({ pressed }) => [
          styles.listCard,
          { opacity: pressed ? 0.9 : 1 },
        ]}
      >
        <Image source={{ uri: artist.imageUrl }} style={styles.listImage} contentFit="cover" transition={200} />
        <View style={styles.listContent}>
          <Text style={styles.listName}>{artist.name}</Text>
          <Text style={styles.listGenre}>{artist.genre}</Text>
          <View style={styles.listMeta}>
            <Ionicons name="location-outline" size={12} color={Colors.light.textSecondary} />
            <Text style={styles.listMetaText}>{artist.city}, {artist.state}</Text>
          </View>
          <Text style={styles.listPerformances}>{artist.performances} performances</Text>
        </View>
        {artist.featured && (
          <View style={styles.featuredBadge}>
            <Ionicons name="star" size={10} color={Colors.light.accent} />
          </View>
        )}
      </Pressable>
    );
  }

  return (
    <Pressable
      onPress={handlePress}
      style={({ pressed }) => [
        styles.card,
        { transform: [{ scale: pressed ? 0.97 : 1 }] },
      ]}
    >
      <Image source={{ uri: artist.imageUrl }} style={styles.cardImage} contentFit="cover" transition={200} />
      <LinearGradient
        colors={["transparent", "rgba(0,0,0,0.75)"]}
        style={styles.gradient}
      />
      {artist.featured && (
        <View style={styles.starBadge}>
          <Ionicons name="star" size={12} color={Colors.light.accent} />
        </View>
      )}
      <View style={styles.cardContent}>
        <Text style={styles.cardName} numberOfLines={1}>{artist.name}</Text>
        <Text style={styles.cardGenre}>{artist.genre}</Text>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    width: 140,
    height: 180,
    borderRadius: 16,
    overflow: "hidden",
    marginRight: 12,
  },
  cardImage: {
    width: "100%",
    height: "100%",
  },
  gradient: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    height: "50%",
  },
  starBadge: {
    position: "absolute",
    top: 10,
    right: 10,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: "rgba(0,0,0,0.4)",
    alignItems: "center",
    justifyContent: "center",
  },
  cardContent: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    padding: 12,
  },
  cardName: {
    fontSize: 14,
    fontFamily: "Poppins_600SemiBold",
    color: "#fff",
  },
  cardGenre: {
    fontSize: 11,
    fontFamily: "Poppins_400Regular",
    color: "rgba(255,255,255,0.7)",
  },
  listCard: {
    flexDirection: "row",
    backgroundColor: Colors.light.surface,
    borderRadius: 16,
    overflow: "hidden",
    marginBottom: 12,
    borderWidth: 1,
    borderColor: Colors.light.borderLight,
    alignItems: "center",
  },
  listImage: {
    width: 70,
    height: 80,
  },
  listContent: {
    flex: 1,
    padding: 12,
    gap: 2,
  },
  listName: {
    fontSize: 15,
    fontFamily: "Poppins_600SemiBold",
    color: Colors.light.text,
  },
  listGenre: {
    fontSize: 12,
    fontFamily: "Poppins_500Medium",
    color: Colors.light.primary,
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
  listPerformances: {
    fontSize: 11,
    fontFamily: "Poppins_500Medium",
    color: Colors.light.secondary,
  },
  featuredBadge: {
    position: "absolute",
    top: 10,
    right: 12,
  },
});
