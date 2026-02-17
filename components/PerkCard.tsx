import React, { useState, useCallback } from "react";
import { View, Text, Pressable, StyleSheet, Platform } from "react-native";
import { Image } from "expo-image";
import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import Colors from "@/constants/colors";
import type { Perk } from "@/lib/data";

interface PerkCardProps {
  perk: Perk;
}

export default function PerkCard({ perk }: PerkCardProps) {
  const [showCode, setShowCode] = useState(false);

  const handleReveal = useCallback(() => {
    if (Platform.OS !== "web") Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    setShowCode(true);
  }, []);

  const formatDate = (dateStr: string) => {
    const d = new Date(dateStr + "T00:00:00");
    return d.toLocaleDateString("en-AU", { day: "numeric", month: "short", year: "numeric" });
  };

  return (
    <View style={styles.card}>
      <Image source={{ uri: perk.imageUrl }} style={styles.image} contentFit="cover" transition={200} />
      <View style={styles.discountBadge}>
        <Text style={styles.discountText}>{perk.discount}</Text>
      </View>
      <View style={styles.content}>
        <Text style={styles.title} numberOfLines={2}>{perk.title}</Text>
        <Text style={styles.business}>{perk.businessName}</Text>
        <Text style={styles.description} numberOfLines={2}>{perk.description}</Text>
        <View style={styles.footer}>
          <View style={styles.validRow}>
            <Ionicons name="time-outline" size={12} color={Colors.light.textTertiary} />
            <Text style={styles.validText}>Valid until {formatDate(perk.validUntil)}</Text>
          </View>
          {showCode ? (
            <View style={styles.codeBox}>
              <Text style={styles.codeText}>{perk.code}</Text>
            </View>
          ) : (
            <Pressable
              onPress={handleReveal}
              style={({ pressed }) => [
                styles.revealBtn,
                { opacity: pressed ? 0.8 : 1 },
              ]}
            >
              <Text style={styles.revealText}>Reveal Code</Text>
            </Pressable>
          )}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.light.surface,
    borderRadius: 16,
    overflow: "hidden",
    marginBottom: 16,
    borderWidth: 1,
    borderColor: Colors.light.borderLight,
  },
  image: {
    width: "100%",
    height: 140,
  },
  discountBadge: {
    position: "absolute",
    top: 12,
    right: 12,
    backgroundColor: Colors.light.primary,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  discountText: {
    color: "#fff",
    fontSize: 14,
    fontFamily: "Poppins_700Bold",
  },
  content: {
    padding: 16,
    gap: 4,
  },
  title: {
    fontSize: 16,
    fontFamily: "Poppins_700Bold",
    color: Colors.light.text,
  },
  business: {
    fontSize: 12,
    fontFamily: "Poppins_500Medium",
    color: Colors.light.primary,
  },
  description: {
    fontSize: 13,
    fontFamily: "Poppins_400Regular",
    color: Colors.light.textSecondary,
    lineHeight: 20,
    marginTop: 4,
  },
  footer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 8,
  },
  validRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  validText: {
    fontSize: 11,
    fontFamily: "Poppins_400Regular",
    color: Colors.light.textTertiary,
  },
  revealBtn: {
    backgroundColor: Colors.light.secondary,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 12,
  },
  revealText: {
    color: "#fff",
    fontSize: 12,
    fontFamily: "Poppins_600SemiBold",
  },
  codeBox: {
    backgroundColor: Colors.light.surfaceElevated,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.light.border,
    borderStyle: "dashed",
  },
  codeText: {
    fontSize: 14,
    fontFamily: "Poppins_700Bold",
    color: Colors.light.secondary,
    letterSpacing: 2,
  },
});
