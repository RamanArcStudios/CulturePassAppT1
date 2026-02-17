export interface Event {
  id: string;
  title: string;
  description: string;
  category: EventCategory;
  date: string;
  time: string;
  endTime: string;
  venue: string;
  city: string;
  state: string;
  imageUrl: string;
  price: number;
  currency: string;
  orgId: string;
  orgName: string;
  featured: boolean;
  trending: boolean;
  ticketsAvailable: number;
  ticketsSold: number;
  cpid: string;
}

export type EventCategory = "Music" | "Dance" | "Festival" | "Food" | "Theatre" | "Movie" | "Workshop" | "Sports";

export interface Organisation {
  id: string;
  name: string;
  description: string;
  city: string;
  state: string;
  memberCount: number;
  imageUrl: string;
  cpid: string;
  established: string;
  categories: string[];
}

export interface Business {
  id: string;
  name: string;
  description: string;
  category: string;
  city: string;
  state: string;
  phone: string;
  website: string;
  imageUrl: string;
  cpid: string;
  rating: number;
}

export interface Artist {
  id: string;
  name: string;
  genre: string;
  bio: string;
  imageUrl: string;
  city: string;
  state: string;
  featured: boolean;
  cpid: string;
  performances: number;
}

export interface Perk {
  id: string;
  title: string;
  description: string;
  businessName: string;
  discount: string;
  code: string;
  validUntil: string;
  category: string;
  imageUrl: string;
}

export interface UserProfile {
  name: string;
  email: string;
  city: string;
  state: string;
  cpid: string;
  savedEvents: string[];
  memberOf: string[];
}

export const EVENT_CATEGORIES: EventCategory[] = [
  "Music", "Dance", "Festival", "Food", "Theatre", "Movie", "Workshop", "Sports"
];

export const CATEGORY_ICONS: Record<EventCategory, { family: string; name: string }> = {
  Music: { family: "Ionicons", name: "musical-notes" },
  Dance: { family: "MaterialCommunityIcons", name: "dance-ballroom" },
  Festival: { family: "MaterialCommunityIcons", name: "party-popper" },
  Food: { family: "Ionicons", name: "restaurant" },
  Theatre: { family: "MaterialCommunityIcons", name: "drama-masks" },
  Movie: { family: "Ionicons", name: "film" },
  Workshop: { family: "Ionicons", name: "construct" },
  Sports: { family: "Ionicons", name: "football" },
};

export const CATEGORY_COLORS: Record<EventCategory, string> = {
  Music: "#E2725B",
  Dance: "#9B59B6",
  Festival: "#D4A017",
  Food: "#E67E22",
  Theatre: "#1A535C",
  Movie: "#3498DB",
  Workshop: "#2ECC71",
  Sports: "#E74C3C",
};

export const AUSTRALIAN_CITIES = [
  "Sydney", "Melbourne", "Brisbane", "Perth", "Adelaide",
  "Gold Coast", "Canberra", "Hobart", "Darwin",
];

