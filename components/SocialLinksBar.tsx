import React from "react";
import { View, Pressable, Linking, StyleSheet, ViewStyle } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import Colors from "@/constants/colors";
import type { SocialLinks } from "@/lib/data";

interface SocialLinksBarProps {
  socialLinks?: SocialLinks | null;
  website?: string | null;
  style?: ViewStyle;
}

const SOCIAL_ITEMS: {
  key: keyof SocialLinks;
  icon: keyof typeof Ionicons.glyphMap;
  color: string;
}[] = [
  { key: "facebook", icon: "logo-facebook", color: "#1877F2" },
  { key: "instagram", icon: "logo-instagram", color: "#E4405F" },
  { key: "twitter", icon: "logo-twitter", color: "#1DA1F2" },
  { key: "youtube", icon: "logo-youtube", color: "#FF0000" },
  { key: "tiktok", icon: "musical-notes", color: "#000000" },
  { key: "linkedin", icon: "logo-linkedin", color: "#0A66C2" },
];

export default function SocialLinksBar({ socialLinks, website, style }: SocialLinksBarProps) {
  const hasAnySocial = socialLinks && Object.values(socialLinks).some(Boolean);
  const hasWebsite = !!website;

  if (!hasAnySocial && !hasWebsite) return null;

  return (
    <View style={[styles.container, style]}>
      {hasWebsite && (
        <Pressable
          onPress={() => Linking.openURL(website!)}
          style={({ pressed }) => [
            styles.iconBtn,
            { backgroundColor: Colors.light.secondary + "15", opacity: pressed ? 0.7 : 1 },
          ]}
        >
          <Ionicons name="globe-outline" size={20} color={Colors.light.secondary} />
        </Pressable>
      )}
      {SOCIAL_ITEMS.map((item) => {
        const url = socialLinks?.[item.key];
        if (!url) return null;
        return (
          <Pressable
            key={item.key}
            onPress={() => Linking.openURL(url)}
            style={({ pressed }) => [
              styles.iconBtn,
              { backgroundColor: item.color + "15", opacity: pressed ? 0.7 : 1 },
            ]}
          >
            <Ionicons name={item.icon} size={20} color={item.color} />
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
  },
  iconBtn: {
    width: 42,
    height: 42,
    borderRadius: 21,
    alignItems: "center",
    justifyContent: "center",
  },
});
