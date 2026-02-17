import AsyncStorage from "@react-native-async-storage/async-storage";
import type { UserProfile } from "./data";

const SAVED_EVENTS_KEY = "culturepass_saved_events";
const USER_PROFILE_KEY = "culturepass_user_profile";

const defaultProfile: UserProfile = {
  name: "Guest User",
  email: "",
  city: "Sydney",
  state: "NSW",
  cpid: "CP-U-GUEST",
  savedEvents: [],
  memberOf: [],
};

export async function getSavedEventIds(): Promise<string[]> {
  try {
    const data = await AsyncStorage.getItem(SAVED_EVENTS_KEY);
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
}

export async function toggleSaveEvent(eventId: string): Promise<boolean> {
  const saved = await getSavedEventIds();
  const index = saved.indexOf(eventId);
  if (index >= 0) {
    saved.splice(index, 1);
  } else {
    saved.push(eventId);
  }
  await AsyncStorage.setItem(SAVED_EVENTS_KEY, JSON.stringify(saved));
  return index < 0;
}

export async function getUserProfile(): Promise<UserProfile> {
  try {
    const data = await AsyncStorage.getItem(USER_PROFILE_KEY);
    return data ? JSON.parse(data) : defaultProfile;
  } catch {
    return defaultProfile;
  }
}

export async function saveUserProfile(profile: UserProfile): Promise<void> {
  await AsyncStorage.setItem(USER_PROFILE_KEY, JSON.stringify(profile));
}