const sampleEvents: Event[] = [
  {
    id: "e1",
    title: "Kerala Piravi Celebration 2026",
    description: "Join us for a grand celebration of Kerala's formation day featuring traditional performances, authentic Kerala cuisine, and cultural showcases. Experience the richness of Malayalee heritage through Kathakali, Mohiniyattam, and contemporary performances.",
    category: "Festival",
    date: "2026-11-01",
    time: "10:00 AM",
    endTime: "6:00 PM",
    venue: "Sydney Olympic Park",
    city: "Sydney",
    state: "NSW",
    imageUrl: "https://images.unsplash.com/photo-1604871000636-074fa5117945?w=800",
    price: 25,
    currency: "AUD",
    orgId: "o1",
    orgName: "Kerala Association of NSW",
    featured: true,
    trending: true,
    ticketsAvailable: 500,
    ticketsSold: 342,
    cpid: "CP-E-AB3K7N",
  },
  {
    id: "e2",
    title: "Onam Festival Melbourne",
    description: "Celebrate the harvest festival of Kerala with traditional Onam Sadya, Thiruvathirakali, boat race replicas, and floral carpet (Pookalam) competitions. A day of joy, togetherness, and cultural pride.",
    category: "Festival",
    date: "2026-09-05",
    time: "9:00 AM",
    endTime: "5:00 PM",
    venue: "Melbourne Convention Centre",
    city: "Melbourne",
    state: "VIC",
    imageUrl: "https://images.unsplash.com/photo-1533174072545-7a4b6ad7a6c3?w=800",
    price: 30,
    currency: "AUD",
    orgId: "o2",
    orgName: "Malayalee Association of VIC",
    featured: true,
    trending: true,
    ticketsAvailable: 800,
    ticketsSold: 612,
    cpid: "CP-E-XY9M2P",
  },
  {
    id: "e3",
    title: "Classical Carnatic Evening",
    description: "An enchanting evening of Carnatic music featuring renowned vocalists and instrumentalists. Experience the divine melodies of South Indian classical tradition in an intimate setting.",
    category: "Music",
    date: "2026-03-15",
    time: "6:30 PM",
    endTime: "9:30 PM",
    venue: "City Recital Hall",
    city: "Sydney",
    state: "NSW",
    imageUrl: "https://images.unsplash.com/photo-1514320291840-2e0a9bf2a9ae?w=800",
    price: 45,
    currency: "AUD",
    orgId: "o1",
    orgName: "Kerala Association of NSW",
    featured: false,
    trending: true,
    ticketsAvailable: 200,
    ticketsSold: 156,
    cpid: "CP-E-QR4T8V",
  },
  {
    id: "e4",
    title: "Kathakali Workshop",
    description: "Learn the ancient art of Kathakali dance-drama in this intensive workshop led by Kalamandalam-trained artists. Includes makeup demonstration, mudras, and basic choreography.",
    category: "Workshop",
    date: "2026-04-20",
    time: "10:00 AM",
    endTime: "4:00 PM",
    venue: "Parramatta Town Hall",
    city: "Sydney",
    state: "NSW",
    imageUrl: "https://images.unsplash.com/photo-1547153760-18fc86c581c4?w=800",
    price: 60,
    currency: "AUD",
    orgId: "o3",
    orgName: "Indian Arts Academy",
    featured: false,
    trending: false,
    ticketsAvailable: 30,
    ticketsSold: 22,
    cpid: "CP-E-LM6W3J",
  },
  {
    id: "e5",
    title: "Mohiniyattam Performance",
    description: "Witness the grace and beauty of Mohiniyattam, Kerala's classical dance form, performed by award-winning dancers. A mesmerising evening of traditional elegance.",
    category: "Dance",
    date: "2026-05-10",
    time: "7:00 PM",
    endTime: "9:00 PM",
    venue: "Brisbane Powerhouse",
    city: "Brisbane",
    state: "QLD",
    imageUrl: "https://images.unsplash.com/photo-1508700929628-666bc8bd84ea?w=800",
    price: 35,
    currency: "AUD",
    orgId: "o4",
    orgName: "QLD Malayalee Assoc.",
    featured: true,
    trending: false,
    ticketsAvailable: 150,
    ticketsSold: 89,
    cpid: "CP-E-FG2H5D",
  },
  {
    id: "e6",
    title: "Kerala Food Festival",
    description: "A culinary journey through Kerala's diverse cuisine. From Malabar biryani to Travancore seafood, enjoy authentic dishes prepared by community chefs. Cooking demos included.",
    category: "Food",
    date: "2026-06-14",
    time: "11:00 AM",
    endTime: "8:00 PM",
    venue: "Federation Square",
    city: "Melbourne",
    state: "VIC",
    imageUrl: "https://images.unsplash.com/photo-1567337710282-00832b415979?w=800",
    price: 15,
    currency: "AUD",
    orgId: "o2",
    orgName: "Malayalee Association of VIC",
    featured: true,
    trending: true,
    ticketsAvailable: 1000,
    ticketsSold: 743,
    cpid: "CP-E-NK8C4R",
  },
  {
    id: "e7",
    title: "Malayalam Movie Night: Premalu",
    description: "Community screening of the blockbuster Malayalam romantic comedy Premalu. Enjoy the film with fellow movie lovers, snacks, and great company.",
    category: "Movie",
    date: "2026-03-22",
    time: "6:00 PM",
    endTime: "9:00 PM",
    venue: "Event Cinemas George St",
    city: "Sydney",
    state: "NSW",
    imageUrl: "https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=800",
    price: 18,
    currency: "AUD",
    orgId: "o1",
    orgName: "Kerala Association of NSW",
    featured: false,
    trending: true,
    ticketsAvailable: 250,
    ticketsSold: 198,
    cpid: "CP-E-ST7Y9Z",
  },
  {
    id: "e8",
    title: "Cricket Tournament - KCA Cup",
    description: "Annual Kerala Community Association cricket tournament. Teams from across Australian states compete in this T20 format tournament.",
    category: "Sports",
    date: "2026-07-19",
    time: "8:00 AM",
    endTime: "6:00 PM",
    venue: "Rosehill Gardens",
    city: "Sydney",
    state: "NSW",
    imageUrl: "https://images.unsplash.com/photo-1531415074968-036ba1b575da?w=800",
    price: 10,
    currency: "AUD",
    orgId: "o1",
    orgName: "Kerala Association of NSW",
    featured: false,
    trending: false,
    ticketsAvailable: 400,
    ticketsSold: 156,
    cpid: "CP-E-HJ4K8M",
  },
  {
    id: "e9",
    title: "Vishu Celebration Perth",
    description: "Ring in the Malayalam New Year with traditional Vishukkani, sadya feast, cultural performances, and fireworks. A family event celebrating new beginnings.",
    category: "Festival",
    date: "2026-04-14",
    time: "10:00 AM",
    endTime: "4:00 PM",
    venue: "Perth Convention Centre",
    city: "Perth",
    state: "WA",
    imageUrl: "https://images.unsplash.com/photo-1506157786151-b8491531f063?w=800",
    price: 20,
    currency: "AUD",
    orgId: "o5",
    orgName: "WA Malayalee Assoc.",
    featured: false,
    trending: false,
    ticketsAvailable: 300,
    ticketsSold: 178,
    cpid: "CP-E-WX2N5B",
  },
  {
    id: "e10",
    title: "Theyyam - Living Gods of Kerala",
    description: "A rare theatrical performance bringing the ancient ritual art form of Theyyam to Australian audiences. Featuring elaborate costumes, face painting, and spiritual narratives.",
    category: "Theatre",
    date: "2026-08-08",
    time: "5:00 PM",
    endTime: "8:00 PM",
    venue: "Adelaide Festival Centre",
    city: "Adelaide",
    state: "SA",
    imageUrl: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=800",
    price: 40,
    currency: "AUD",
    orgId: "o6",
    orgName: "SA Kerala Community",
    featured: true,
    trending: false,
    ticketsAvailable: 180,
    ticketsSold: 95,
    cpid: "CP-E-DP7G3Q",
  },
];

