import React, { useCallback } from "react";
import { View, Text, Pressable, StyleSheet, Platform } from "react-native";
import { Image } from "expo-image";
import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { router } from "expo-router";
import Colors from "@/constants/colors";
import type { Organisation } from "@/lib/data";

interface CommunityCardProps {
  org: Organisation;
  variant?: "card" | "list";
}

export default function CommunityCard({ org, variant = "card" }: CommunityCardProps) {
  const handlePress = useCallback(() => {
    if (Platform.OS !== "web") Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.push({ pathname: "/community/[id]", params: { id: org.id } });
  }, [org.id]);

  if (variant === "list") {
    return (
      <Pressable
        onPress={handlePress}
        testID={`community-card-${org.id}`}
        style={({ pressed }) => [
          styles.listCard,
          { opacity: pressed ? 0.9 : 1 },
        ]}
      >
        <Image source={{ uri: org.imageUrl ?? undefined }} style={styles.listImage} contentFit="cover" transition={200} />
        <View style={styles.listContent} pointerEvents="none">
          <Text style={styles.listName} numberOfLines={1}>{org.name}</Text>
          <View style={styles.listMeta}>
            <Ionicons name="location-outline" size={12} color={Colors.light.textSecondary} />
            <Text style={styles.listMetaText}>{org.city}, {org.state}</Text>
          </View>
          <View style={styles.listMeta}>
            <Ionicons name="people-outline" size={12} color={Colors.light.textSecondary} />
            <Text style={styles.listMetaText}>{(org.memberCount ?? 0).toLocaleString()} members</Text>
          </View>
          <View style={styles.tagRow}>
            {(org.categories ?? []).slice(0, 3).map(c => (
              <View key={c} style={styles.tag}>
                <Text style={styles.tagText}>{c}</Text>
              </View>
            ))}
          </View>
        </View>
        <Ionicons name="chevron-forward" size={20} color={Colors.light.textTertiary} style={styles.chevron} />
      </Pressable>
    );
  }

  return (
    <Pressable
      onPress={handlePress}
      testID={`community-card-${org.id}`}
      style={({ pressed }) => [
        styles.card,
        { transform: [{ scale: pressed ? 0.97 : 1 }] },
      ]}
    >
      <Image source={{ uri: org.imageUrl ?? undefined }} style={styles.cardImage} contentFit="cover" transition={200} />
      <View style={styles.cardContent} pointerEvents="none">
        <Text style={styles.cardName} numberOfLines={2}>{org.name}</Text>
        <View style={styles.cardMeta}>
          <Ionicons name="location-outline" size={12} color={Colors.light.textSecondary} />
          <Text style={styles.cardCity}>{org.city}</Text>
        </View>
        <Text style={styles.cardMembers}>{(org.memberCount ?? 0).toLocaleString()} members</Text>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    width: 160,
    backgroundColor: Colors.light.surface,
    borderRadius: 16,
    overflow: "hidden",
    marginRight: 12,
    borderWidth: 1,
    borderColor: Colors.light.borderLight,
  },
  cardImage: {
    width: "100%",
    height: 100,
  },
  cardContent: {
    padding: 12,
    gap: 4,
  },
  cardName: {
    fontSize: 13,
    fontFamily: "Poppins_600SemiBold",
    color: Colors.light.text,
    lineHeight: 18,
  },
  cardMeta: {
    flexDirection: "row",
    alignItems: "center",
    gap: 3,
  },
  cardCity: {
    fontSize: 11,
    fontFamily: "Poppins_400Regular",
    color: Colors.light.textSecondary,
  },
  cardMembers: {
    fontSize: 11,
    fontFamily: "Poppins_500Medium",
    color: Colors.light.secondary,
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
    width: 80,
    height: 90,
  },
  listContent: {
    flex: 1,
    padding: 12,
    gap: 3,
  },
  listName: {
    fontSize: 15,
    fontFamily: "Poppins_600SemiBold",
    color: Colors.light.text,
  },
  listMeta: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  listMetaText: {
    fontSize: 12,
    fontFamily: "Poppins_400Regular",
    color: Colors.light.textSecondary,
  },
  tagRow: {
    flexDirection: "row",
    gap: 4,
    marginTop: 2,
  },
  tag: {
    backgroundColor: Colors.light.surfaceElevated,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
  },
  tagText: {
    fontSize: 10,
    fontFamily: "Poppins_500Medium",
    color: Colors.light.textSecondary,
  },
  chevron: {
    marginRight: 12,
  },
});
