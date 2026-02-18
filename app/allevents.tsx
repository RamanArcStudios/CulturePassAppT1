import React, { useState, useCallback } from "react";
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  Platform,
  ActivityIndicator,
  Alert,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useQuery } from "@tanstack/react-query";
import { router } from "expo-router";
import * as Haptics from "expo-haptics";
import Colors from "@/constants/colors";
import EventCard from "@/components/EventCard";
import CategoryFilter from "@/components/CategoryFilter";
import { type EventCategory, type Event } from "@/lib/data";
import { useAuth } from "@/lib/auth";
import { apiRequest, queryClient } from "@/lib/query-client";

export default function AllEventsScreen() {
  const [selectedCategory, setSelectedCategory] = useState<EventCategory | null>(null);
  const { user, isAuthenticated } = useAuth();

  const { data: allEvents = [], isLoading } = useQuery<Event[]>({ queryKey: ['/api/events'] });

  const savedEventIds: string[] = user?.savedEvents ?? [];

  const handleSave = useCallback(async (id: string) => {
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
  }, [isAuthenticated]);

  const filteredEvents = selectedCategory
    ? allEvents.filter(e => e.category === selectedCategory)
    : allEvents;

  if (isLoading) return <View style={{flex:1,justifyContent:'center',alignItems:'center'}}><ActivityIndicator size="large" color={Colors.light.primary} /></View>;

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={{ paddingBottom: 100 }}
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.filterSection}>
        <CategoryFilter selected={selectedCategory} onSelect={setSelectedCategory} />
      </View>

      <View style={styles.listSection}>
        <Text style={styles.countText}>
          {filteredEvents.length} event{filteredEvents.length !== 1 ? "s" : ""}
        </Text>
        {filteredEvents.map(event => (
          <EventCard
            key={event.id}
            event={event}
            variant="list"
            onSave={handleSave}
            isSaved={savedEventIds.includes(event.id)}
          />
        ))}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.light.background,
  },
  filterSection: {
    marginTop: 12,
    marginBottom: 8,
  },
  listSection: {
    paddingHorizontal: 20,
  },
  countText: {
    fontSize: 13,
    fontFamily: "Poppins_500Medium",
    color: Colors.light.textSecondary,
    marginBottom: 12,
  },
});