const sampleOrganisations: Organisation[] = [
  {
    id: "o1",
    name: "Kerala Association of NSW",
    description: "The largest and oldest Malayalee community organisation in New South Wales, serving the cultural and social needs of Kerala families since 1972.",
    city: "Sydney",
    state: "NSW",
    memberCount: 2450,
    imageUrl: "https://images.unsplash.com/photo-1529156069898-49953e39b3ac?w=800",
    cpid: "CP-ORG-AB3K7N",
    established: "1972",
    categories: ["Cultural", "Social", "Sports"],
  },
  {
    id: "o2",
    name: "Malayalee Association of Victoria",
    description: "Bringing together Malayalee families in Victoria through cultural events, language classes, and community support programs.",
    city: "Melbourne",
    state: "VIC",
    memberCount: 1890,
    imageUrl: "https://images.unsplash.com/photo-1523580494863-6f3031224c94?w=800",
    cpid: "CP-ORG-XY9M2P",
    established: "1985",
    categories: ["Cultural", "Education"],
  },
  {
    id: "o3",
    name: "Indian Arts Academy",
    description: "Dedicated to preserving and promoting Indian classical arts including Kathakali, Bharatanatyam, and Carnatic music through workshops and performances.",
    city: "Sydney",
    state: "NSW",
    memberCount: 560,
    imageUrl: "https://images.unsplash.com/photo-1460661419201-fd4cecdf8a8b?w=800",
    cpid: "CP-ORG-QR4T8V",
    established: "2005",
    categories: ["Arts", "Education"],
  },
  {
    id: "o4",
    name: "QLD Malayalee Association",
    description: "Queensland's hub for Malayalee culture, hosting seasonal festivals, sports tournaments, and family events across South East Queensland.",
    city: "Brisbane",
    state: "QLD",
    memberCount: 980,
    imageUrl: "https://images.unsplash.com/photo-1511632765486-a01980e01a18?w=800",
    cpid: "CP-ORG-LM6W3J",
    established: "1998",
    categories: ["Cultural", "Sports", "Social"],
  },
  {
    id: "o5",
    name: "WA Malayalee Association",
    description: "Connecting the growing Malayalee community in Western Australia through vibrant cultural celebrations and social gatherings.",
    city: "Perth",
    state: "WA",
    memberCount: 720,
    imageUrl: "https://images.unsplash.com/photo-1528605248644-14dd04022da1?w=800",
    cpid: "CP-ORG-FG2H5D",
    established: "2001",
    categories: ["Cultural", "Social"],
  },
  {
    id: "o6",
    name: "SA Kerala Community",
    description: "South Australia's Malayalee community organisation fostering cultural identity and community bonds through events and mutual support.",
    city: "Adelaide",
    state: "SA",
    memberCount: 380,
    imageUrl: "https://images.unsplash.com/photo-1517486808906-6ca8b3f04846?w=800",
    cpid: "CP-ORG-NK8C4R",
    established: "2010",
    categories: ["Cultural", "Social"],
  },
];

