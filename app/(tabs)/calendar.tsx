import React, { useState, useMemo, useCallback } from "react";
import {
  View,
  Text,
  ScrollView,
  Pressable,
  StyleSheet,
  Platform,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import Colors from "@/constants/colors";
import EventCard from "@/components/EventCard";
import { getEvents, getDatesWithEvents, type Event } from "@/lib/data";

const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

const WEEKDAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

export default function CalendarScreen() {
  const insets = useSafeAreaInsets();
  const [currentMonth, setCurrentMonth] = useState(new Date(2026, 2, 1));
  const [selectedDate, setSelectedDate] = useState<string | null>(null);

  const allEvents = getEvents();
  const eventDates = useMemo(() => new Set(getDatesWithEvents()), []);

  const year = currentMonth.getFullYear();
  const month = currentMonth.getMonth();

  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDayOfWeek = new Date(year, month, 1).getDay();

  const calendarDays = useMemo(() => {
    const days: (number | null)[] = [];
    for (let i = 0; i < firstDayOfWeek; i++) days.push(null);
    for (let i = 1; i <= daysInMonth; i++) days.push(i);
    return days;
  }, [firstDayOfWeek, daysInMonth]);

  const getDateString = (day: number) => {
    const m = String(month + 1).padStart(2, "0");
    const d = String(day).padStart(2, "0");
    return `${year}-${m}-${d}`;
  };

  const selectedEvents = useMemo(() => {
    if (!selectedDate) return [];
    return allEvents.filter(e => e.date === selectedDate);
  }, [selectedDate, allEvents]);

  const handlePrevMonth = useCallback(() => {
    if (Platform.OS !== "web") Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setCurrentMonth(new Date(year, month - 1, 1));
    setSelectedDate(null);
  }, [year, month]);

  const handleNextMonth = useCallback(() => {
    if (Platform.OS !== "web") Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setCurrentMonth(new Date(year, month + 1, 1));
    setSelectedDate(null);
  }, [year, month]);

  const handleSelectDay = useCallback((day: number) => {
    if (Platform.OS !== "web") Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    const dateStr = getDateString(day);
    setSelectedDate(prev => prev === dateStr ? null : dateStr);
  }, [year, month]);

  const webTopInset = Platform.OS === "web" ? 67 : 0;

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={{ paddingBottom: 100 }}
      showsVerticalScrollIndicator={false}
    >
      <View style={[styles.header, { paddingTop: insets.top + webTopInset + 16 }]}>
        <Text style={styles.headerTitle}>Calendar</Text>
        <Text style={styles.headerSubtitle}>Find events by date</Text>
      </View>

      <View style={styles.calendarCard}>
        <View style={styles.monthNav}>
          <Pressable onPress={handlePrevMonth} style={styles.navBtn}>
            <Ionicons name="chevron-back" size={20} color={Colors.light.text} />
          </Pressable>
          <Text style={styles.monthTitle}>
            {MONTHS[month]} {year}
          </Text>
          <Pressable onPress={handleNextMonth} style={styles.navBtn}>
            <Ionicons name="chevron-forward" size={20} color={Colors.light.text} />
          </Pressable>
        </View>

        <View style={styles.weekdayRow}>
          {WEEKDAYS.map(d => (
            <Text key={d} style={styles.weekdayText}>{d}</Text>
          ))}
        </View>

        <View style={styles.daysGrid}>
          {calendarDays.map((day, idx) => {
            if (day === null) {
              return <View key={`empty-${idx}`} style={styles.dayCell} />;
            }
            const dateStr = getDateString(day);
            const hasEvent = eventDates.has(dateStr);
            const isSelected = selectedDate === dateStr;

            return (
              <Pressable
                key={day}
                onPress={() => handleSelectDay(day)}
                style={[
                  styles.dayCell,
                  isSelected && styles.selectedDay,
                ]}
              >
                <Text
                  style={[
                    styles.dayText,
                    isSelected && styles.selectedDayText,
                    hasEvent && !isSelected && styles.eventDayText,
                  ]}
                >
                  {day}
                </Text>
                {hasEvent && (
                  <View
                    style={[
                      styles.eventDot,
                      isSelected && styles.selectedEventDot,
                    ]}
                  />
                )}
              </Pressable>
            );
          })}
        </View>
      </View>

      {selectedDate && (
        <View style={styles.eventsSection}>
          <Text style={styles.eventsTitle}>
            {selectedEvents.length > 0
              ? `${selectedEvents.length} event${selectedEvents.length > 1 ? "s" : ""} on ${new Date(selectedDate + "T00:00:00").toLocaleDateString("en-AU", { day: "numeric", month: "long" })}`
              : `No events on ${new Date(selectedDate + "T00:00:00").toLocaleDateString("en-AU", { day: "numeric", month: "long" })}`
            }
          </Text>
          {selectedEvents.map(event => (
            <EventCard key={event.id} event={event} variant="list" />
          ))}
          {selectedEvents.length === 0 && (
            <View style={styles.noEventsCard}>
              <Ionicons name="calendar-outline" size={40} color={Colors.light.textTertiary} />
              <Text style={styles.noEventsText}>No events scheduled for this date</Text>
            </View>
          )}
        </View>
      )}

      {!selectedDate && (
        <View style={styles.hintContainer}>
          <Ionicons name="hand-left-outline" size={24} color={Colors.light.textTertiary} />
          <Text style={styles.hintText}>Tap a date to see events</Text>
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.light.background,
  },
  header: {
    paddingHorizontal: 20,
    paddingBottom: 16,
  },
  headerTitle: {
    fontSize: 28,
    fontFamily: "Poppins_700Bold",
    color: Colors.light.text,
  },
  headerSubtitle: {
    fontSize: 14,
    fontFamily: "Poppins_400Regular",
    color: Colors.light.textSecondary,
    marginTop: 2,
  },
  calendarCard: {
    marginHorizontal: 20,
    backgroundColor: Colors.light.surface,
    borderRadius: 20,
    padding: 16,
    borderWidth: 1,
    borderColor: Colors.light.borderLight,
  },
  monthNav: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  navBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: Colors.light.surfaceElevated,
    alignItems: "center",
    justifyContent: "center",
  },
  monthTitle: {
    fontSize: 18,
    fontFamily: "Poppins_600SemiBold",
    color: Colors.light.text,
  },
  weekdayRow: {
    flexDirection: "row",
    marginBottom: 8,
  },
  weekdayText: {
    flex: 1,
    textAlign: "center",
    fontSize: 12,
    fontFamily: "Poppins_600SemiBold",
    color: Colors.light.textTertiary,
  },
  daysGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
  },
  dayCell: {
    width: "14.28%",
    height: 44,
    alignItems: "center",
    justifyContent: "center",
  },
  dayText: {
    fontSize: 14,
    fontFamily: "Poppins_400Regular",
    color: Colors.light.text,
  },
  eventDayText: {
    fontFamily: "Poppins_700Bold",
    color: Colors.light.primary,
  },
  selectedDay: {
    backgroundColor: Colors.light.primary,
    borderRadius: 22,
  },
  selectedDayText: {
    color: "#fff",
    fontFamily: "Poppins_700Bold",
  },
  eventDot: {
    width: 5,
    height: 5,
    borderRadius: 2.5,
    backgroundColor: Colors.light.primary,
    position: "absolute",
    bottom: 4,
  },
  selectedEventDot: {
    backgroundColor: "#fff",
  },
  eventsSection: {
    marginTop: 20,
    paddingHorizontal: 20,
  },
  eventsTitle: {
    fontSize: 16,
    fontFamily: "Poppins_600SemiBold",
    color: Colors.light.text,
    marginBottom: 12,
  },
  noEventsCard: {
    alignItems: "center",
    paddingVertical: 32,
    gap: 8,
  },
  noEventsText: {
    fontSize: 14,
    fontFamily: "Poppins_400Regular",
    color: Colors.light.textSecondary,
  },
  hintContainer: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "center",
    gap: 8,
    marginTop: 32,
  },
  hintText: {
    fontSize: 14,
    fontFamily: "Poppins_400Regular",
    color: Colors.light.textTertiary,
  },
});
