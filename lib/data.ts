export interface Event {
  id: string;
  title: string;
  description: string;
  category: string;
  date: string;
  time: string;
  endTime: string;
  venue: string;
  city: string;
  state: string;
  imageUrl: string | null;
  price: number;
  currency: string | null;
  orgId: string | null;
  orgName: string | null;
  featured: boolean | null;
  trending: boolean | null;
  ticketsAvailable: number | null;
  ticketsSold: number | null;
  cpid: string | null;
  published: boolean | null;
  createdAt: string | null;
}

export type EventCategory = "Music" | "Dance" | "Festival" | "Food" | "Theatre" | "Film" | "Cultural" | "Sports" | "Literature" | "Workshop";

export interface Organisation {
  id: string;
  name: string;
  description: string;
  city: string;
  state: string;
  memberCount: number | null;
  imageUrl: string | null;
  cpid: string | null;
  established: string | null;
  categories: string[] | null;
}

export interface Business {
  id: string;
  name: string;
  description: string;
  category: string;
  city: string;
  state: string;
  phone: string | null;
  website: string | null;
  imageUrl: string | null;
  cpid: string | null;
  rating: number | null;
  isSponsor: boolean | null;
}

export interface Artist {
  id: string;
  name: string;
  genre: string;
  bio: string;
  imageUrl: string | null;
  city: string;
  state: string;
  featured: boolean | null;
  cpid: string | null;
  performances: number | null;
  slug: string | null;
}

export interface Perk {
  id: string;
  title: string;
  description: string;
  businessName: string;
  discount: string;
  code: string;
  validUntil: string;
  category: string | null;
  imageUrl: string | null;
}

export interface UserProfile {
  id: string;
  username: string;
  name: string;
  email: string | null;
  city: string | null;
  state: string | null;
  cpid: string | null;
  savedEvents: string[] | null;
  memberOf: string[] | null;
  roleGlobal: string | null;
}

export const EVENT_CATEGORIES: EventCategory[] = [
  "Music", "Dance", "Festival", "Food", "Theatre", "Film", "Cultural", "Sports", "Literature", "Workshop"
];

export const CATEGORY_ICONS: Record<string, { family: string; name: string }> = {
  Music: { family: "Ionicons", name: "musical-notes" },
  Dance: { family: "MaterialCommunityIcons", name: "dance-ballroom" },
  Festival: { family: "MaterialCommunityIcons", name: "party-popper" },
  Food: { family: "Ionicons", name: "restaurant" },
  Theatre: { family: "MaterialCommunityIcons", name: "drama-masks" },
  Film: { family: "Ionicons", name: "film" },
  Cultural: { family: "MaterialCommunityIcons", name: "temple-hindu" },
  Sports: { family: "Ionicons", name: "football" },
  Literature: { family: "Ionicons", name: "book" },
  Workshop: { family: "Ionicons", name: "construct" },
};

export const CATEGORY_COLORS: Record<string, string> = {
  Music: "#E2725B",
  Dance: "#9B59B6",
  Festival: "#D4A017",
  Food: "#E67E22",
  Theatre: "#1A535C",
  Film: "#3498DB",
  Cultural: "#8E44AD",
  Sports: "#E74C3C",
  Literature: "#27AE60",
  Workshop: "#2ECC71",
};

export const AUSTRALIAN_CITIES = [
  "Sydney", "Melbourne", "Brisbane", "Perth", "Adelaide",
  "Gold Coast", "Canberra", "Hobart", "Darwin",
];
