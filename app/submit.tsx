import React, { useState } from "react";
import {
  View,
  Text,
  ScrollView,
  TextInput,
  Pressable,
  StyleSheet,
  Alert,
  ActivityIndicator,
  Platform,
  KeyboardAvoidingView,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons, Feather } from "@expo/vector-icons";
import { router, useNavigation } from "expo-router";
import { useAuth } from "@/lib/auth";
import { apiRequest, queryClient } from "@/lib/query-client";
import { EVENT_CATEGORIES } from "@/lib/data";
import Colors from "@/constants/colors";

type SubmissionType = "organisation" | "business" | "artist";

const STATES = ["NSW", "VIC", "QLD", "WA", "SA", "TAS", "ACT", "NT"];

const TABS: { key: SubmissionType; label: string; icon: string }[] = [
  { key: "organisation", label: "Organisation", icon: "people" },
  { key: "business", label: "Business", icon: "briefcase" },
  { key: "artist", label: "Artist", icon: "mic" },
];

export default function SubmitScreen() {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation();
  const { isAuthenticated } = useAuth();
  const [type, setType] = useState<SubmissionType>("organisation");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const [orgName, setOrgName] = useState("");
  const [orgDescription, setOrgDescription] = useState("");
  const [orgCity, setOrgCity] = useState("");
  const [orgState, setOrgState] = useState("NSW");
  const [orgEstablished, setOrgEstablished] = useState("");
  const [orgCategories, setOrgCategories] = useState<string[]>([]);

  const [bizName, setBizName] = useState("");
  const [bizDescription, setBizDescription] = useState("");
  const [bizCategory, setBizCategory] = useState("");
  const [bizCity, setBizCity] = useState("");
  const [bizState, setBizState] = useState("NSW");
  const [bizPhone, setBizPhone] = useState("");
  const [bizWebsite, setBizWebsite] = useState("");

  const [orgWebsite, setOrgWebsite] = useState("");
  const [orgFacebook, setOrgFacebook] = useState("");
  const [orgInstagram, setOrgInstagram] = useState("");

  const [bizFacebook, setBizFacebook] = useState("");
  const [bizInstagram, setBizInstagram] = useState("");

  const [artName, setArtName] = useState("");
  const [artGenre, setArtGenre] = useState("");
  const [artBio, setArtBio] = useState("");
  const [artCity, setArtCity] = useState("");
  const [artState, setArtState] = useState("NSW");
  const [artWebsite, setArtWebsite] = useState("");
  const [artFacebook, setArtFacebook] = useState("");
  const [artInstagram, setArtInstagram] = useState("");

  const goBack = () =>
    navigation.canGoBack() ? router.back() : router.replace("/");

  const webTopInset = Platform.OS === "web" ? 67 : 0;

  const resetFields = () => {
    setOrgName("");
    setOrgDescription("");
    setOrgCity("");
    setOrgState("NSW");
    setOrgEstablished("");
    setOrgCategories([]);
    setBizName("");
    setBizDescription("");
    setBizCategory("");
    setBizCity("");
    setBizState("NSW");
    setBizPhone("");
    setBizWebsite("");
    setBizFacebook("");
    setBizInstagram("");
    setOrgWebsite("");
    setOrgFacebook("");
    setOrgInstagram("");
    setArtName("");
    setArtGenre("");
    setArtBio("");
    setArtCity("");
    setArtState("NSW");
    setArtWebsite("");
    setArtFacebook("");
    setArtInstagram("");
  };

  const validate = (): string | null => {
    if (type === "organisation") {
      if (!orgName.trim()) return "Organisation name is required";
      if (!orgDescription.trim()) return "Description is required";
    } else if (type === "business") {
      if (!bizName.trim()) return "Business name is required";
      if (!bizDescription.trim()) return "Description is required";
    } else {
      if (!artName.trim()) return "Artist name is required";
      if (!artBio.trim()) return "Bio is required";
    }
    return null;
  };

  const buildSocialLinks = (facebook: string, instagram: string) => {
    const links: Record<string, string> = {};
    if (facebook.trim()) links.facebook = facebook.trim();
    if (instagram.trim()) links.instagram = instagram.trim();
    return Object.keys(links).length > 0 ? links : null;
  };

  const buildPayload = () => {
    if (type === "organisation") {
      return {
        name: orgName.trim(),
        description: orgDescription.trim(),
        city: orgCity.trim(),
        state: orgState,
        established: orgEstablished.trim() || null,
        categories: orgCategories.length > 0 ? orgCategories : null,
        website: orgWebsite.trim() || null,
        socialLinks: buildSocialLinks(orgFacebook, orgInstagram),
      };
    } else if (type === "business") {
      return {
        name: bizName.trim(),
        description: bizDescription.trim(),
        category: bizCategory || null,
        city: bizCity.trim(),
        state: bizState,
        phone: bizPhone.trim() || null,
        website: bizWebsite.trim() || null,
        socialLinks: buildSocialLinks(bizFacebook, bizInstagram),
      };
    } else {
      return {
        name: artName.trim(),
        genre: artGenre.trim(),
        bio: artBio.trim(),
        city: artCity.trim(),
        state: artState,
        website: artWebsite.trim() || null,
        socialLinks: buildSocialLinks(artFacebook, artInstagram),
      };
    }
  };

  const handleSubmit = async () => {
    const error = validate();
    if (error) {
      Alert.alert("Validation Error", error);
      return;
    }
    setLoading(true);
    try {
      await apiRequest("POST", `/api/submit/${type}`, buildPayload());
      const queryMap: Record<SubmissionType, string> = {
        organisation: "/api/organisations",
        business: "/api/businesses",
        artist: "/api/artists",
      };
      queryClient.invalidateQueries({ queryKey: [queryMap[type]] });
      setSuccess(true);
    } catch (err: any) {
      const msg = err?.message || "Something went wrong. Please try again.";
      Alert.alert("Submission Failed", msg);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitAnother = () => {
    resetFields();
    setSuccess(false);
  };

  if (!isAuthenticated) {
    return (
      <View style={[styles.container, { paddingTop: insets.top + webTopInset }]}>
        <View style={styles.header}>
          <Pressable onPress={goBack} style={styles.backBtn}>
            <Ionicons name="arrow-back" size={22} color={Colors.light.text} />
          </Pressable>
          <Text style={styles.headerTitle}>Submit</Text>
          <View style={{ width: 36 }} />
        </View>
        <View style={styles.centeredMessage}>
          <Ionicons name="lock-closed-outline" size={48} color={Colors.light.textSecondary} />
          <Text style={styles.centeredTitle}>Sign In Required</Text>
          <Text style={styles.centeredSubtitle}>
            You need to be signed in to submit listings for review.
          </Text>
          <Pressable
            style={styles.authButton}
            onPress={() => router.push("/auth")}
          >
            <Text style={styles.authButtonText}>Sign In</Text>
          </Pressable>
        </View>
      </View>
    );
  }

  if (success) {
    return (
      <View style={[styles.container, { paddingTop: insets.top + webTopInset }]}>
        <View style={styles.header}>
          <Pressable onPress={goBack} style={styles.backBtn}>
            <Ionicons name="arrow-back" size={22} color={Colors.light.text} />
          </Pressable>
          <Text style={styles.headerTitle}>Submit</Text>
          <View style={{ width: 36 }} />
        </View>
        <View style={styles.centeredMessage}>
          <View style={styles.successCircle}>
            <Ionicons name="checkmark" size={40} color="#fff" />
          </View>
          <Text style={styles.centeredTitle}>Submitted!</Text>
          <Text style={styles.centeredSubtitle}>
            Your submission is pending review. We'll notify you once it's approved.
          </Text>
          <View style={styles.successActions}>
            <Pressable style={styles.outlineButton} onPress={handleSubmitAnother}>
              <Feather name="plus" size={18} color={Colors.light.primary} />
              <Text style={styles.outlineButtonText}>Submit Another</Text>
            </Pressable>
            <Pressable style={styles.filledButton} onPress={goBack}>
              <Text style={styles.filledButtonText}>Go Back</Text>
            </Pressable>
          </View>
        </View>
      </View>
    );
  }

  const toggleCategory = (cat: string) => {
    setOrgCategories((prev) =>
      prev.includes(cat) ? prev.filter((c) => c !== cat) : [...prev, cat]
    );
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top + webTopInset }]}>
      <View style={styles.header}>
        <Pressable onPress={goBack} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={22} color={Colors.light.text} />
        </Pressable>
        <Text style={styles.headerTitle}>Submit Listing</Text>
        <View style={{ width: 36 }} />
      </View>

      <View style={styles.tabRow}>
        {TABS.map((tab) => {
          const active = type === tab.key;
          return (
            <Pressable
              key={tab.key}
              style={[styles.tab, active && styles.tabActive]}
              onPress={() => setType(tab.key)}
            >
              <Ionicons
                name={tab.icon as any}
                size={16}
                color={active ? "#fff" : Colors.light.textSecondary}
              />
              <Text style={[styles.tabText, active && styles.tabTextActive]}>
                {tab.label}
              </Text>
            </Pressable>
          );
        })}
      </View>

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        keyboardVerticalOffset={0}
      >
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={[styles.scrollContent, { paddingBottom: insets.bottom + 24 }]}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {type === "organisation" && (
            <>
              <FormField label="Organisation Name" required>
                <TextInput
                  style={styles.input}
                  value={orgName}
                  onChangeText={setOrgName}
                  placeholder="e.g. Sydney Arts Collective"
                  placeholderTextColor={Colors.light.textTertiary}
                />
              </FormField>
              <FormField label="Description" required>
                <TextInput
                  style={[styles.input, styles.textArea]}
                  value={orgDescription}
                  onChangeText={setOrgDescription}
                  placeholder="Tell us about this organisation..."
                  placeholderTextColor={Colors.light.textTertiary}
                  multiline
                  numberOfLines={4}
                  textAlignVertical="top"
                />
              </FormField>
              <FormField label="City">
                <TextInput
                  style={styles.input}
                  value={orgCity}
                  onChangeText={setOrgCity}
                  placeholder="e.g. Sydney"
                  placeholderTextColor={Colors.light.textTertiary}
                />
              </FormField>
              <FormField label="State">
                <StateSelector value={orgState} onChange={setOrgState} />
              </FormField>
              <FormField label="Established Year">
                <TextInput
                  style={styles.input}
                  value={orgEstablished}
                  onChangeText={setOrgEstablished}
                  placeholder="e.g. 2015"
                  placeholderTextColor={Colors.light.textTertiary}
                  keyboardType="number-pad"
                  maxLength={4}
                />
              </FormField>
              <FormField label="Categories">
                <View style={styles.chipGrid}>
                  {EVENT_CATEGORIES.map((cat) => {
                    const selected = orgCategories.includes(cat);
                    return (
                      <Pressable
                        key={cat}
                        style={[styles.chip, selected && styles.chipSelected]}
                        onPress={() => toggleCategory(cat)}
                      >
                        <Text
                          style={[
                            styles.chipText,
                            selected && styles.chipTextSelected,
                          ]}
                        >
                          {cat}
                        </Text>
                      </Pressable>
                    );
                  })}
                </View>
              </FormField>
              <Text style={styles.socialHeader}>Social Links</Text>
              <FormField label="Website">
                <TextInput
                  style={styles.input}
                  value={orgWebsite}
                  onChangeText={setOrgWebsite}
                  placeholder="https://yourorganisation.com"
                  placeholderTextColor={Colors.light.textTertiary}
                  keyboardType="url"
                  autoCapitalize="none"
                />
              </FormField>
              <FormField label="Facebook">
                <TextInput
                  style={styles.input}
                  value={orgFacebook}
                  onChangeText={setOrgFacebook}
                  placeholder="https://facebook.com/yourpage"
                  placeholderTextColor={Colors.light.textTertiary}
                  keyboardType="url"
                  autoCapitalize="none"
                />
              </FormField>
              <FormField label="Instagram">
                <TextInput
                  style={styles.input}
                  value={orgInstagram}
                  onChangeText={setOrgInstagram}
                  placeholder="https://instagram.com/yourpage"
                  placeholderTextColor={Colors.light.textTertiary}
                  keyboardType="url"
                  autoCapitalize="none"
                />
              </FormField>
            </>
          )}

          {type === "business" && (
            <>
              <FormField label="Business Name" required>
                <TextInput
                  style={styles.input}
                  value={bizName}
                  onChangeText={setBizName}
                  placeholder="e.g. Outback Brewing Co."
                  placeholderTextColor={Colors.light.textTertiary}
                />
              </FormField>
              <FormField label="Description" required>
                <TextInput
                  style={[styles.input, styles.textArea]}
                  value={bizDescription}
                  onChangeText={setBizDescription}
                  placeholder="Describe this business..."
                  placeholderTextColor={Colors.light.textTertiary}
                  multiline
                  numberOfLines={4}
                  textAlignVertical="top"
                />
              </FormField>
              <FormField label="Category">
                <View style={styles.chipGrid}>
                  {EVENT_CATEGORIES.map((cat) => {
                    const selected = bizCategory === cat;
                    return (
                      <Pressable
                        key={cat}
                        style={[styles.chip, selected && styles.chipSelected]}
                        onPress={() => setBizCategory(selected ? "" : cat)}
                      >
                        <Text
                          style={[
                            styles.chipText,
                            selected && styles.chipTextSelected,
                          ]}
                        >
                          {cat}
                        </Text>
                      </Pressable>
                    );
                  })}
                </View>
              </FormField>
              <FormField label="City">
                <TextInput
                  style={styles.input}
                  value={bizCity}
                  onChangeText={setBizCity}
                  placeholder="e.g. Melbourne"
                  placeholderTextColor={Colors.light.textTertiary}
                />
              </FormField>
              <FormField label="State">
                <StateSelector value={bizState} onChange={setBizState} />
              </FormField>
              <FormField label="Phone">
                <TextInput
                  style={styles.input}
                  value={bizPhone}
                  onChangeText={setBizPhone}
                  placeholder="e.g. 0412 345 678"
                  placeholderTextColor={Colors.light.textTertiary}
                  keyboardType="phone-pad"
                />
              </FormField>
              <FormField label="Website">
                <TextInput
                  style={styles.input}
                  value={bizWebsite}
                  onChangeText={setBizWebsite}
                  placeholder="e.g. https://example.com.au"
                  placeholderTextColor={Colors.light.textTertiary}
                  keyboardType="url"
                  autoCapitalize="none"
                />
              </FormField>
              <Text style={styles.socialHeader}>Social Links</Text>
              <FormField label="Facebook">
                <TextInput
                  style={styles.input}
                  value={bizFacebook}
                  onChangeText={setBizFacebook}
                  placeholder="https://facebook.com/yourpage"
                  placeholderTextColor={Colors.light.textTertiary}
                  keyboardType="url"
                  autoCapitalize="none"
                />
              </FormField>
              <FormField label="Instagram">
                <TextInput
                  style={styles.input}
                  value={bizInstagram}
                  onChangeText={setBizInstagram}
                  placeholder="https://instagram.com/yourpage"
                  placeholderTextColor={Colors.light.textTertiary}
                  keyboardType="url"
                  autoCapitalize="none"
                />
              </FormField>
            </>
          )}

          {type === "artist" && (
            <>
              <FormField label="Artist / Stage Name" required>
                <TextInput
                  style={styles.input}
                  value={artName}
                  onChangeText={setArtName}
                  placeholder="e.g. DJ Wombat"
                  placeholderTextColor={Colors.light.textTertiary}
                />
              </FormField>
              <FormField label="Genre">
                <TextInput
                  style={styles.input}
                  value={artGenre}
                  onChangeText={setArtGenre}
                  placeholder="e.g. Electronic, Indie Rock"
                  placeholderTextColor={Colors.light.textTertiary}
                />
              </FormField>
              <FormField label="Bio" required>
                <TextInput
                  style={[styles.input, styles.textArea]}
                  value={artBio}
                  onChangeText={setArtBio}
                  placeholder="Tell us about this artist..."
                  placeholderTextColor={Colors.light.textTertiary}
                  multiline
                  numberOfLines={4}
                  textAlignVertical="top"
                />
              </FormField>
              <FormField label="City">
                <TextInput
                  style={styles.input}
                  value={artCity}
                  onChangeText={setArtCity}
                  placeholder="e.g. Brisbane"
                  placeholderTextColor={Colors.light.textTertiary}
                />
              </FormField>
              <FormField label="State">
                <StateSelector value={artState} onChange={setArtState} />
              </FormField>
              <Text style={styles.socialHeader}>Social Links</Text>
              <FormField label="Website">
                <TextInput
                  style={styles.input}
                  value={artWebsite}
                  onChangeText={setArtWebsite}
                  placeholder="https://yourwebsite.com"
                  placeholderTextColor={Colors.light.textTertiary}
                  keyboardType="url"
                  autoCapitalize="none"
                />
              </FormField>
              <FormField label="Facebook">
                <TextInput
                  style={styles.input}
                  value={artFacebook}
                  onChangeText={setArtFacebook}
                  placeholder="https://facebook.com/yourpage"
                  placeholderTextColor={Colors.light.textTertiary}
                  keyboardType="url"
                  autoCapitalize="none"
                />
              </FormField>
              <FormField label="Instagram">
                <TextInput
                  style={styles.input}
                  value={artInstagram}
                  onChangeText={setArtInstagram}
                  placeholder="https://instagram.com/yourpage"
                  placeholderTextColor={Colors.light.textTertiary}
                  keyboardType="url"
                  autoCapitalize="none"
                />
              </FormField>
            </>
          )}

          <Pressable
            style={[styles.submitButton, loading && styles.submitButtonDisabled]}
            onPress={handleSubmit}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#fff" size="small" />
            ) : (
              <>
                <Feather name="send" size={18} color="#fff" />
                <Text style={styles.submitButtonText}>Submit for Review</Text>
              </>
            )}
          </Pressable>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

