import React, { useState, useMemo, useCallback, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  Platform,
  ActivityIndicator,
  ScrollView,
  Dimensions,
  Modal,
} from "react-native";
import { router, useNavigation } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import MapView, { Marker, Callout, PROVIDER_GOOGLE } from "react-native-maps";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { useQuery } from "@tanstack/react-query";
import { LinearGradient } from "expo-linear-gradient";
import * as Haptics from "expo-haptics";
import Colors from "@/constants/colors";
import { MAP_MARKER_COLORS, CATEGORY_COLORS, type Event, type Venue, type Business } from "@/lib/data";

interface MapData {
  events: Event[];
  venues: Venue[];
  businesses: Business[];
}

type LayerType = "events" | "venues" | "businesses";

const INITIAL_REGION = {
  latitude: -33.8688,
  longitude: 151.2093,
  latitudeDelta: 20,
  longitudeDelta: 20,
};

const LAYER_CONFIG: Record<LayerType, { label: string; icon: string; color: string }> = {
  events: { label: "Events", icon: "calendar", color: Colors.light.primary },
  venues: { label: "Venues", icon: "location", color: Colors.light.secondary },
  businesses: { label: "Business", icon: "storefront", color: "#3B82F6" },
};

export default function MapScreen() {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation();
  const mapRef = useRef<MapView>(null);
  const isWeb = Platform.OS === "web";

  const [activeLayers, setActiveLayers] = useState<Set<LayerType>>(
    new Set(["events", "venues", "businesses"])
  );
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [showFilters, setShowFilters] = useState(false);
  const [freeOnly, setFreeOnly] = useState(false);

  const { data: mapData, isLoading } = useQuery<MapData>({
    queryKey: ["/api/map/data"],
  });

  const goBack = useCallback(() => {
    if (navigation.canGoBack()) {
      router.back();
    } else {
      router.replace("/");
    }
  }, [navigation]);

  const toggleLayer = useCallback((layer: LayerType) => {
    if (Platform.OS !== "web") Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setActiveLayers((prev) => {
      const next = new Set(prev);
      if (next.has(layer)) {
        next.delete(layer);
      } else {
        next.add(layer);
      }
      return next;
    });
  }, []);

  const categories = useMemo(() => {
    if (!mapData?.events) return [];
    const cats = new Set(mapData.events.map((e) => e.category));
    return Array.from(cats).sort();
  }, [mapData]);

  const filteredEvents = useMemo(() => {
    if (!mapData?.events) return [];
    return mapData.events.filter((e) => {
      if (!e.lat || !e.lng) return false;
      if (selectedCategory && e.category !== selectedCategory) return false;
      if (freeOnly && e.price > 0) return false;
      return true;
    });
  }, [mapData, selectedCategory, freeOnly]);

  const filteredVenues = useMemo(() => {
    if (!mapData?.venues) return [];
    return mapData.venues.filter((v) => v.lat && v.lng);
  }, [mapData]);

  const filteredBusinesses = useMemo(() => {
    if (!mapData?.businesses) return [];
    return mapData.businesses.filter((b) => b.lat && b.lng);
  }, [mapData]);

  const markerCount =
    (activeLayers.has("events") ? filteredEvents.length : 0) +
    (activeLayers.has("venues") ? filteredVenues.length : 0) +
    (activeLayers.has("businesses") ? filteredBusinesses.length : 0);

  if (isWeb) {
    return (
      <View style={[styles.container, { paddingTop: 67 }]}>
        <View style={styles.webHeader}>
          <Pressable onPress={goBack} style={styles.backBtn}>
            <Ionicons name="arrow-back" size={24} color={Colors.light.text} />
          </Pressable>
          <Text style={styles.webTitle}>Explore Map</Text>
        </View>
        <View style={styles.webMapFallback}>
          <MaterialCommunityIcons name="map-marker-radius" size={80} color={Colors.light.secondary} />
          <Text style={styles.webMapText}>Map view is best experienced on mobile</Text>
          <Text style={styles.webMapSubtext}>
            {mapData ? `${filteredEvents.length} events, ${filteredVenues.length} venues, ${filteredBusinesses.length} businesses` : "Loading..."}
          </Text>

          {mapData && (
            <ScrollView style={styles.webList} showsVerticalScrollIndicator={false}>
              {activeLayers.has("events") && filteredEvents.map((event) => (
                <Pressable
                  key={event.id}
                  style={styles.webListItem}
                  onPress={() => router.push(`/event/${event.id}`)}
                >
                  <View style={[styles.webDot, { backgroundColor: CATEGORY_COLORS[event.category] || Colors.light.primary }]} />
                  <View style={{ flex: 1 }}>
                    <Text style={styles.webItemTitle} numberOfLines={1}>{event.title}</Text>
                    <Text style={styles.webItemSub}>{event.venue} - {event.city}</Text>
                  </View>
                  <Text style={styles.webItemPrice}>
                    {event.price > 0 ? `$${event.price}` : "Free"}
                  </Text>
                </Pressable>
              ))}
              {activeLayers.has("venues") && filteredVenues.map((venue) => (
                <Pressable
                  key={venue.id}
                  style={styles.webListItem}
                  onPress={() => router.push(`/venue/${venue.id}`)}
                >
                  <View style={[styles.webDot, { backgroundColor: Colors.light.secondary }]} />
                  <View style={{ flex: 1 }}>
                    <Text style={styles.webItemTitle} numberOfLines={1}>{venue.name}</Text>
                    <Text style={styles.webItemSub}>{venue.venueType} - {venue.city}</Text>
                  </View>
                </Pressable>
              ))}
              {activeLayers.has("businesses") && filteredBusinesses.map((biz) => (
                <Pressable
                  key={biz.id}
                  style={styles.webListItem}
                  onPress={() => router.push(`/business/${biz.id}`)}
                >
                  <View style={[styles.webDot, { backgroundColor: "#3B82F6" }]} />
                  <View style={{ flex: 1 }}>
                    <Text style={styles.webItemTitle} numberOfLines={1}>{biz.name}</Text>
                    <Text style={styles.webItemSub}>{biz.category} - {biz.city}</Text>
                  </View>
                </Pressable>
              ))}
            </ScrollView>
          )}
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {isLoading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={Colors.light.primary} />
          <Text style={styles.loadingText}>Loading map data...</Text>
        </View>
      ) : (
        <MapView
          ref={mapRef}
          style={styles.map}
          initialRegion={INITIAL_REGION}
          showsUserLocation
          showsMyLocationButton={false}
          showsCompass={false}
          rotateEnabled={false}
        >
          {activeLayers.has("events") &&
            filteredEvents.map((event) => (
              <Marker
                key={`evt-${event.id}`}
                coordinate={{ latitude: event.lat!, longitude: event.lng! }}
                pinColor={CATEGORY_COLORS[event.category] || Colors.light.primary}
                title={event.title}
                description={`${event.venue} - ${event.price > 0 ? `$${event.price}` : "Free"}`}
                onCalloutPress={() => router.push(`/event/${event.id}`)}
              />
            ))}

          {activeLayers.has("venues") &&
            filteredVenues.map((venue) => (
              <Marker
                key={`ven-${venue.id}`}
                coordinate={{ latitude: venue.lat, longitude: venue.lng }}
                pinColor={Colors.light.secondary}
                title={venue.name}
                description={`${venue.venueType} - Capacity: ${venue.capacity || "N/A"}`}
                onCalloutPress={() => router.push(`/venue/${venue.id}`)}
              />
            ))}

          {activeLayers.has("businesses") &&
            filteredBusinesses.map((biz) => (
              <Marker
                key={`biz-${biz.id}`}
                coordinate={{ latitude: biz.lat!, longitude: biz.lng! }}
                pinColor="#3B82F6"
                title={biz.name}
                description={biz.category}
                onCalloutPress={() => router.push(`/business/${biz.id}`)}
              />
            ))}
        </MapView>
      )}

      <View style={[styles.topBar, { top: insets.top + 8 }]}>
        <Pressable onPress={goBack} style={styles.circleBtn}>
          <Ionicons name="arrow-back" size={22} color={Colors.light.text} />
        </Pressable>
        <View style={styles.markerBadge}>
          <Ionicons name="location" size={14} color={Colors.light.primary} />
          <Text style={styles.markerCount}>{markerCount}</Text>
        </View>
        <Pressable
          onPress={() => {
            if (Platform.OS !== "web") Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            setShowFilters(true);
          }}
          style={styles.circleBtn}
        >
          <Ionicons name="options" size={22} color={Colors.light.text} />
        </Pressable>
      </View>

      <View style={[styles.layerPanel, { bottom: insets.bottom + 16 }]}>
        {(Object.keys(LAYER_CONFIG) as LayerType[]).map((layer) => {
          const cfg = LAYER_CONFIG[layer];
          const isActive = activeLayers.has(layer);
          return (
            <Pressable
              key={layer}
              style={[
                styles.layerChip,
                isActive && { backgroundColor: cfg.color, borderColor: cfg.color },
              ]}
              onPress={() => toggleLayer(layer)}
            >
              <Ionicons
                name={cfg.icon as any}
                size={16}
                color={isActive ? "#fff" : Colors.light.textSecondary}
              />
              <Text
                style={[
                  styles.layerLabel,
                  isActive && { color: "#fff" },
                ]}
              >
                {cfg.label}
              </Text>
            </Pressable>
          );
        })}
      </View>

      <Pressable
        style={[styles.myLocationBtn, { bottom: insets.bottom + 80 }]}
        onPress={() => {
          mapRef.current?.animateToRegion(INITIAL_REGION, 500);
        }}
      >
        <Ionicons name="locate" size={22} color={Colors.light.secondary} />
      </Pressable>

      <Modal visible={showFilters} transparent animationType="slide">
        <Pressable style={styles.modalOverlay} onPress={() => setShowFilters(false)}>
          <Pressable style={[styles.filterSheet, { paddingBottom: insets.bottom + 20 }]} onPress={(e) => e.stopPropagation()}>
            <View style={styles.sheetHandle} />
            <Text style={styles.sheetTitle}>Filter Map</Text>

            <Text style={styles.filterLabel}>Event Category</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.catScroll}>
              <Pressable
                style={[styles.catChip, !selectedCategory && styles.catChipActive]}
                onPress={() => setSelectedCategory(null)}
              >
                <Text style={[styles.catText, !selectedCategory && styles.catTextActive]}>All</Text>
              </Pressable>
              {categories.map((cat) => (
                <Pressable
                  key={cat}
                  style={[styles.catChip, selectedCategory === cat && styles.catChipActive]}
                  onPress={() => setSelectedCategory(cat === selectedCategory ? null : cat)}
                >
                  <Text style={[styles.catText, selectedCategory === cat && styles.catTextActive]}>{cat}</Text>
                </Pressable>
              ))}
            </ScrollView>

            <Pressable
              style={styles.toggleRow}
              onPress={() => setFreeOnly(!freeOnly)}
            >
              <Text style={styles.toggleLabel}>Free events only</Text>
              <View style={[styles.toggle, freeOnly && styles.toggleActive]}>
                <View style={[styles.toggleDot, freeOnly && styles.toggleDotActive]} />
              </View>
            </Pressable>

            <Pressable
              style={styles.applyBtn}
              onPress={() => setShowFilters(false)}
            >
              <Text style={styles.applyBtnText}>Apply Filters</Text>
            </Pressable>
          </Pressable>
        </Pressable>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.light.background },
  map: { flex: 1 },
  loadingContainer: { flex: 1, justifyContent: "center", alignItems: "center" },
  loadingText: { marginTop: 12, fontFamily: "Poppins_500Medium", color: Colors.light.textSecondary },

  topBar: {
    position: "absolute",
    left: 16,
    right: 16,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  circleBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "rgba(255,255,255,0.95)",
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.12,
    shadowRadius: 8,
    elevation: 4,
  },
  markerBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.95)",
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    gap: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 3,
  },
  markerCount: {
    fontFamily: "Poppins_600SemiBold",
    fontSize: 14,
    color: Colors.light.text,
  },

  layerPanel: {
    position: "absolute",
    left: 16,
    right: 16,
    flexDirection: "row",
    justifyContent: "center",
    gap: 8,
  },
  layerChip: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 24,
    backgroundColor: "rgba(255,255,255,0.95)",
    borderWidth: 1.5,
    borderColor: Colors.light.border,
    gap: 6,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 3,
  },
  layerLabel: {
    fontFamily: "Poppins_500Medium",
    fontSize: 13,
    color: Colors.light.textSecondary,
  },

  myLocationBtn: {
    position: "absolute",
    right: 16,
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "rgba(255,255,255,0.95)",
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.12,
    shadowRadius: 8,
    elevation: 4,
  },

  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.4)",
    justifyContent: "flex-end",
  },
  filterSheet: {
    backgroundColor: "#fff",
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
  },
  sheetHandle: {
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: Colors.light.border,
    alignSelf: "center",
    marginBottom: 16,
  },
  sheetTitle: {
    fontFamily: "Poppins_700Bold",
    fontSize: 22,
    color: Colors.light.text,
    marginBottom: 20,
  },
  filterLabel: {
    fontFamily: "Poppins_600SemiBold",
    fontSize: 14,
    color: Colors.light.textSecondary,
    marginBottom: 10,
  },
  catScroll: { marginBottom: 20 },
  catChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: Colors.light.surfaceElevated,
    marginRight: 8,
    borderWidth: 1.5,
    borderColor: "transparent",
  },
  catChipActive: {
    backgroundColor: Colors.light.primary,
    borderColor: Colors.light.primary,
  },
  catText: {
    fontFamily: "Poppins_500Medium",
    fontSize: 13,
    color: Colors.light.textSecondary,
  },
  catTextActive: { color: "#fff" },

  toggleRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 14,
    borderTopWidth: 1,
    borderTopColor: Colors.light.borderLight,
  },
  toggleLabel: {
    fontFamily: "Poppins_500Medium",
    fontSize: 15,
    color: Colors.light.text,
  },
  toggle: {
    width: 50,
    height: 28,
    borderRadius: 14,
    backgroundColor: Colors.light.border,
    justifyContent: "center",
    paddingHorizontal: 3,
  },
  toggleActive: { backgroundColor: Colors.light.primary },
  toggleDot: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: "#fff",
  },
  toggleDotActive: { alignSelf: "flex-end" },

  applyBtn: {
    marginTop: 20,
    backgroundColor: Colors.light.secondary,
    paddingVertical: 16,
    borderRadius: 14,
    alignItems: "center",
  },
  applyBtnText: {
    fontFamily: "Poppins_600SemiBold",
    fontSize: 16,
    color: "#fff",
  },

  webHeader: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: Colors.light.border,
  },
  backBtn: { padding: 8, marginRight: 12 },
  webTitle: { fontFamily: "Poppins_700Bold", fontSize: 20, color: Colors.light.text },
  webMapFallback: {
    flex: 1,
    alignItems: "center",
    paddingTop: 40,
  },
  webMapText: {
    fontFamily: "Poppins_600SemiBold",
    fontSize: 18,
    color: Colors.light.text,
    marginTop: 16,
  },
  webMapSubtext: {
    fontFamily: "Poppins_400Regular",
    fontSize: 14,
    color: Colors.light.textSecondary,
    marginTop: 4,
    marginBottom: 20,
  },
  webList: { width: "100%", maxWidth: 600, paddingHorizontal: 16 },
  webListItem: {
    flexDirection: "row",
    alignItems: "center",
    padding: 14,
    backgroundColor: Colors.light.surface,
    borderRadius: 12,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: Colors.light.borderLight,
    gap: 12,
  },
  webDot: { width: 10, height: 10, borderRadius: 5 },
  webItemTitle: { fontFamily: "Poppins_600SemiBold", fontSize: 14, color: Colors.light.text },
  webItemSub: { fontFamily: "Poppins_400Regular", fontSize: 12, color: Colors.light.textSecondary },
  webItemPrice: { fontFamily: "Poppins_600SemiBold", fontSize: 13, color: Colors.light.primary },
});
