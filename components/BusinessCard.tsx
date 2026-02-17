import React, { useCallback } from "react";
import { View, Text, Pressable, StyleSheet, Platform } from "react-native";
import { Image } from "expo-image";
import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { router } from "expo-router";
import Colors from "@/constants/colors";
import type { Business } from "@/lib/data";

interface BusinessCardProps {
  business: Business;
}

export default function BusinessCard({ business }: BusinessCardProps) {
  const handlePress = useCallback(() => {
    if (Platform.OS !== "web") Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.push({ pathname: "/business/[id]", params: { id: business.id } });
  }, [business.id]);

  const renderStars = (rating: number) => {
    const full = Math.floor(rating);
    const half = rating % 1 >= 0.5;
    const stars = [];
    for (let i = 0; i < full; i++) stars.push(<Ionicons key={`f${i}`} name="star" size={12} color={Colors.light.accent} />);
    if (half) stars.push(<Ionicons key="h" name="star-half" size={12} color={Colors.light.accent} />);
    return stars;
  };

  return (
    <Pressable
      onPress={handlePress}
      style={({ pressed }) => [
        styles.card,
        { opacity: pressed ? 0.9 : 1 },
      ]}
    >
      <Image source={{ uri: business.imageUrl }} style={styles.image} contentFit="cover" transition={200} />
      <View style={styles.content}>
        <View style={styles.catBadge}>
          <Text style={styles.catText}>{business.category}</Text>
        </View>
        <Text style={styles.name} numberOfLines={1}>{business.name}</Text>
        <View style={styles.locationRow}>
          <Ionicons name="location-outline" size={12} color={Colors.light.textSecondary} />
          <Text style={styles.location}>{business.city}, {business.state}</Text>
        </View>
        <View style={styles.ratingRow}>
          {renderStars(business.rating)}
          <Text style={styles.ratingText}>{business.rating}</Text>
        </View>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: "row",
    backgroundColor: Colors.light.surface,
    borderRadius: 16,
    overflow: "hidden",
    marginBottom: 12,
    borderWidth: 1,
    borderColor: Colors.light.borderLight,
  },
  image: {
    width: 90,
    height: 100,
  },
  content: {
    flex: 1,
    padding: 12,
    gap: 3,
  },
  catBadge: {
    alignSelf: "flex-start",
    backgroundColor: Colors.light.secondary + "15",
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
  },
  catText: {
    fontSize: 10,
    fontFamily: "Poppins_600SemiBold",
    color: Colors.light.secondary,
  },
  name: {
    fontSize: 15,
    fontFamily: "Poppins_600SemiBold",
    color: Colors.light.text,
  },
  locationRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  location: {
    fontSize: 12,
    fontFamily: "Poppins_400Regular",
    color: Colors.light.textSecondary,
  },
  ratingRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 2,
  },
  ratingText: {
    fontSize: 12,
    fontFamily: "Poppins_600SemiBold",
    color: Colors.light.text,
    marginLeft: 4,
  },
});
