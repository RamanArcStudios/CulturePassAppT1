import React, { useState, useCallback } from "react";
import {
  View,
  Text,
  TextInput,
  Pressable,
  StyleSheet,
  Platform,
  Alert,
  ActivityIndicator,
  KeyboardAvoidingView,
  ScrollView,
  Modal,
  Linking,
} from "react-native";
import { router, useNavigation } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import * as Haptics from "expo-haptics";
import Colors from "@/constants/colors";
import { useAuth } from "@/lib/auth";

type AuthMode = "login" | "signup";

export default function AuthScreen() {
  const insets = useSafeAreaInsets();
  const { login, register, loginWithGoogle } = useAuth();
  const navigation = useNavigation();
  const goBack = () => navigation.canGoBack() ? router.back() : router.replace("/");
  const [googleLoading, setGoogleLoading] = useState(false);
  const [mode, setMode] = useState<AuthMode>("login");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [city, setCity] = useState("Sydney");
  const [state, setState] = useState("NSW");
  const [country, setCountry] = useState("Australia");
  const [phone, setPhone] = useState("");
  const [referralCode, setReferralCode] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [forgotEmail, setForgotEmail] = useState("");
  const [forgotSent, setForgotSent] = useState(false);
  const [showForgot, setShowForgot] = useState(false);

  const handleSubmit = useCallback(async () => {
    setError("");
    if (!username.trim() || !password.trim()) {
      setError("Username and password are required");
      return;
    }
    if (mode === "signup" && !name.trim()) {
      setError("Full name is required");
      return;
    }
    if (password.length < 6) {
      setError("Password must be at least 6 characters");
      return;
    }

    setLoading(true);
    try {
      if (mode === "login") {
        await login(username.trim(), password);
      } else {
        await register({
          username: username.trim(),
          password,
          name: name.trim(),
          email: email.trim(),
          city: city.trim(),
          state: state.trim(),
          country: country.trim(),
          phone: phone.trim(),
          referralCode: referralCode.trim() || undefined,
        });
      }
      if (Platform.OS !== "web") Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      goBack();
    } catch (err: any) {
      const msg = err.message || "Something went wrong";
      if (msg.includes("409")) {
        setError("Username already taken. Try a different one.");
      } else if (msg.includes("401")) {
        setError("Invalid username or password");
      } else {
        setError(msg);
      }
    } finally {
      setLoading(false);
    }
  }, [mode, username, password, name, email, city, state, country, phone, referralCode, login, register]);

  const handleForgotPassword = useCallback(async () => {
    if (!forgotEmail.trim()) {
      setError("Please enter your email address");
      return;
    }
    setLoading(true);
    try {
      const { apiRequest } = await import("@/lib/query-client");
      await apiRequest("POST", "/api/auth/forgot-password", { email: forgotEmail.trim() });
      setForgotSent(true);
    } catch {
      setError("Failed to send reset email. Try again.");
    } finally {
      setLoading(false);
    }
  }, [forgotEmail]);

  const handleGoogleLogin = useCallback(async () => {
    setError("");
    setGoogleLoading(true);
    try {
      const user = await loginWithGoogle();
      if (user) {
        if (Platform.OS !== "web") Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        goBack();
      }
    } catch (err: any) {
      setError(err.message || "Google sign-in failed");
    } finally {
      setGoogleLoading(false);
    }
  }, [loginWithGoogle, goBack]);

  const toggleMode = () => {
    setMode(m => (m === "login" ? "signup" : "login"));
    setError("");
  };

  const webTopInset = Platform.OS === "web" ? 67 : 0;

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      keyboardVerticalOffset={90}
    >
      <ScrollView
        style={styles.container}
        contentContainerStyle={{ paddingBottom: 60 }}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <LinearGradient
          colors={[Colors.light.secondary, Colors.light.secondaryLight]}
          style={[styles.headerGradient, { paddingTop: insets.top + webTopInset + 16 }]}
        >
          <Pressable onPress={goBack} style={styles.closeBtn}>
            <Ionicons name="close" size={24} color="#fff" />
          </Pressable>
          <View style={styles.headerContent}>
            <View style={styles.logoContainer}>
              <Ionicons name="compass" size={40} color="#fff" />
            </View>
            <Text style={styles.headerTitle}>CulturePass</Text>
            <Text style={styles.headerSubtitle}>
              {mode === "login" ? "Welcome back" : "Join the community"}
            </Text>
          </View>
        </LinearGradient>

        <View style={styles.formContainer}>
          <Pressable
            onPress={handleGoogleLogin}
            disabled={googleLoading}
            style={({ pressed }) => [
              styles.googleBtn,
              { opacity: googleLoading ? 0.6 : pressed ? 0.9 : 1 },
            ]}
            testID="auth-google"
          >
            {googleLoading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <>
                <Ionicons name="logo-google" size={20} color="#fff" />
                <Text style={styles.googleBtnText}>Sign in with Google</Text>
              </>
            )}
          </Pressable>

          <View style={styles.dividerRow}>
            <View style={styles.dividerLine} />
            <Text style={styles.dividerText}>or</Text>
            <View style={styles.dividerLine} />
          </View>

          <View style={styles.modeToggle}>
            <Pressable
              onPress={() => { setMode("login"); setError(""); }}
              style={[styles.modeBtn, mode === "login" && styles.modeBtnActive]}
            >
              <Text style={[styles.modeBtnText, mode === "login" && styles.modeBtnTextActive]}>
                Log In
              </Text>
            </Pressable>
            <Pressable
              onPress={() => { setMode("signup"); setError(""); }}
              style={[styles.modeBtn, mode === "signup" && styles.modeBtnActive]}
            >
              <Text style={[styles.modeBtnText, mode === "signup" && styles.modeBtnTextActive]}>
                Sign Up
              </Text>
            </Pressable>
          </View>

          {!!error && (
            <View style={styles.errorBox}>
              <Ionicons name="alert-circle" size={16} color={Colors.light.error} />
              <Text style={styles.errorText}>{error}</Text>
            </View>
          )}

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Username</Text>
            <View style={styles.inputContainer}>
              <Ionicons name="person-outline" size={18} color={Colors.light.textTertiary} />
              <TextInput
                style={styles.input}
                placeholder="Enter username"
                placeholderTextColor={Colors.light.textTertiary}
                value={username}
                onChangeText={setUsername}
                autoCapitalize="none"
                autoCorrect={false}
                testID="auth-username"
              />
            </View>
          </View>

          {mode === "signup" && (
            <>
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Full Name</Text>
                <View style={styles.inputContainer}>
                  <Ionicons name="person-circle-outline" size={18} color={Colors.light.textTertiary} />
                  <TextInput
                    style={styles.input}
                    placeholder="Your full name"
                    placeholderTextColor={Colors.light.textTertiary}
                    value={name}
                    onChangeText={setName}
                    testID="auth-name"
                  />
                </View>
              </View>
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Email</Text>
                <View style={styles.inputContainer}>
                  <Ionicons name="mail-outline" size={18} color={Colors.light.textTertiary} />
                  <TextInput
                    style={styles.input}
                    placeholder="your@email.com"
                    placeholderTextColor={Colors.light.textTertiary}
                    value={email}
                    onChangeText={setEmail}
                    keyboardType="email-address"
                    autoCapitalize="none"
                    testID="auth-email"
                  />
                </View>
              </View>
              <View style={styles.locationRow}>
                <View style={[styles.inputGroup, { flex: 1 }]}>
                  <Text style={styles.inputLabel}>City</Text>
                  <View style={styles.inputContainer}>
                    <TextInput
                      style={styles.input}
                      value={city}
                      onChangeText={setCity}
                      testID="auth-city"
                    />
                  </View>
                </View>
                <View style={[styles.inputGroup, { width: 100 }]}>
                  <Text style={styles.inputLabel}>State</Text>
                  <View style={styles.inputContainer}>
                    <TextInput
                      style={styles.input}
                      value={state}
                      onChangeText={setState}
                      testID="auth-state"
                    />
                  </View>
                </View>
              </View>
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Country</Text>
                <View style={styles.inputContainer}>
                  <Ionicons name="globe-outline" size={18} color={Colors.light.textTertiary} />
                  <TextInput
                    style={styles.input}
                    placeholder="Australia"
                    placeholderTextColor={Colors.light.textTertiary}
                    value={country}
                    onChangeText={setCountry}
                    testID="auth-country"
                  />
                </View>
              </View>
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Phone</Text>
                <View style={styles.inputContainer}>
                  <Ionicons name="call-outline" size={18} color={Colors.light.textTertiary} />
                  <TextInput
                    style={styles.input}
                    placeholder="+61 4XX XXX XXX"
                    placeholderTextColor={Colors.light.textTertiary}
                    value={phone}
                    onChangeText={setPhone}
                    keyboardType="phone-pad"
                    testID="auth-phone"
                  />
                </View>
              </View>
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Referral Code (optional)</Text>
                <View style={styles.inputContainer}>
                  <Ionicons name="gift-outline" size={18} color={Colors.light.textTertiary} />
                  <TextInput
                    style={styles.input}
                    placeholder="e.g. CP-ABC123"
                    placeholderTextColor={Colors.light.textTertiary}
                    value={referralCode}
                    onChangeText={setReferralCode}
                    autoCapitalize="characters"
                    testID="auth-referral"
                  />
                </View>
              </View>
            </>
          )}

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Password</Text>
            <View style={styles.inputContainer}>
              <Ionicons name="lock-closed-outline" size={18} color={Colors.light.textTertiary} />
              <TextInput
                style={styles.input}
                placeholder="Enter password"
                placeholderTextColor={Colors.light.textTertiary}
                value={password}
                onChangeText={setPassword}
                secureTextEntry={!showPassword}
                testID="auth-password"
              />
              <Pressable onPress={() => setShowPassword(p => !p)}>
                <Ionicons
                  name={showPassword ? "eye-off-outline" : "eye-outline"}
                  size={18}
                  color={Colors.light.textTertiary}
                />
              </Pressable>
            </View>
          </View>

          {mode === "login" && (
            <Pressable
              onPress={() => { setShowForgot(true); setError(""); setForgotSent(false); }}
              style={styles.forgotLink}
            >
              <Text style={styles.forgotText}>Forgot password?</Text>
            </Pressable>
          )}

          <Pressable
            onPress={handleSubmit}
            disabled={loading}
            style={({ pressed }) => [
              styles.submitBtn,
              { opacity: loading ? 0.6 : pressed ? 0.9 : 1 },
            ]}
            testID="auth-submit"
          >
            <LinearGradient
              colors={[Colors.light.primary, Colors.light.primaryDark]}
              style={styles.submitBtnGradient}
            >
              {loading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <>
                  <Ionicons name={mode === "login" ? "log-in-outline" : "person-add-outline"} size={20} color="#fff" />
                  <Text style={styles.submitBtnText}>
                    {mode === "login" ? "Log In" : "Create Account"}
                  </Text>
                </>
              )}
            </LinearGradient>
          </Pressable>

          <Pressable onPress={toggleMode} style={styles.switchRow}>
            <Text style={styles.switchText}>
              {mode === "login" ? "Don't have an account?" : "Already have an account?"}
            </Text>
            <Text style={styles.switchLink}>
              {mode === "login" ? " Sign Up" : " Log In"}
            </Text>
          </Pressable>
        </View>
      </ScrollView>

      <Modal visible={showForgot} transparent animationType="fade">
        <Pressable style={styles.modalOverlay} onPress={() => setShowForgot(false)}>
          <Pressable style={[styles.forgotModal, { paddingBottom: insets.bottom + 20 }]} onPress={(e) => e.stopPropagation()}>
            {forgotSent ? (
              <View style={{ alignItems: "center" }}>
                <Ionicons name="checkmark-circle" size={56} color={Colors.light.success} />
                <Text style={styles.forgotTitle}>Check Your Email</Text>
                <Text style={styles.forgotDesc}>
                  If an account with that email exists, we&apos;ve sent a password reset link. Check your inbox and spam folder.
                </Text>
                <Pressable
                  onPress={() => setShowForgot(false)}
                  style={styles.forgotSubmitBtn}
                >
                  <Text style={styles.forgotSubmitText}>Done</Text>
                </Pressable>
              </View>
            ) : (
              <>
                <Text style={styles.forgotTitle}>Reset Password</Text>
                <Text style={styles.forgotDesc}>
                  Enter your email address and we&apos;ll send you a link to reset your password.
                </Text>
                {!!error && (
                  <View style={[styles.errorBox, { marginBottom: 12 }]}>
                    <Ionicons name="alert-circle" size={16} color={Colors.light.error} />
                    <Text style={styles.errorText}>{error}</Text>
                  </View>
                )}
                <View style={styles.inputContainer}>
                  <Ionicons name="mail-outline" size={18} color={Colors.light.textTertiary} />
                  <TextInput
                    style={styles.input}
                    placeholder="your@email.com"
                    placeholderTextColor={Colors.light.textTertiary}
                    value={forgotEmail}
                    onChangeText={setForgotEmail}
                    keyboardType="email-address"
                    autoCapitalize="none"
                  />
                </View>
                <Pressable
                  onPress={handleForgotPassword}
                  disabled={loading}
                  style={[styles.forgotSubmitBtn, { opacity: loading ? 0.6 : 1 }]}
                >
                  {loading ? (
                    <ActivityIndicator color="#fff" />
                  ) : (
                    <Text style={styles.forgotSubmitText}>Send Reset Link</Text>
                  )}
                </Pressable>
                <Pressable onPress={() => setShowForgot(false)} style={{ alignSelf: "center", marginTop: 12 }}>
                  <Text style={{ fontFamily: "Poppins_500Medium", color: Colors.light.textSecondary }}>Cancel</Text>
                </Pressable>
              </>
            )}
          </Pressable>
        </Pressable>
      </Modal>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.light.background,
  },
  headerGradient: {
    paddingHorizontal: 20,
    paddingBottom: 32,
    borderBottomLeftRadius: 28,
    borderBottomRightRadius: 28,
  },
  closeBtn: {
    alignSelf: "flex-end",
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "rgba(255,255,255,0.2)",
    alignItems: "center",
    justifyContent: "center",
  },
  headerContent: {
    alignItems: "center",
    marginTop: 8,
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
  headerTitle: {
    fontSize: 26,
    fontFamily: "Poppins_700Bold",
    color: "#fff",
  },
  headerSubtitle: {
    fontSize: 14,
    fontFamily: "Poppins_400Regular",
    color: "rgba(255,255,255,0.8)",
    marginTop: 4,
  },
  formContainer: {
    padding: 20,
    marginTop: 8,
  },
  modeToggle: {
    flexDirection: "row",
    backgroundColor: Colors.light.surfaceElevated,
    borderRadius: 14,
    padding: 4,
    marginBottom: 20,
  },
  modeBtn: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 12,
    alignItems: "center",
  },
  modeBtnActive: {
    backgroundColor: Colors.light.primary,
  },
  modeBtnText: {
    fontSize: 14,
    fontFamily: "Poppins_600SemiBold",
    color: Colors.light.textSecondary,
  },
  modeBtnTextActive: {
    color: "#fff",
  },
  errorBox: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: Colors.light.error + "10",
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 12,
    marginBottom: 16,
  },
  errorText: {
    flex: 1,
    fontSize: 13,
    fontFamily: "Poppins_500Medium",
    color: Colors.light.error,
  },
  inputGroup: {
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 13,
    fontFamily: "Poppins_600SemiBold",
    color: Colors.light.text,
    marginBottom: 6,
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.light.surface,
    borderWidth: 1,
    borderColor: Colors.light.borderLight,
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 12,
    gap: 10,
  },
  input: {
    flex: 1,
    fontSize: 14,
    fontFamily: "Poppins_400Regular",
    color: Colors.light.text,
    padding: 0,
  },
  locationRow: {
    flexDirection: "row",
    gap: 12,
  },
  submitBtn: {
    marginTop: 8,
    borderRadius: 16,
    overflow: "hidden",
  },
  submitBtnGradient: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    paddingVertical: 16,
    borderRadius: 16,
  },
  submitBtnText: {
    fontSize: 16,
    fontFamily: "Poppins_700Bold",
    color: "#fff",
  },
  switchRow: {
    flexDirection: "row",
    justifyContent: "center",
    marginTop: 20,
  },
  switchText: {
    fontSize: 14,
    fontFamily: "Poppins_400Regular",
    color: Colors.light.textSecondary,
  },
  switchLink: {
    fontSize: 14,
    fontFamily: "Poppins_700Bold",
    color: Colors.light.primary,
  },
  forgotLink: {
    alignSelf: "flex-end",
    marginTop: -8,
    marginBottom: 8,
  },
  forgotText: {
    fontSize: 13,
    fontFamily: "Poppins_500Medium",
    color: Colors.light.secondary,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.4)",
    justifyContent: "center",
    alignItems: "center",
  },
  forgotModal: {
    backgroundColor: "#fff",
    borderRadius: 24,
    padding: 28,
    width: "90%",
    maxWidth: 400,
  },
  forgotTitle: {
    fontFamily: "Poppins_700Bold",
    fontSize: 22,
    color: Colors.light.text,
    marginTop: 12,
    marginBottom: 8,
    textAlign: "center" as const,
  },
  forgotDesc: {
    fontFamily: "Poppins_400Regular",
    fontSize: 14,
    color: Colors.light.textSecondary,
    textAlign: "center" as const,
    marginBottom: 20,
    lineHeight: 20,
  },
  forgotSubmitBtn: {
    backgroundColor: Colors.light.secondary,
    paddingVertical: 14,
    borderRadius: 14,
    alignItems: "center" as const,
    marginTop: 16,
  },
  forgotSubmitText: {
    fontFamily: "Poppins_600SemiBold",
    fontSize: 16,
    color: "#fff",
  },
  googleBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    backgroundColor: "#4285F4",
    paddingVertical: 16,
    borderRadius: 16,
    marginBottom: 16,
  },
  googleBtnText: {
    fontSize: 16,
    fontFamily: "Poppins_700Bold",
    color: "#fff",
  },
  dividerRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: Colors.light.borderLight,
  },
  dividerText: {
    paddingHorizontal: 16,
    fontFamily: "Poppins_500Medium",
    fontSize: 13,
    color: Colors.light.textTertiary,
  },
});
