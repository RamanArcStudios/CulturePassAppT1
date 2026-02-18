import React from "react";
import {
  View,
  Text,
  ScrollView,
  Pressable,
  StyleSheet,
  Platform,
  ActivityIndicator,
} from "react-native";
import { useLocalSearchParams, router } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Image } from "expo-image";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useQuery } from "@tanstack/react-query";
import Colors from "@/constants/colors";
import type { Artist } from "@/lib/data";

export default function ArtistDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const insets = useSafeAreaInsets();

  const { data: artist, isLoading } = useQuery<Artist>({ queryKey: ['/api/artists', id] });

  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" color={Colors.light.primary} />
      </View>
    );
  }

  if (!artist) {
    return (
      <View style={styles.notFound}>
        <Ionicons name="alert-circle" size={48} color={Colors.light.textTertiary} />
        <Text style={styles.notFoundText}>Artist not found</Text>
        <Pressable onPress={() => router.back()}>
          <Text style={styles.backLink}>Go Back</Text>
        </Pressable>
      </View>
    );
  }

  const webTopInset = Platform.OS === "web" ? 67 : 0;

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={{ paddingBottom: 100 }}
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.imageContainer}>
        <Image source={{ uri: artist.imageUrl ?? undefined }} style={styles.heroImage} contentFit="cover" transition={300} />
        <LinearGradient
          colors={["rgba(0,0,0,0.3)", "transparent", "rgba(0,0,0,0.8)"]}
          style={StyleSheet.absoluteFill}
        />
        <Pressable
          onPress={() => router.back()}
          style={[styles.backBtn, { top: insets.top + webTopInset + 8 }]}
        >
          <Ionicons name="arrow-back" size={22} color="#fff" />
        </Pressable>
        {artist.featured && (
          <View style={styles.featuredBadge}>
            <Ionicons name="star" size={14} color={Colors.light.accent} />
            <Text style={styles.featuredText}>Featured Artist</Text>
          </View>
        )}
        <View style={styles.heroContent}>
          <Text style={styles.artistName}>{artist.name}</Text>
          <Text style={styles.artistGenre}>{artist.genre}</Text>
        </View>
      </View>

      <View style={styles.content}>
        <View style={styles.statsRow}>
          <View style={styles.statCard}>
            <Ionicons name="musical-notes" size={20} color={Colors.light.primary} />
            <Text style={styles.statValue}>{artist.performances ?? 0}</Text>
            <Text style={styles.statLabel}>Shows</Text>
          </View>
          <View style={styles.statCard}>
            <Ionicons name="location" size={20} color={Colors.light.secondary} />
            <Text style={styles.statValue}>{artist.city}</Text>
            <Text style={styles.statLabel}>{artist.state}</Text>
          </View>
        </View>

        <View style={styles.cpidRow}>
          <Ionicons name="shield-checkmark" size={14} color={Colors.light.secondary} />
          <Text style={styles.cpidText}>{artist.cpid}</Text>
        </View>

        <Text style={styles.sectionTitle}>About</Text>
        <Text style={styles.bio}>{artist.bio}</Text>
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
    height: 320,
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
  featuredBadge: {
    position: "absolute",
    top: 16,
    right: 16,
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: "rgba(0,0,0,0.5)",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 14,
  },
  featuredText: {
    color: Colors.light.accent,
    fontSize: 12,
    fontFamily: "Poppins_600SemiBold",
  },
  heroContent: {
    position: "absolute",
    bottom: 20,
    left: 20,
    right: 20,
  },
  artistName: {
    fontSize: 28,
    fontFamily: "Poppins_700Bold",
    color: "#fff",
  },
  artistGenre: {
    fontSize: 16,
    fontFamily: "Poppins_500Medium",
    color: "rgba(255,255,255,0.8)",
    marginTop: 4,
  },
  content: {
    padding: 20,
  },
  statsRow: {
    flexDirection: "row",
    gap: 12,
  },
  statCard: {
    flex: 1,
    alignItems: "center",
    gap: 4,
    backgroundColor: Colors.light.surface,
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: Colors.light.borderLight,
  },
  statValue: {
    fontSize: 20,
    fontFamily: "Poppins_700Bold",
    color: Colors.light.text,
  },
  statLabel: {
    fontSize: 12,
    fontFamily: "Poppins_400Regular",
    color: Colors.light.textSecondary,
  },
  cpidRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginTop: 16,
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
  sectionTitle: {
    fontSize: 18,
    fontFamily: "Poppins_700Bold",
    color: Colors.light.text,
    marginTop: 24,
    marginBottom: 8,
  },
  bio: {
    fontSize: 14,
    fontFamily: "Poppins_400Regular",
    color: Colors.light.textSecondary,
    lineHeight: 24,
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
