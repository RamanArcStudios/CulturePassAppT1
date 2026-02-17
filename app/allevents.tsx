import React, { useState, useCallback, useEffect } from "react";
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  Platform,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Colors from "@/constants/colors";
import EventCard from "@/components/EventCard";
import CategoryFilter from "@/components/CategoryFilter";
import { getEvents, type EventCategory } from "@/lib/data";
import { getSavedEventIds, toggleSaveEvent } from "@/lib/storage";

export default function AllEventsScreen() {
  const [selectedCategory, setSelectedCategory] = useState<EventCategory | null>(null);
  const [savedEvents, setSavedEvents] = useState<string[]>([]);

  const allEvents = getEvents();

  useEffect(() => {
    getSavedEventIds().then(setSavedEvents);
  }, []);

  const handleSave = useCallback(async (id: string) => {
    const isSaved = await toggleSaveEvent(id);
    setSavedEvents(prev =>
      isSaved ? [...prev, id] : prev.filter(e => e !== id)
    );
  }, []);

  const filteredEvents = selectedCategory
    ? allEvents.filter(e => e.category === selectedCategory)
    : allEvents;

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
            isSaved={savedEvents.includes(event.id)}
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
