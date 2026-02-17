import React from "react";
import {
  View,
  Text,
  ScrollView,
  Pressable,
  StyleSheet,
  Platform,
  Alert,
} from "react-native";
import { useLocalSearchParams, router } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Image } from "expo-image";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import * as Haptics from "expo-haptics";
import Colors from "@/constants/colors";
import EventCard from "@/components/EventCard";
import { getOrganisationById, getEvents } from "@/lib/data";

export default function CommunityDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const insets = useSafeAreaInsets();

  const org = getOrganisationById(id!);
  const orgEvents = getEvents().filter(e => e.orgId === id);

  if (!org) {
    return (
      <View style={styles.notFound}>
        <Ionicons name="alert-circle" size={48} color={Colors.light.textTertiary} />
        <Text style={styles.notFoundText}>Organisation not found</Text>
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
        <Image source={{ uri: org.imageUrl }} style={styles.heroImage} contentFit="cover" transition={300} />
        <LinearGradient
          colors={["rgba(0,0,0,0.4)", "transparent", "rgba(0,0,0,0.7)"]}
          style={StyleSheet.absoluteFill}
        />
        <Pressable
          onPress={() => router.back()}
          style={[styles.backBtn, { top: insets.top + webTopInset + 8 }]}
        >
          <Ionicons name="arrow-back" size={22} color="#fff" />
        </Pressable>
      </View>

      <View style={styles.content}>
        <Text style={styles.name}>{org.name}</Text>
        <Text style={styles.cpid}>{org.cpid}</Text>

        <View style={styles.statsRow}>
          <View style={styles.statCard}>
            <Ionicons name="people" size={20} color={Colors.light.primary} />
            <Text style={styles.statValue}>{org.memberCount.toLocaleString()}</Text>
            <Text style={styles.statLabel}>Members</Text>
          </View>
          <View style={styles.statCard}>
            <Ionicons name="calendar" size={20} color={Colors.light.secondary} />
            <Text style={styles.statValue}>{orgEvents.length}</Text>
            <Text style={styles.statLabel}>Events</Text>
          </View>
          <View style={styles.statCard}>
            <Ionicons name="time" size={20} color={Colors.light.accent} />
            <Text style={styles.statValue}>{org.established}</Text>
            <Text style={styles.statLabel}>Est.</Text>
          </View>
        </View>

        <View style={styles.locationRow}>
          <Ionicons name="location" size={16} color={Colors.light.primary} />
          <Text style={styles.locationText}>{org.city}, {org.state}</Text>
        </View>

        <View style={styles.tagRow}>
          {org.categories.map(c => (
            <View key={c} style={styles.tag}>
              <Text style={styles.tagText}>{c}</Text>
            </View>
          ))}
        </View>

        <Text style={styles.sectionTitle}>About</Text>
        <Text style={styles.description}>{org.description}</Text>

        <Pressable
          onPress={() => {
            if (Platform.OS !== "web") Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
            Alert.alert("Join Community", "Community membership will be available soon!");
          }}
          style={({ pressed }) => [
            styles.joinBtn,
            { transform: [{ scale: pressed ? 0.97 : 1 }] },
          ]}
        >
          <LinearGradient
            colors={[Colors.light.secondary, Colors.light.secondaryLight]}
            style={styles.joinBtnGradient}
          >
            <Ionicons name="people" size={18} color="#fff" />
            <Text style={styles.joinBtnText}>Join Community</Text>
          </LinearGradient>
        </Pressable>

        {orgEvents.length > 0 && (
          <>
            <Text style={[styles.sectionTitle, { marginTop: 28 }]}>Upcoming Events</Text>
            {orgEvents.map(event => (
              <EventCard key={event.id} event={event} variant="list" />
            ))}
          </>
        )}
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
    height: 240,
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
  content: {
    padding: 20,
  },
  name: {
    fontSize: 24,
    fontFamily: "Poppins_700Bold",
    color: Colors.light.text,
  },
  cpid: {
    fontSize: 12,
    fontFamily: "Poppins_400Regular",
    color: Colors.light.textTertiary,
    marginTop: 2,
  },
  statsRow: {
    flexDirection: "row",
    gap: 12,
    marginTop: 20,
  },
  statCard: {
    flex: 1,
    alignItems: "center",
    gap: 4,
    backgroundColor: Colors.light.surface,
    padding: 14,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: Colors.light.borderLight,
  },
  statValue: {
    fontSize: 18,
    fontFamily: "Poppins_700Bold",
    color: Colors.light.text,
  },
  statLabel: {
    fontSize: 11,
    fontFamily: "Poppins_400Regular",
    color: Colors.light.textSecondary,
  },
  locationRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginTop: 16,
  },
  locationText: {
    fontSize: 14,
    fontFamily: "Poppins_500Medium",
    color: Colors.light.textSecondary,
  },
  tagRow: {
    flexDirection: "row",
    gap: 8,
    marginTop: 12,
  },
  tag: {
    backgroundColor: Colors.light.primary + "15",
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 12,
  },
  tagText: {
    fontSize: 12,
    fontFamily: "Poppins_600SemiBold",
    color: Colors.light.primary,
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
  joinBtn: {
    marginTop: 20,
    borderRadius: 16,
    overflow: "hidden",
  },
  joinBtnGradient: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingVertical: 16,
    borderRadius: 16,
  },
  joinBtnText: {
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
