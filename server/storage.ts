import { eq, desc, and, ilike, sql } from "drizzle-orm";
import { db } from "./db";
import {
  users,
  events,
  organisations,
  businesses,
  artists,
  perks,
  orders,
  memberships,
  cpids,
  type User,
  type InsertUser,
  type Event,
  type InsertEvent,
  type Organisation,
  type InsertOrganisation,
  type Business,
  type InsertBusiness,
  type Artist,
  type InsertArtist,
  type Perk,
  type InsertPerk,
  type Order,
  type InsertOrder,
  type Membership,
  type InsertMembership,
} from "@shared/schema";

function generateCPID(prefix: string): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let result = "";
  for (let i = 0; i < 6; i++) {
    result += chars[Math.floor(Math.random() * chars.length)];
  }
  return `${prefix}${result}`;
}

async function registerCPID(cpid: string, entityType: string, entityId: string) {
  await db.insert(cpids).values({ cpid, entityType, entityId });
}

export const storage = {
  // Users
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  },

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user;
  },

  async createUser(data: InsertUser): Promise<User> {
    const cpid = generateCPID("CP-U-");
    const [user] = await db.insert(users).values({ ...data, cpid }).returning();
    await registerCPID(cpid, "user", user.id);
    return user;
  },

  async updateUser(id: string, data: Partial<User>): Promise<User | undefined> {
    const [user] = await db.update(users).set(data).where(eq(users.id, id)).returning();
    return user;
  },

  async getAllUsers(): Promise<User[]> {
    return db.select().from(users).orderBy(desc(users.createdAt));
  },

  // Events
  async getEvents(opts?: { category?: string; city?: string; featured?: boolean; search?: string }): Promise<Event[]> {
    let query = db.select().from(events).where(eq(events.published, true));
    const conditions: any[] = [eq(events.published, true)];

    if (opts?.category) conditions.push(eq(events.category, opts.category));
    if (opts?.city) conditions.push(eq(events.city, opts.city));
    if (opts?.featured) conditions.push(eq(events.featured, true));
    if (opts?.search) conditions.push(ilike(events.title, `%${opts.search}%`));

    return db.select().from(events).where(and(...conditions)).orderBy(events.date);
  },

  async getEventById(id: string): Promise<Event | undefined> {
    const [event] = await db.select().from(events).where(eq(events.id, id));
    return event;
  },

  async getFeaturedEvents(): Promise<Event[]> {
    return db.select().from(events).where(and(eq(events.published, true), eq(events.featured, true))).orderBy(events.date);
  },

  async getTrendingEvents(): Promise<Event[]> {
    return db.select().from(events).where(and(eq(events.published, true), eq(events.trending, true))).orderBy(events.date);
  },

  async getEventsByDate(date: string): Promise<Event[]> {
    return db.select().from(events).where(and(eq(events.published, true), eq(events.date, date)));
  },

  async getEventDates(): Promise<string[]> {
    const result = await db.selectDistinct({ date: events.date }).from(events).where(eq(events.published, true));
    return result.map(r => r.date);
  },

  async createEvent(data: InsertEvent): Promise<Event> {
    const cpid = generateCPID("CP-E-");
    const [event] = await db.insert(events).values({ ...data, cpid }).returning();
    await registerCPID(cpid, "event", event.id);
    return event;
  },

  async updateEvent(id: string, data: Partial<Event>): Promise<Event | undefined> {
    const [event] = await db.update(events).set(data).where(eq(events.id, id)).returning();
    return event;
  },

  async deleteEvent(id: string): Promise<boolean> {
    const result = await db.delete(events).where(eq(events.id, id)).returning();
    return result.length > 0;
  },

  // Organisations
  async getOrganisations(): Promise<Organisation[]> {
    return db.select().from(organisations).where(eq(organisations.status, "active")).orderBy(organisations.name);
  },

  async getOrganisationById(id: string): Promise<Organisation | undefined> {
    const [org] = await db.select().from(organisations).where(eq(organisations.id, id));
    return org;
  },

  async createOrganisation(data: InsertOrganisation): Promise<Organisation> {
    const cpid = generateCPID("CP-ORG-");
    const [org] = await db.insert(organisations).values({ ...data, cpid }).returning();
    await registerCPID(cpid, "organisation", org.id);
    return org;
  },

  async updateOrganisation(id: string, data: Partial<Organisation>): Promise<Organisation | undefined> {
    const [org] = await db.update(organisations).set(data).where(eq(organisations.id, id)).returning();
    return org;
  },

  async deleteOrganisation(id: string): Promise<boolean> {
    const result = await db.delete(organisations).where(eq(organisations.id, id)).returning();
    return result.length > 0;
  },

  // Businesses
  async getBusinesses(): Promise<Business[]> {
    return db.select().from(businesses).where(eq(businesses.status, "active")).orderBy(businesses.name);
  },

  async getBusinessById(id: string): Promise<Business | undefined> {
    const [biz] = await db.select().from(businesses).where(eq(businesses.id, id));
    return biz;
  },

  async createBusiness(data: InsertBusiness): Promise<Business> {
    const cpid = generateCPID("CP-B-");
    const [biz] = await db.insert(businesses).values({ ...data, cpid }).returning();
    await registerCPID(cpid, "business", biz.id);
    return biz;
  },

  async updateBusiness(id: string, data: Partial<Business>): Promise<Business | undefined> {
    const [biz] = await db.update(businesses).set(data).where(eq(businesses.id, id)).returning();
    return biz;
  },

  async deleteBusiness(id: string): Promise<boolean> {
    const result = await db.delete(businesses).where(eq(businesses.id, id)).returning();
    return result.length > 0;
  },

  // Artists
  async getArtists(): Promise<Artist[]> {
    return db.select().from(artists).where(eq(artists.status, "active")).orderBy(artists.name);
  },

  async getArtistById(id: string): Promise<Artist | undefined> {
    const [artist] = await db.select().from(artists).where(eq(artists.id, id));
    return artist;
  },

  async getFeaturedArtists(): Promise<Artist[]> {
    return db.select().from(artists).where(and(eq(artists.status, "active"), eq(artists.featured, true)));
  },

  async createArtist(data: InsertArtist): Promise<Artist> {
    const cpid = generateCPID("CP-AR-");
    const [artist] = await db.insert(artists).values({ ...data, cpid }).returning();
    await registerCPID(cpid, "artist", artist.id);
    return artist;
  },

  async updateArtist(id: string, data: Partial<Artist>): Promise<Artist | undefined> {
    const [artist] = await db.update(artists).set(data).where(eq(artists.id, id)).returning();
    return artist;
  },

  async deleteArtist(id: string): Promise<boolean> {
    const result = await db.delete(artists).where(eq(artists.id, id)).returning();
    return result.length > 0;
  },

  // Perks
  async getPerks(): Promise<Perk[]> {
    return db.select().from(perks).where(eq(perks.status, "active"));
  },

  async getPerkById(id: string): Promise<Perk | undefined> {
    const [perk] = await db.select().from(perks).where(eq(perks.id, id));
    return perk;
  },

  async createPerk(data: InsertPerk): Promise<Perk> {
    const [perk] = await db.insert(perks).values(data).returning();
    return perk;
  },

  async updatePerk(id: string, data: Partial<Perk>): Promise<Perk | undefined> {
    const [perk] = await db.update(perks).set(data).where(eq(perks.id, id)).returning();
    return perk;
  },

  async deletePerk(id: string): Promise<boolean> {
    const result = await db.delete(perks).where(eq(perks.id, id)).returning();
    return result.length > 0;
  },

  // Orders
  async createOrder(data: InsertOrder): Promise<Order> {
    const [order] = await db.insert(orders).values(data).returning();
    if (data.eventId) {
      await db.update(events).set({
        ticketsSold: sql`${events.ticketsSold} + ${data.quantity || 1}`,
      }).where(eq(events.id, data.eventId));
    }
    return order;
  },

  async getOrdersByUser(userId: string): Promise<Order[]> {
    return db.select().from(orders).where(eq(orders.userId, userId)).orderBy(desc(orders.createdAt));
  },

  async getOrderById(id: string): Promise<Order | undefined> {
    const [order] = await db.select().from(orders).where(eq(orders.id, id));
    return order;
  },

  // Memberships
  async joinOrganisation(data: InsertMembership): Promise<Membership> {
    const [membership] = await db.insert(memberships).values(data).returning();
    await db.update(organisations).set({
      memberCount: sql`${organisations.memberCount} + 1`,
    }).where(eq(organisations.id, data.orgId));
    return membership;
  },

  async getUserMemberships(userId: string): Promise<Membership[]> {
    return db.select().from(memberships).where(eq(memberships.userId, userId));
  },

  async getOrgMembers(orgId: string): Promise<Membership[]> {
    return db.select().from(memberships).where(eq(memberships.orgId, orgId));
  },

  async getAllOrganisations(): Promise<Organisation[]> {
    return db.select().from(organisations).orderBy(desc(organisations.createdAt));
  },

  async getAllBusinesses(): Promise<Business[]> {
    return db.select().from(businesses).orderBy(desc(businesses.createdAt));
  },

  async getAllArtists(): Promise<Artist[]> {
    return db.select().from(artists).orderBy(desc(artists.createdAt));
  },

  async getAllEvents(): Promise<Event[]> {
    return db.select().from(events).orderBy(desc(events.createdAt));
  },

  async getAllOrders(): Promise<Order[]> {
    return db.select().from(orders).orderBy(desc(orders.createdAt));
  },

  async getPendingOrganisations(): Promise<Organisation[]> {
    return db.select().from(organisations).where(eq(organisations.status, "pending")).orderBy(desc(organisations.createdAt));
  },

  async getPendingBusinesses(): Promise<Business[]> {
    return db.select().from(businesses).where(eq(businesses.status, "pending")).orderBy(desc(businesses.createdAt));
  },

  async getPendingArtists(): Promise<Artist[]> {
    return db.select().from(artists).where(eq(artists.status, "pending")).orderBy(desc(artists.createdAt));
  },

  // CPID Lookup
  async lookupCPID(cpid: string) {
    const [result] = await db.select().from(cpids).where(eq(cpids.cpid, cpid));
    return result;
  },
};