const sampleBusinesses: Business[] = [
  {
    id: "b1",
    name: "Malabar Kitchen",
    description: "Authentic Kerala cuisine featuring traditional recipes from Malabar region. Specialising in biryani, seafood, and vegetarian thali.",
    category: "Restaurant",
    city: "Sydney",
    state: "NSW",
    phone: "+61 2 9876 5432",
    website: "malabarkitchen.com.au",
    imageUrl: "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=800",
    cpid: "CP-B-AB3K7N",
    rating: 4.7,
  },
  {
    id: "b2",
    name: "Kerala Ayurveda Centre",
    description: "Traditional Ayurvedic treatments and wellness therapies by certified practitioners from Kerala. Panchakarma, massages, and herbal remedies.",
    category: "Health & Wellness",
    city: "Melbourne",
    state: "VIC",
    phone: "+61 3 8765 4321",
    website: "keralaayurveda.com.au",
    imageUrl: "https://images.unsplash.com/photo-1544161515-4ab6ce6db874?w=800",
    cpid: "CP-B-XY9M2P",
    rating: 4.9,
  },
  {
    id: "b3",
    name: "Spice Route Grocers",
    description: "Your one-stop shop for authentic Kerala spices, snacks, and groceries. Fresh banana chips, jackfruit products, and traditional ingredients.",
    category: "Grocery",
    city: "Sydney",
    state: "NSW",
    phone: "+61 2 9123 4567",
    website: "spiceroute.com.au",
    imageUrl: "https://images.unsplash.com/photo-1596040033229-a9821ebd058d?w=800",
    cpid: "CP-B-QR4T8V",
    rating: 4.5,
  },
  {
    id: "b4",
    name: "Kochi Textiles",
    description: "Premium Kerala handloom sarees, kasavu mundus, and traditional fabrics. Direct imports from weavers in Balaramapuram and Chendamangalam.",
    category: "Fashion",
    city: "Melbourne",
    state: "VIC",
    phone: "+61 3 9567 8901",
    website: "kochitextiles.com.au",
    imageUrl: "https://images.unsplash.com/photo-1558618666-fcd25c85f82e?w=800",
    cpid: "CP-B-LM6W3J",
    rating: 4.6,
  },
  {
    id: "b5",
    name: "Chai & Chats",
    description: "A cosy Kerala-style chai cafe serving sulaimani, filter coffee, and snacks like pazham pori and unniyappam. A cultural meeting point.",
    category: "Cafe",
    city: "Brisbane",
    state: "QLD",
    phone: "+61 7 3456 7890",
    website: "chaiandchats.com.au",
    imageUrl: "https://images.unsplash.com/photo-1554118811-1e0d58224f24?w=800",
    cpid: "CP-B-FG2H5D",
    rating: 4.8,
  },
];

