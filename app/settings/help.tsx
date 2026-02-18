import React, { useState } from "react";
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
import { router } from "expo-router";
import * as Haptics from "expo-haptics";
import Colors from "@/constants/colors";

interface FAQ {
  question: string;
  answer: string;
}

const FAQS: FAQ[] = [
  {
    question: "How do I book tickets for an event?",
    answer:
      "Navigate to any event, tap 'Book Tickets', confirm the booking, and your ticket will appear in your profile under 'My Tickets'.",
  },
  {
    question: "Can I get a refund for my ticket?",
    answer:
      "Refund policies vary by event organiser. Check the event details page for the specific refund policy, or contact the organiser directly.",
  },
  {
    question: "How do I join a community?",
    answer:
      "Go to the Community tab, tap on any organisation, and press the 'Join Community' button. You'll see it in your profile under 'Communities'.",
  },
  {
    question: "What are CulturePass Perks?",
    answer:
      "Perks are exclusive discounts and offers available to CulturePass members. Visit the Perks tab to browse current deals from local businesses.",
  },
  {
    question: "How do I save an event?",
    answer:
      "Tap the bookmark icon on any event card to save it. You can view all saved events from your Profile tab.",
  },
  {
    question: "How can I edit my profile?",
    answer:
      "Go to your Profile tab, tap the edit icon in the top right corner, update your details, and tap 'Save Changes'.",
  },
];

const CONTACT_OPTIONS = [
  {
    icon: "mail",
    label: "Email Support",
    description: "support@culturepass.com.au",
    action: () => Linking.openURL("mailto:support@culturepass.com.au"),
  },
  {
    icon: "logo-instagram",
    label: "Instagram",
    description: "@culturepassau",
    action: () => Linking.openURL("https://instagram.com/culturepassau"),
  },
  {
    icon: "globe",
    label: "Website",
    description: "www.culturepass.com.au",
    action: () => Linking.openURL("https://www.culturepass.com.au"),
  },
];

function FAQItem({ faq }: { faq: FAQ }) {
  const [expanded, setExpanded] = useState(false);

  return (
    <Pressable
      onPress={() => {
        if (Platform.OS !== "web") Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        setExpanded(!expanded);
      }}
      style={styles.faqItem}
    >
      <View style={styles.faqHeader}>
        <Text style={styles.faqQuestion}>{faq.question}</Text>
        <Ionicons
          name={expanded ? "chevron-up" : "chevron-down"}
          size={18}
          color={Colors.light.textTertiary}
        />
      </View>
      {expanded && <Text style={styles.faqAnswer}>{faq.answer}</Text>}
    </Pressable>
  );
}

export default function HelpSupportScreen() {
  const insets = useSafeAreaInsets();
  const webTopInset = Platform.OS === "web" ? 67 : 0;

  return (
    <View style={styles.container}>
      <View style={[styles.header, { paddingTop: insets.top + webTopInset + 12 }]}>
        <Pressable onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={22} color={Colors.light.text} />
        </Pressable>
        <Text style={styles.headerTitle}>Help & Support</Text>
        <View style={{ width: 36 }} />
      </View>

      <ScrollView
        style={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 40 }}
      >
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Frequently Asked Questions</Text>
          <View style={styles.sectionCard}>
            {FAQS.map((faq, idx) => (
              <View key={idx}>
                <FAQItem faq={faq} />
                {idx < FAQS.length - 1 && <View style={styles.divider} />}
              </View>
            ))}
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Contact Us</Text>
          <View style={styles.sectionCard}>
            {CONTACT_OPTIONS.map((item, idx) => (
              <Pressable
                key={idx}
                onPress={() => {
                  if (Platform.OS !== "web") Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  item.action();
                }}
                style={({ pressed }) => [
                  styles.contactRow,
                  { opacity: pressed ? 0.7 : 1 },
                  idx < CONTACT_OPTIONS.length - 1 && { borderBottomWidth: 1, borderBottomColor: Colors.light.borderLight },
                ]}
              >
                <View style={styles.contactIcon}>
                  <Ionicons name={item.icon as any} size={20} color={Colors.light.primary} />
                </View>
                <View style={styles.contactInfo}>
                  <Text style={styles.contactLabel}>{item.label}</Text>
                  <Text style={styles.contactDesc}>{item.description}</Text>
                </View>
                <Ionicons name="open-outline" size={16} color={Colors.light.textTertiary} />
              </Pressable>
            ))}
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Community Guidelines</Text>
          <View style={styles.sectionCard}>
            <Pressable style={styles.contactRow}>
              <View style={[styles.contactIcon, { backgroundColor: Colors.light.secondary + "10" }]}>
                <Ionicons name="document-text" size={20} color={Colors.light.secondary} />
              </View>
              <View style={styles.contactInfo}>
                <Text style={styles.contactLabel}>Terms of Service</Text>
                <Text style={styles.contactDesc}>Read our terms and conditions</Text>
              </View>
              <Ionicons name="chevron-forward" size={16} color={Colors.light.textTertiary} />
            </Pressable>
            <Pressable style={[styles.contactRow, { borderTopWidth: 1, borderTopColor: Colors.light.borderLight }]}>
              <View style={[styles.contactIcon, { backgroundColor: Colors.light.secondary + "10" }]}>
                <Ionicons name="lock-closed" size={20} color={Colors.light.secondary} />
              </View>
              <View style={styles.contactInfo}>
                <Text style={styles.contactLabel}>Privacy Policy</Text>
                <Text style={styles.contactDesc}>How we handle your data</Text>
              </View>
              <Ionicons name="chevron-forward" size={16} color={Colors.light.textTertiary} />
            </Pressable>
          </View>
        </View>
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
    padding: 20,
  },
  section: {
    gap: 10,
    marginBottom: 24,
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
  faqItem: {
    padding: 16,
  },
  faqHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
  },
  faqQuestion: {
    fontSize: 14,
    fontFamily: "Poppins_600SemiBold",
    color: Colors.light.text,
    flex: 1,
  },
  faqAnswer: {
    fontSize: 13,
    fontFamily: "Poppins_400Regular",
    color: Colors.light.textSecondary,
    marginTop: 10,
    lineHeight: 20,
  },
  divider: {
    height: 1,
    backgroundColor: Colors.light.borderLight,
    marginHorizontal: 16,
  },
  contactRow: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    gap: 12,
  },
  contactIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: Colors.light.primary + "10",
    alignItems: "center",
    justifyContent: "center",
  },
  contactInfo: {
    flex: 1,
  },
  contactLabel: {
    fontSize: 15,
    fontFamily: "Poppins_600SemiBold",
    color: Colors.light.text,
  },
  contactDesc: {
    fontSize: 12,
    fontFamily: "Poppins_400Regular",
    color: Colors.light.textSecondary,
    marginTop: 1,
  },
});
