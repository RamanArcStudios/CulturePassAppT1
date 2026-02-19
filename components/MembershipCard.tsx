import React, { useState, useCallback } from "react";
import {
  View,
  Text,
  Modal,
  Pressable,
  StyleSheet,
  Platform,
  Alert,
  Linking,
  ActivityIndicator,
} from "react-native";
import { Image } from "expo-image";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import * as Haptics from "expo-haptics";
import Colors from "@/constants/colors";
import { getApiUrl } from "@/lib/query-client";

interface MembershipCardProps {
  visible: boolean;
  onClose: () => void;
  user: {
    id: string;
    name: string;
    cpid: string | null;
    city: string | null;
    state: string | null;
    createdAt: string | null;
    referralCode: string | null;
  };
}

export default function MembershipCard({ visible, onClose, user }: MembershipCardProps) {
  const [appleLoading, setAppleLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);

  const qrData = encodeURIComponent(`culturepass://member/${user.cpid || user.id}`);
  const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=220x220&data=${qrData}&color=1A1A1C&bgcolor=FFFFFF&margin=8`;

  const memberSince = user.createdAt
    ? new Date(user.createdAt).toLocaleDateString("en-AU", { month: "short", year: "numeric" })
    : "2024";

  const handleAppleWallet = useCallback(async () => {
    if (Platform.OS !== "web") Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setAppleLoading(true);
    try {
      const url = `${getApiUrl()}/api/wallet/apple/${user.id}`;
      if (Platform.OS === "web") {
        window.open(url, "_blank");
      } else {
        await Linking.openURL(url);
      }
    } catch (err: any) {
      Alert.alert("Apple Wallet", "Apple Wallet pass generation requires Apple Developer certificates. Please contact the app administrator to set this up.");
    } finally {
      setAppleLoading(false);
    }
  }, [user.id]);

  const handleGoogleWallet = useCallback(async () => {
    if (Platform.OS !== "web") Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setGoogleLoading(true);
    try {
      const res = await fetch(`${getApiUrl()}/api/wallet/google/${user.id}`);
      const data = await res.json();
      if (data.saveUrl) {
        if (Platform.OS === "web") {
          window.open(data.saveUrl, "_blank");
        } else {
          await Linking.openURL(data.saveUrl);
        }
      } else {
        Alert.alert("Google Wallet", data.message || "Google Wallet integration requires setup. Please contact the app administrator.");
      }
    } catch (err: any) {
      Alert.alert("Google Wallet", "Google Wallet pass generation requires Google Cloud setup. Please contact the app administrator.");
    } finally {
      setGoogleLoading(false);
    }
  }, [user.id]);

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <Pressable style={styles.overlay} onPress={onClose}>
        <Pressable style={styles.sheet} onPress={() => {}}>
          <View style={styles.handle} />

          <View style={styles.cardWrapper}>
            <LinearGradient
              colors={["#16656E", "#1E8A7E", "#2B8A83"]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.card}
            >
              <View style={styles.cardPattern}>
                {[...Array(6)].map((_, i) => (
                  <View key={i} style={[styles.patternCircle, {
                    top: (i % 3) * 80 - 20,
                    right: Math.floor(i / 3) * 90 - 30,
                    width: 100 + (i * 15),
                    height: 100 + (i * 15),
                    borderRadius: 50 + (i * 7.5),
                    opacity: 0.06 - (i * 0.008),
                  }]} />
                ))}
              </View>

              <View style={styles.cardHeader}>
                <View style={styles.cardLogo}>
                  <Ionicons name="compass" size={22} color="#fff" />
                </View>
                <View>
                  <Text style={styles.cardBrand}>CulturePass</Text>
                  <Text style={styles.cardType}>Member Card</Text>
                </View>
              </View>

              <View style={styles.cardBody}>
                <View style={styles.qrContainer}>
                  <View style={styles.qrFrame}>
                    <Image
                      source={{ uri: qrUrl }}
                      style={styles.qrImage}
                      contentFit="contain"
                      transition={200}
                    />
                  </View>
                </View>
              </View>

              <View style={styles.cardDetails}>
                <View style={styles.cardDetailRow}>
                  <View style={styles.cardDetailItem}>
                    <Text style={styles.cardDetailLabel}>MEMBER</Text>
                    <Text style={styles.cardDetailValue} numberOfLines={1}>{user.name}</Text>
                  </View>
                  <View style={[styles.cardDetailItem, { alignItems: "flex-end" }]}>
                    <Text style={styles.cardDetailLabel}>SINCE</Text>
                    <Text style={styles.cardDetailValue}>{memberSince}</Text>
                  </View>
                </View>
                <View style={styles.cardDetailRow}>
                  <View style={styles.cardDetailItem}>
                    <Text style={styles.cardDetailLabel}>ID</Text>
                    <Text style={styles.cardCpid}>{user.cpid || "MEMBER"}</Text>
                  </View>
                  <View style={[styles.cardDetailItem, { alignItems: "flex-end" }]}>
                    <Text style={styles.cardDetailLabel}>LOCATION</Text>
                    <Text style={styles.cardDetailValue} numberOfLines={1}>
                      {user.city || "AU"}{user.state ? `, ${user.state}` : ""}
                    </Text>
                  </View>
                </View>
              </View>

              <View style={styles.cardFooter}>
                <View style={styles.chipIcon}>
                  <View style={styles.chipLines}>
                    <View style={styles.chipLine} />
                    <View style={styles.chipLine} />
                    <View style={styles.chipLine} />
                  </View>
                </View>
                <Text style={styles.cardFooterText}>Scan QR to verify membership</Text>
              </View>
            </LinearGradient>
          </View>

          <Text style={styles.walletTitle}>Add to Wallet</Text>
          <Text style={styles.walletSubtext}>Save your membership card for quick access</Text>

          <View style={styles.walletBtns}>
            <Pressable
              onPress={handleAppleWallet}
              disabled={appleLoading}
              style={({ pressed }) => [styles.walletBtn, styles.appleBtn, { opacity: pressed ? 0.85 : 1 }]}
            >
              {appleLoading ? (
                <ActivityIndicator size="small" color="#fff" />
              ) : (
                <>
                  <Ionicons name="logo-apple" size={20} color="#fff" />
                  <Text style={styles.walletBtnText}>Add to Apple Wallet</Text>
                </>
              )}
            </Pressable>

            <Pressable
              onPress={handleGoogleWallet}
              disabled={googleLoading}
              style={({ pressed }) => [styles.walletBtn, styles.googleBtn, { opacity: pressed ? 0.85 : 1 }]}
            >
              {googleLoading ? (
                <ActivityIndicator size="small" color="#fff" />
              ) : (
                <>
                  <MaterialCommunityIcons name="google" size={18} color="#fff" />
                  <Text style={styles.walletBtnText}>Add to Google Wallet</Text>
                </>
              )}
            </Pressable>
          </View>

          <Pressable onPress={onClose} style={styles.closeBtn}>
            <Text style={styles.closeBtnText}>Close</Text>
          </Pressable>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.55)",
    justifyContent: "flex-end",
  },
  sheet: {
    backgroundColor: Colors.light.background,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    paddingHorizontal: 20,
    paddingBottom: Platform.OS === "web" ? 34 : 40,
    paddingTop: 12,
    maxHeight: "92%",
  },
  handle: {
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: Colors.light.border,
    alignSelf: "center",
    marginBottom: 16,
  },
  cardWrapper: {
    borderRadius: 20,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 16,
    elevation: 12,
  },
  card: {
    borderRadius: 20,
    padding: 22,
    minHeight: 380,
    overflow: "hidden",
  },
  cardPattern: {
    ...StyleSheet.absoluteFillObject,
    overflow: "hidden",
  },
  patternCircle: {
    position: "absolute",
    backgroundColor: "#fff",
  },
  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginBottom: 20,
  },
  cardLogo: {
    width: 38,
    height: 38,
    borderRadius: 12,
    backgroundColor: "rgba(255,255,255,0.18)",
    alignItems: "center",
    justifyContent: "center",
  },
  cardBrand: {
    fontSize: 18,
    fontFamily: "Poppins_700Bold",
    color: "#fff",
    letterSpacing: 0.5,
  },
  cardType: {
    fontSize: 11,
    fontFamily: "Poppins_500Medium",
    color: "rgba(255,255,255,0.7)",
    letterSpacing: 1,
    textTransform: "uppercase",
  },
  cardBody: {
    alignItems: "center",
    marginBottom: 20,
  },
  qrContainer: {
    alignItems: "center",
  },
  qrFrame: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  qrImage: {
    width: 150,
    height: 150,
  },
  cardDetails: {
    gap: 12,
    marginBottom: 16,
  },
  cardDetailRow: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  cardDetailItem: {
    flex: 1,
  },
  cardDetailLabel: {
    fontSize: 9,
    fontFamily: "Poppins_600SemiBold",
    color: "rgba(255,255,255,0.55)",
    letterSpacing: 1.5,
    marginBottom: 2,
  },
  cardDetailValue: {
    fontSize: 14,
    fontFamily: "Poppins_600SemiBold",
    color: "#fff",
  },
  cardCpid: {
    fontSize: 14,
    fontFamily: "Poppins_700Bold",
    color: Colors.light.accentLight,
    letterSpacing: 1,
  },
  cardFooter: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: "rgba(255,255,255,0.12)",
  },
  chipIcon: {
    width: 30,
    height: 22,
    borderRadius: 4,
    backgroundColor: "rgba(255,255,255,0.15)",
    justifyContent: "center",
    paddingHorizontal: 4,
    gap: 3,
  },
  chipLines: {
    gap: 3,
  },
  chipLine: {
    height: 1.5,
    backgroundColor: "rgba(255,255,255,0.3)",
    borderRadius: 1,
  },
  cardFooterText: {
    fontSize: 11,
    fontFamily: "Poppins_400Regular",
    color: "rgba(255,255,255,0.5)",
  },
  walletTitle: {
    fontSize: 18,
    fontFamily: "Poppins_700Bold",
    color: Colors.light.text,
    marginTop: 24,
    marginBottom: 4,
  },
  walletSubtext: {
    fontSize: 13,
    fontFamily: "Poppins_400Regular",
    color: Colors.light.textSecondary,
    marginBottom: 16,
  },
  walletBtns: {
    gap: 10,
    marginBottom: 16,
  },
  walletBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    paddingVertical: 14,
    borderRadius: 14,
  },
  appleBtn: {
    backgroundColor: "#000",
  },
  googleBtn: {
    backgroundColor: "#1a73e8",
  },
  walletBtnText: {
    fontSize: 15,
    fontFamily: "Poppins_600SemiBold",
    color: "#fff",
  },
  closeBtn: {
    alignItems: "center",
    paddingVertical: 12,
  },
  closeBtnText: {
    fontSize: 15,
    fontFamily: "Poppins_500Medium",
    color: Colors.light.textSecondary,
  },
});