const sampleArtists: Artist[] = [
  {
    id: "a1",
    name: "Priya Menon",
    genre: "Mohiniyattam",
    bio: "Award-winning Mohiniyattam dancer trained under Guru Kalamandalam Sathyabhama. Has performed at festivals worldwide and conducts dance workshops across Australia.",
    imageUrl: "https://images.unsplash.com/photo-1508700929628-666bc8bd84ea?w=800",
    city: "Sydney",
    state: "NSW",
    featured: true,
    cpid: "CP-AR-AB3K7N",
    performances: 85,
  },
  {
    id: "a2",
    name: "Arun Krishnan",
    genre: "Carnatic Vocal",
    bio: "Carnatic vocalist and music teacher who has trained under legendary maestros. Regular performer at cultural events and temple festivals.",
    imageUrl: "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=800",
    city: "Melbourne",
    state: "VIC",
    featured: true,
    cpid: "CP-AR-XY9M2P",
    performances: 120,
  },
  {
    id: "a3",
    name: "Deepa Nair",
    genre: "Kathakali",
    bio: "Kathakali artist trained at Kerala Kalamandalam. Specialises in both male and female roles, bringing this 400-year-old art form to Australian audiences.",
    imageUrl: "https://images.unsplash.com/photo-1547153760-18fc86c581c4?w=800",
    city: "Sydney",
    state: "NSW",
    featured: false,
    cpid: "CP-AR-QR4T8V",
    performances: 45,
  },
  {
    id: "a4",
    name: "Rajesh Kumar",
    genre: "Tabla & Percussion",
    bio: "Versatile percussionist proficient in tabla, mridangam, and chenda. Collaborates with both classical and fusion ensembles across Australia.",
    imageUrl: "https://images.unsplash.com/photo-1511379938547-c1f69419868d?w=800",
    city: "Brisbane",
    state: "QLD",
    featured: true,
    cpid: "CP-AR-LM6W3J",
    performances: 95,
  },
  {
    id: "a5",
    name: "Lakshmi Warrier",
    genre: "Bharatanatyam",
    bio: "Bharatanatyam dancer and choreographer blending classical tradition with contemporary themes. Runs a popular dance school in Perth.",
    imageUrl: "https://images.unsplash.com/photo-1504609773096-104ff2c73ba4?w=800",
    city: "Perth",
    state: "WA",
    featured: false,
    cpid: "CP-AR-FG2H5D",
    performances: 67,
  },
];

