import React from "react";
import {
  View,
  Text,
  Pressable,
  ScrollView,
  StyleSheet,
  Platform,
} from "react-native";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import Colors from "@/constants/colors";
import { EVENT_CATEGORIES, CATEGORY_COLORS, CATEGORY_ICONS, type EventCategory } from "@/lib/data";

interface CategoryFilterProps {
  selected: EventCategory | null;
  onSelect: (category: EventCategory | null) => void;
}

function CategoryIcon({ category, color, size }: { category: EventCategory; color: string; size: number }) {
  const iconInfo = CATEGORY_ICONS[category];
  if (iconInfo.family === "MaterialCommunityIcons") {
    return <MaterialCommunityIcons name={iconInfo.name as any} size={size} color={color} />;
  }
  return <Ionicons name={iconInfo.name as any} size={size} color={color} />;
}

export default function CategoryFilter({ selected, onSelect }: CategoryFilterProps) {
  const handlePress = (cat: EventCategory) => {
    if (Platform.OS !== "web") Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onSelect(selected === cat ? null : cat);
  };

  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.container}
    >
      {EVENT_CATEGORIES.map((cat) => {
        const isActive = selected === cat;
        const catColor = CATEGORY_COLORS[cat];
        return (
          <Pressable
            key={cat}
            onPress={() => handlePress(cat)}
            style={[
              styles.chip,
              isActive && { backgroundColor: catColor, borderColor: catColor },
            ]}
          >
            <CategoryIcon
              category={cat}
              color={isActive ? "#fff" : catColor}
              size={16}
            />
            <Text
              style={[
                styles.chipText,
                isActive && { color: "#fff" },
              ]}
            >
              {cat}
            </Text>
          </Pressable>
        );
      })}
    </ScrollView>
  );
}

export { CategoryIcon };

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 20,
    gap: 8,
    paddingVertical: 4,
  },
  chip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: Colors.light.surface,
    borderWidth: 1,
    borderColor: Colors.light.border,
  },
  chipText: {
    fontSize: 13,
    fontFamily: "Poppins_500Medium",
    color: Colors.light.text,
  },
});