function FormField({
  label,
  required,
  children,
}: {
  label: string;
  required?: boolean;
  children: React.ReactNode;
}) {
  return (
    <View style={styles.fieldContainer}>
      <Text style={styles.fieldLabel}>
        {label}
        {required && <Text style={styles.requiredStar}> *</Text>}
      </Text>
      {children}
    </View>
  );
}

function StateSelector({
  value,
  onChange,
}: {
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <View style={styles.stateRow}>
      {STATES.map((s) => {
        const active = value === s;
        return (
          <Pressable
            key={s}
            style={[styles.stateChip, active && styles.stateChipActive]}
            onPress={() => onChange(s)}
          >
            <Text
              style={[
                styles.stateChipText,
                active && styles.stateChipTextActive,
              ]}
            >
              {s}
            </Text>
          </Pressable>
        );
      })}
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
  tabRow: {
    flexDirection: "row",
    paddingHorizontal: 16,
    paddingTop: 14,
    paddingBottom: 6,
    gap: 8,
  },
  tab: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    paddingVertical: 10,
    borderRadius: 12,
    backgroundColor: Colors.light.surface,
    borderWidth: 1,
    borderColor: Colors.light.border,
  },
  tabActive: {
    backgroundColor: Colors.light.primary,
    borderColor: Colors.light.primary,
  },
  tabText: {
    fontSize: 13,
    fontFamily: "Poppins_600SemiBold",
    color: Colors.light.textSecondary,
  },
  tabTextActive: {
    color: "#fff",
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
    gap: 18,
  },
  socialHeader: {
    fontSize: 16,
    fontFamily: "Poppins_700Bold",
    color: Colors.light.text,
    marginTop: 8,
  },
  fieldContainer: {
    gap: 8,
  },
  fieldLabel: {
    fontSize: 14,
    fontFamily: "Poppins_600SemiBold",
    color: Colors.light.text,
  },
  requiredStar: {
    color: Colors.light.error,
    fontFamily: "Poppins_600SemiBold",
  },
  input: {
    backgroundColor: Colors.light.surface,
    borderWidth: 1,
    borderColor: Colors.light.border,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 15,
    fontFamily: "Poppins_400Regular",
    color: Colors.light.text,
  },
  textArea: {
    minHeight: 100,
    paddingTop: 12,
  },
  chipGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  chip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: Colors.light.surface,
    borderWidth: 1,
    borderColor: Colors.light.border,
  },
  chipSelected: {
    backgroundColor: Colors.light.primary,
    borderColor: Colors.light.primary,
  },
  chipText: {
    fontSize: 13,
    fontFamily: "Poppins_500Medium",
    color: Colors.light.textSecondary,
  },
  chipTextSelected: {
    color: "#fff",
  },
  stateRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  stateChip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 10,
    backgroundColor: Colors.light.surface,
    borderWidth: 1,
    borderColor: Colors.light.border,
  },
  stateChipActive: {
    backgroundColor: Colors.light.secondary,
    borderColor: Colors.light.secondary,
  },
  stateChipText: {
    fontSize: 13,
    fontFamily: "Poppins_600SemiBold",
    color: Colors.light.textSecondary,
  },
  stateChipTextActive: {
    color: "#fff",
  },
  submitButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    backgroundColor: Colors.light.primary,
    paddingVertical: 16,
    borderRadius: 14,
    marginTop: 8,
  },
  submitButtonDisabled: {
    opacity: 0.6,
  },
  submitButtonText: {
    fontSize: 16,
    fontFamily: "Poppins_700Bold",
    color: "#fff",
  },
  centeredMessage: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 40,
    gap: 12,
  },
  centeredTitle: {
    fontSize: 22,
    fontFamily: "Poppins_700Bold",
    color: Colors.light.text,
    marginTop: 8,
  },
  centeredSubtitle: {
    fontSize: 15,
    fontFamily: "Poppins_400Regular",
    color: Colors.light.textSecondary,
    textAlign: "center",
    lineHeight: 22,
  },
  authButton: {
    backgroundColor: Colors.light.primary,
    paddingHorizontal: 32,
    paddingVertical: 14,
    borderRadius: 12,
    marginTop: 12,
  },
  authButtonText: {
    fontSize: 16,
    fontFamily: "Poppins_700Bold",
    color: "#fff",
  },
  successCircle: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: Colors.light.success,
    alignItems: "center",
    justifyContent: "center",
  },
  successActions: {
    flexDirection: "column",
    gap: 12,
    marginTop: 16,
    width: "100%",
  },
  outlineButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingVertical: 14,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: Colors.light.primary,
  },
  outlineButtonText: {
    fontSize: 15,
    fontFamily: "Poppins_600SemiBold",
    color: Colors.light.primary,
  },
  filledButton: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 14,
    borderRadius: 12,
    backgroundColor: Colors.light.secondary,
  },
  filledButtonText: {
    fontSize: 15,
    fontFamily: "Poppins_600SemiBold",
    color: "#fff",
  },
});