const samplePerks: Perk[] = [
  {
    id: "p1",
    title: "15% Off Kerala Feast",
    description: "Get 15% off your total bill at Malabar Kitchen. Valid for dine-in and takeaway orders above $50.",
    businessName: "Malabar Kitchen",
    discount: "15%",
    code: "CULTURE15",
    validUntil: "2026-12-31",
    category: "Food & Dining",
    imageUrl: "https://images.unsplash.com/photo-1567337710282-00832b415979?w=800",
  },
  {
    id: "p2",
    title: "Free Consultation",
    description: "Complimentary 30-minute Ayurvedic wellness consultation at Kerala Ayurveda Centre for CulturePass members.",
    businessName: "Kerala Ayurveda Centre",
    discount: "Free",
    code: "CPWELLNESS",
    validUntil: "2026-06-30",
    category: "Health & Wellness",
    imageUrl: "https://images.unsplash.com/photo-1544161515-4ab6ce6db874?w=800",
  },
  {
    id: "p3",
    title: "10% Off Groceries",
    description: "10% discount on all purchases at Spice Route Grocers. Stock up on authentic Kerala ingredients.",
    businessName: "Spice Route Grocers",
    discount: "10%",
    code: "SPICE10",
    validUntil: "2026-09-30",
    category: "Grocery",
    imageUrl: "https://images.unsplash.com/photo-1596040033229-a9821ebd058d?w=800",
  },
  {
    id: "p4",
    title: "Buy 1 Get 1 Chai",
    description: "Buy one chai, get one free at Chai & Chats. Perfect for catching up with friends over authentic sulaimani.",
    businessName: "Chai & Chats",
    discount: "BOGO",
    code: "CHAIFRIEND",
    validUntil: "2026-08-31",
    category: "Cafe",
    imageUrl: "https://images.unsplash.com/photo-1554118811-1e0d58224f24?w=800",
  },
  {
    id: "p5",
    title: "20% Off Sarees",
    description: "Exclusive 20% discount on all Kerala kasavu sarees and festive collections at Kochi Textiles.",
    businessName: "Kochi Textiles",
    discount: "20%",
    code: "KASAVU20",
    validUntil: "2026-11-30",
    category: "Fashion",
    imageUrl: "https://images.unsplash.com/photo-1558618666-fcd25c85f82e?w=800",
  },
];

export function getEvents(): Event[] {
  return sampleEvents;
}

export function getEventById(id: string): Event | undefined {
  return sampleEvents.find(e => e.id === id);
}

export function getFeaturedEvents(): Event[] {
  return sampleEvents.filter(e => e.featured);
}

export function getTrendingEvents(): Event[] {
  return sampleEvents.filter(e => e.trending);
}

export function getEventsByCategory(category: EventCategory): Event[] {
  return sampleEvents.filter(e => e.category === category);
}

export function getEventsByCity(city: string): Event[] {
  return sampleEvents.filter(e => e.city === city);
}

export function getEventsByDate(date: string): Event[] {
  return sampleEvents.filter(e => e.date === date);
}

export function getOrganisations(): Organisation[] {
  return sampleOrganisations;
}

export function getOrganisationById(id: string): Organisation | undefined {
  return sampleOrganisations.find(o => o.id === id);
}

export function getBusinesses(): Business[] {
  return sampleBusinesses;
}

export function getBusinessById(id: string): Business | undefined {
  return sampleBusinesses.find(b => b.id === id);
}

export function getArtists(): Artist[] {
  return sampleArtists;
}

export function getArtistById(id: string): Artist | undefined {
  return sampleArtists.find(a => a.id === id);
}

export function getFeaturedArtists(): Artist[] {
  return sampleArtists.filter(a => a.featured);
}

export function getPerks(): Perk[] {
  return samplePerks;
}

export function getDatesWithEvents(): string[] {
  return [...new Set(sampleEvents.map(e => e.date))];
}
