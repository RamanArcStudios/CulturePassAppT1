import React from "react";
import {
  View,
  Text,
  StyleSheet,
  Platform,
  Pressable,
  ScrollView,
  Linking,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { router, useNavigation } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import Colors from "@/constants/colors";

export default function AboutScreen() {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation();
  const goBack = () => navigation.canGoBack() ? router.back() : router.replace("/profile");
  const webTopInset = Platform.OS === "web" ? 67 : 0;

  return (
    <View style={styles.container}>
      <View style={[styles.header, { paddingTop: insets.top + webTopInset + 12 }]}>
        <Pressable onPress={goBack} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={22} color={Colors.light.text} />
        </Pressable>
        <Text style={styles.headerTitle}>About</Text>
        <View style={{ width: 36 }} />
      </View>

      <ScrollView
        style={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 40 }}
      >
        <LinearGradient
          colors={[Colors.light.secondary, Colors.light.secondaryLight]}
          style={styles.brandCard}
        >
          <View style={styles.logoContainer}>
            <Ionicons name="compass" size={40} color="#fff" />
          </View>
          <Text style={styles.appName}>CulturePass</Text>
          <Text style={styles.version}>Version 1.0.0</Text>
          <Text style={styles.tagline}>
            Connecting Kerala Communities Across Australia
          </Text>
        </LinearGradient>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Our Mission</Text>
          <View style={styles.sectionCard}>
            <Text style={styles.missionText}>
              CulturePass is dedicated to preserving and celebrating Kerala&apos;s rich cultural heritage across Australia. We connect Malayalee communities with cultural events, local businesses, talented artists, and exclusive member perks.
            </Text>
            <Text style={[styles.missionText, { marginTop: 12 }]}>
              Whether it&apos;s Onam celebrations in Sydney, Vishu festivals in Melbourne, or Kathakali performances in Brisbane, CulturePass brings your community together.
            </Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>What We Offer</Text>
          <View style={styles.sectionCard}>
            {[
              {
                icon: "calendar",
                color: Colors.light.primary,
                title: "Event Discovery",
                desc: "Find cultural events, festivals, and gatherings near you",
              },
              {
                icon: "people",
                color: Colors.light.secondary,
                title: "Community Directory",
                desc: "Connect with Kerala organisations and associations",
              },
              {
                icon: "storefront",
                color: Colors.light.accent,
                title: "Business Listings",
                desc: "Support local Indian and Malayalee businesses",
              },
              {
                icon: "musical-notes",
                color: "#9B59B6",
                title: "Artist Profiles",
                desc: "Discover talented performers and cultural artists",
              },
              {
                icon: "pricetag",
                color: Colors.light.success,
                title: "Member Perks",
                desc: "Exclusive discounts and offers for members",
              },
            ].map((item, idx, arr) => (
              <View
                key={idx}
                style={[
                  styles.featureRow,
                  idx < arr.length - 1 && {
                    borderBottomWidth: 1,
                    borderBottomColor: Colors.light.borderLight,
                  },
                ]}
              >
                <View style={[styles.featureIcon, { backgroundColor: item.color + "12" }]}>
                  <Ionicons name={item.icon as any} size={20} color={item.color} />
                </View>
                <View style={styles.featureInfo}>
                  <Text style={styles.featureTitle}>{item.title}</Text>
                  <Text style={styles.featureDesc}>{item.desc}</Text>
                </View>
              </View>
            ))}
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Connect</Text>
          <View style={styles.sectionCard}>
            {[
              {
                icon: "globe",
                label: "Website",
                value: "www.culturepass.com.au",
                url: "https://www.culturepass.com.au",
              },
              {
                icon: "logo-instagram",
                label: "Instagram",
                value: "@culturepassau",
                url: "https://instagram.com/culturepassau",
              },
              {
                icon: "mail",
                label: "Contact",
                value: "hello@culturepass.com.au",
                url: "mailto:hello@culturepass.com.au",
              },
            ].map((item, idx, arr) => (
              <Pressable
                key={idx}
                onPress={() => Linking.openURL(item.url)}
                style={({ pressed }) => [
                  styles.linkRow,
                  { opacity: pressed ? 0.7 : 1 },
                  idx < arr.length - 1 && {
                    borderBottomWidth: 1,
                    borderBottomColor: Colors.light.borderLight,
                  },
                ]}
              >
                <View style={styles.linkIcon}>
                  <Ionicons name={item.icon as any} size={20} color={Colors.light.primary} />
                </View>
                <View style={styles.linkInfo}>
                  <Text style={styles.linkLabel}>{item.label}</Text>
                  <Text style={styles.linkValue}>{item.value}</Text>
                </View>
                <Ionicons name="open-outline" size={16} color={Colors.light.textTertiary} />
              </Pressable>
            ))}
          </View>
        </View>

        <Text style={styles.footerText}>
          Made with love for the Malayalee community
        </Text>
        <Text style={styles.copyright}>
          2026 CulturePass. All rights reserved.
        </Text>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.light.background,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: Colors.light.borderLight,
  },
  backBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
  },
  headerTitle: {
    fontSize: 18,
    fontFamily: "Poppins_700Bold",
    color: Colors.light.text,
  },
  scrollContent: {
    flex: 1,
  },
  brandCard: {
    alignItems: "center",
    paddingVertical: 36,
    margin: 20,
    borderRadius: 20,
  },
  logoContainer: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: "rgba(255,255,255,0.15)",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 12,
  },
  appName: {
    fontSize: 26,
    fontFamily: "Poppins_700Bold",
    color: "#fff",
  },
  version: {
    fontSize: 13,
    fontFamily: "Poppins_500Medium",
    color: "rgba(255,255,255,0.7)",
    marginTop: 2,
  },
  tagline: {
    fontSize: 14,
    fontFamily: "Poppins_400Regular",
    color: "rgba(255,255,255,0.85)",
    textAlign: "center",
    marginTop: 8,
    paddingHorizontal: 32,
    lineHeight: 22,
  },
  section: {
    gap: 10,
    marginBottom: 24,
    paddingHorizontal: 20,
  },
  sectionTitle: {
    fontSize: 13,
    fontFamily: "Poppins_600SemiBold",
    color: Colors.light.textSecondary,
    textTransform: "uppercase",
    letterSpacing: 0.8,
    marginLeft: 4,
  },
  sectionCard: {
    backgroundColor: Colors.light.surface,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: Colors.light.borderLight,
    overflow: "hidden",
  },
  missionText: {
    fontSize: 14,
    fontFamily: "Poppins_400Regular",
    color: Colors.light.textSecondary,
    lineHeight: 22,
    padding: 16,
    paddingBottom: 0,
  },
  featureRow: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    gap: 12,
  },
  featureIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  featureInfo: {
    flex: 1,
  },
  featureTitle: {
    fontSize: 15,
    fontFamily: "Poppins_600SemiBold",
    color: Colors.light.text,
  },
  featureDesc: {
    fontSize: 12,
    fontFamily: "Poppins_400Regular",
    color: Colors.light.textSecondary,
    marginTop: 1,
  },
  linkRow: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    gap: 12,
  },
  linkIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: Colors.light.primary + "10",
    alignItems: "center",
    justifyContent: "center",
  },
  linkInfo: {
    flex: 1,
  },
  linkLabel: {
    fontSize: 15,
    fontFamily: "Poppins_600SemiBold",
    color: Colors.light.text,
  },
  linkValue: {
    fontSize: 12,
    fontFamily: "Poppins_400Regular",
    color: Colors.light.textSecondary,
    marginTop: 1,
  },
  footerText: {
    fontSize: 13,
    fontFamily: "Poppins_500Medium",
    color: Colors.light.textSecondary,
    textAlign: "center",
    marginTop: 8,
  },
  copyright: {
    fontSize: 12,
    fontFamily: "Poppins_400Regular",
    color: Colors.light.textTertiary,
    textAlign: "center",
    marginTop: 4,
    marginBottom: 20,
  },
});
