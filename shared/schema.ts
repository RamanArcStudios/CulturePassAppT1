import { sql } from "drizzle-orm";
import {
  pgTable,
  text,
  varchar,
  integer,
  boolean,
  real,
  timestamp,
  jsonb,
  doublePrecision,
} from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: varchar("id")
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  name: text("name").notNull().default("Guest User"),
  email: text("email").default(""),
  city: text("city").default("Sydney"),
  state: text("state").default("NSW"),
  country: text("country").default("Australia"),
  phone: text("phone").default(""),
  phoneVerified: boolean("phone_verified").default(false),
  cpid: text("cpid").unique(),
  savedEvents: jsonb("saved_events").$type<string[]>().default([]),
  memberOf: jsonb("member_of").$type<string[]>().default([]),
  roleGlobal: text("role_global").default("user"),
  website: text("website").default(""),
  socialLinks: jsonb("social_links").$type<{facebook?: string; instagram?: string; twitter?: string; youtube?: string; tiktok?: string; linkedin?: string;}>().default({}),
  createdAt: timestamp("created_at").defaultNow(),
});

export const events = pgTable("events", {
  id: varchar("id")
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  title: text("title").notNull(),
  description: text("description").notNull(),
  category: text("category").notNull(),
  date: text("date").notNull(),
  time: text("time").notNull(),
  endTime: text("end_time").notNull(),
  venue: text("venue").notNull(),
  city: text("city").notNull(),
  state: text("state").notNull(),
  imageUrl: text("image_url").default(""),
  price: real("price").notNull().default(0),
  currency: text("currency").default("AUD"),
  orgId: varchar("org_id"),
  orgName: text("org_name").default(""),
  featured: boolean("featured").default(false),
  trending: boolean("trending").default(false),
  published: boolean("published").default(true),
  ticketsAvailable: integer("tickets_available").default(100),
  ticketsSold: integer("tickets_sold").default(0),
  artistId: varchar("artist_id"),
  country: text("country").default("Australia"),
  venueId: varchar("venue_id"),
  lat: doublePrecision("lat"),
  lng: doublePrecision("lng"),
  cpid: text("cpid").unique(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const venues = pgTable("venues", {
  id: varchar("id")
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  address: text("address").notNull(),
  country: text("country").notNull().default("Australia"),
  state: text("state").notNull(),
  city: text("city").notNull(),
  lat: doublePrecision("lat").notNull(),
  lng: doublePrecision("lng").notNull(),
  capacity: integer("capacity"),
  venueType: text("venue_type").notNull().default("hall"),
  amenities: jsonb("amenities").$type<string[]>().default([]),
  images: jsonb("images").$type<string[]>().default([]),
  contact: text("contact").default(""),
  phone: text("phone").default(""),
  website: text("website").default(""),
  description: text("description").default(""),
  approved: boolean("approved").default(true),
  socialLinks: jsonb("social_links").$type<{facebook?: string; instagram?: string; twitter?: string; youtube?: string; tiktok?: string; linkedin?: string;}>().default({}),
  cpid: text("cpid").unique(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const organisations = pgTable("organisations", {
  id: varchar("id")
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  description: text("description").notNull(),
  city: text("city").notNull(),
  state: text("state").notNull(),
  memberCount: integer("member_count").default(0),
  imageUrl: text("image_url").default(""),
  cpid: text("cpid").unique(),
  established: text("established").default(""),
  categories: jsonb("categories").$type<string[]>().default([]),
  slug: text("slug"),
  status: text("status").default("active"),
  ownerId: varchar("owner_id"),
  website: text("website").default(""),
  socialLinks: jsonb("social_links").$type<{facebook?: string; instagram?: string; twitter?: string; youtube?: string; tiktok?: string; linkedin?: string;}>().default({}),
  createdAt: timestamp("created_at").defaultNow(),
});

export const businesses = pgTable("businesses", {
  id: varchar("id")
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  description: text("description").notNull(),
  category: text("category").notNull(),
  city: text("city").notNull(),
  state: text("state").notNull(),
  country: text("country").default("Australia"),
  phone: text("phone").default(""),
  website: text("website").default(""),
  imageUrl: text("image_url").default(""),
  cpid: text("cpid").unique(),
  rating: real("rating").default(0),
  ownerId: varchar("owner_id"),
  status: text("status").default("active"),
  isSponsor: boolean("is_sponsor").default(false),
  lat: doublePrecision("lat"),
  lng: doublePrecision("lng"),
  serviceLocations: jsonb("service_locations").$type<string[]>().default([]),
  socialLinks: jsonb("social_links").$type<{facebook?: string; instagram?: string; twitter?: string; youtube?: string; tiktok?: string; linkedin?: string;}>().default({}),
  createdAt: timestamp("created_at").defaultNow(),
});

export const artists = pgTable("artists", {
  id: varchar("id")
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  genre: text("genre").notNull(),
  bio: text("bio").notNull(),
  imageUrl: text("image_url").default(""),
  city: text("city").notNull(),
  state: text("state").notNull(),
  featured: boolean("featured").default(false),
  cpid: text("cpid").unique(),
  performances: integer("performances").default(0),
  slug: text("slug"),
  status: text("status").default("active"),
  ownerId: varchar("owner_id"),
  website: text("website").default(""),
  socialLinks: jsonb("social_links").$type<{facebook?: string; instagram?: string; twitter?: string; youtube?: string; tiktok?: string; linkedin?: string;}>().default({}),
  createdAt: timestamp("created_at").defaultNow(),
});

export const perks = pgTable("perks", {
  id: varchar("id")
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  title: text("title").notNull(),
  description: text("description").notNull(),
  businessName: text("business_name").notNull(),
  discount: text("discount").notNull(),
  code: text("code").notNull(),
  validUntil: text("valid_until").notNull(),
  category: text("category").default(""),
  imageUrl: text("image_url").default(""),
  status: text("status").default("active"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const orders = pgTable("orders", {
  id: varchar("id")
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull(),
  eventId: varchar("event_id").notNull(),
  quantity: integer("quantity").notNull().default(1),
  amount: real("amount").notNull(),
  currency: text("currency").default("AUD"),
  status: text("status").default("pending"),
  customerName: text("customer_name").default(""),
  customerEmail: text("customer_email").default(""),
  createdAt: timestamp("created_at").defaultNow(),
});

export const memberships = pgTable("memberships", {
  id: varchar("id")
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull(),
  orgId: varchar("org_id").notNull(),
  role: text("role").default("member"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const passwordResetTokens = pgTable("password_reset_tokens", {
  id: varchar("id")
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull(),
  token: text("token").notNull().unique(),
  expiresAt: timestamp("expires_at").notNull(),
  used: boolean("used").default(false),
  createdAt: timestamp("created_at").defaultNow(),
});

export const cpids = pgTable("cpids", {
  cpid: text("cpid").primaryKey(),
  entityType: text("entity_type").notNull(),
  entityId: varchar("entity_id").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
  name: true,
  email: true,
  city: true,
  state: true,
  country: true,
  phone: true,
  website: true,
});

export const insertEventSchema = createInsertSchema(events).omit({
  id: true,
  cpid: true,
  createdAt: true,
});

export const insertVenueSchema = createInsertSchema(venues).omit({
  id: true,
  cpid: true,
  createdAt: true,
});

export const insertOrganisationSchema = createInsertSchema(organisations).omit({
  id: true,
  cpid: true,
  createdAt: true,
});

export const insertBusinessSchema = createInsertSchema(businesses).omit({
  id: true,
  cpid: true,
  createdAt: true,
});

export const insertArtistSchema = createInsertSchema(artists).omit({
  id: true,
  cpid: true,
  createdAt: true,
});

export const insertPerkSchema = createInsertSchema(perks).omit({
  id: true,
  createdAt: true,
});

export const insertOrderSchema = createInsertSchema(orders).omit({
  id: true,
  createdAt: true,
});

export const insertMembershipSchema = createInsertSchema(memberships).omit({
  id: true,
  createdAt: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;
export type Event = typeof events.$inferSelect;
export type InsertEvent = z.infer<typeof insertEventSchema>;
export type Venue = typeof venues.$inferSelect;
export type InsertVenue = z.infer<typeof insertVenueSchema>;
export type Organisation = typeof organisations.$inferSelect;
export type InsertOrganisation = z.infer<typeof insertOrganisationSchema>;
export type Business = typeof businesses.$inferSelect;
export type InsertBusiness = z.infer<typeof insertBusinessSchema>;
export type Artist = typeof artists.$inferSelect;
export type InsertArtist = z.infer<typeof insertArtistSchema>;
export type Perk = typeof perks.$inferSelect;
export type InsertPerk = z.infer<typeof insertPerkSchema>;
export type Order = typeof orders.$inferSelect;
export type InsertOrder = z.infer<typeof insertOrderSchema>;
export type Membership = typeof memberships.$inferSelect;
export type InsertMembership = z.infer<typeof insertMembershipSchema>;
