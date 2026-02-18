import type { Express, Request, Response } from "express";
import { createServer, type Server } from "node:http";
import { storage } from "./storage";
import bcrypt from "bcryptjs";
import crypto from "crypto";
import session from "express-session";
import pgSession from "connect-pg-simple";
import pg from "pg";
import { getUncachableStripeClient, getStripePublishableKey } from "./stripeClient";

declare module "express-session" {
  interface SessionData {
    userId: string;
  }
}

export async function registerRoutes(app: Express): Promise<Server> {
  const PgStore = pgSession(session);
  const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL });

  app.use(
    session({
      store: new PgStore({ pool, createTableIfMissing: true }),
      secret: process.env.SESSION_SECRET || "culturepass-secret-key-change-in-production",
      resave: false,
      saveUninitialized: false,
      cookie: {
        maxAge: 30 * 24 * 60 * 60 * 1000,
        httpOnly: true,
        secure: false,
        sameSite: "lax",
      },
    })
  );

  // Admin middleware
  const requireAuth = (req: Request, res: Response, next: Function) => {
    if (!req.session.userId) return res.status(401).json({ error: "Login required" });
    next();
  };

  const requireAdmin = async (req: Request, res: Response, next: Function) => {
    if (!req.session.userId) return res.status(401).json({ error: "Login required" });
    const user = await storage.getUser(req.session.userId);
    if (!user || user.roleGlobal !== "admin") return res.status(403).json({ error: "Admin access required" });
    next();
  };

  // ── Auth ──
  app.post("/api/auth/register", async (req: Request, res: Response) => {
    try {
      const { username, password, name, email, city, state, country, phone } = req.body;
      if (!username || !password) return res.status(400).json({ error: "Username and password required" });

      const existing = await storage.getUserByUsername(username);
      if (existing) return res.status(409).json({ error: "Username already taken" });

      const hashed = await bcrypt.hash(password, 10);
      const user = await storage.createUser({
        username,
        password: hashed,
        name: name || username,
        email: email || "",
        city: city || "Sydney",
        state: state || "NSW",
        country: country || "Australia",
        phone: phone || "",
      });

      req.session.userId = user.id;
      const { password: _, ...safeUser } = user;
      res.status(201).json(safeUser);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  app.post("/api/auth/login", async (req: Request, res: Response) => {
    try {
      const { username, password } = req.body;
      if (!username || !password) return res.status(400).json({ error: "Username and password required" });

      const user = await storage.getUserByUsername(username);
      if (!user) return res.status(401).json({ error: "Invalid credentials" });

      const valid = await bcrypt.compare(password, user.password);
      if (!valid) return res.status(401).json({ error: "Invalid credentials" });

      req.session.userId = user.id;
      const { password: _, ...safeUser } = user;
      res.json(safeUser);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  app.post("/api/auth/logout", (req: Request, res: Response) => {
    req.session.destroy(() => {
      res.json({ ok: true });
    });
  });

  app.get("/api/auth/me", async (req: Request, res: Response) => {
    try {
      if (!req.session.userId) return res.status(401).json({ error: "Not authenticated" });
      const user = await storage.getUser(req.session.userId);
      if (!user) return res.status(404).json({ error: "User not found" });
      const { password: _, ...safeUser } = user;
      res.json(safeUser);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  // ── Events ──
  app.get("/api/events", async (req: Request, res: Response) => {
    try {
      const { category, city, featured, search } = req.query;
      const events = await storage.getEvents({
        category: category as string,
        city: city as string,
        featured: featured === "true",
        search: search as string,
      });
      res.json(events);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  app.get("/api/events/featured", async (_req: Request, res: Response) => {
    try {
      const events = await storage.getFeaturedEvents();
      res.json(events);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  app.get("/api/events/trending", async (_req: Request, res: Response) => {
    try {
      const events = await storage.getTrendingEvents();
      res.json(events);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  app.get("/api/events/dates", async (_req: Request, res: Response) => {
    try {
      const dates = await storage.getEventDates();
      res.json(dates);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  app.get("/api/events/by-date/:date", async (req: Request, res: Response) => {
    try {
      const events = await storage.getEventsByDate(req.params.date);
      res.json(events);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  app.get("/api/events/:id", async (req: Request, res: Response) => {
    try {
      const event = await storage.getEventById(req.params.id);
      if (!event) return res.status(404).json({ error: "Event not found" });
      res.json(event);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  app.post("/api/events", async (req: Request, res: Response) => {
    try {
      const event = await storage.createEvent(req.body);
      res.status(201).json(event);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  app.put("/api/events/:id", async (req: Request, res: Response) => {
    try {
      const event = await storage.updateEvent(req.params.id, req.body);
      if (!event) return res.status(404).json({ error: "Event not found" });
      res.json(event);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  app.delete("/api/events/:id", async (req: Request, res: Response) => {
    try {
      const ok = await storage.deleteEvent(req.params.id);
      if (!ok) return res.status(404).json({ error: "Event not found" });
      res.json({ ok: true });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  // ── Organisations ──
  app.get("/api/organisations", async (_req: Request, res: Response) => {
    try {
      const orgs = await storage.getOrganisations();
      res.json(orgs);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  app.get("/api/organisations/:id", async (req: Request, res: Response) => {
    try {
      const org = await storage.getOrganisationById(req.params.id);
      if (!org) return res.status(404).json({ error: "Organisation not found" });
      res.json(org);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  app.post("/api/organisations", async (req: Request, res: Response) => {
    try {
      const org = await storage.createOrganisation(req.body);
      res.status(201).json(org);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  app.put("/api/organisations/:id", async (req: Request, res: Response) => {
    try {
      const org = await storage.updateOrganisation(req.params.id, req.body);
      if (!org) return res.status(404).json({ error: "Organisation not found" });
      res.json(org);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  // ── Businesses ──
  app.get("/api/businesses", async (_req: Request, res: Response) => {
    try {
      const businesses = await storage.getBusinesses();
      res.json(businesses);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  app.get("/api/businesses/:id", async (req: Request, res: Response) => {
    try {
      const biz = await storage.getBusinessById(req.params.id);
      if (!biz) return res.status(404).json({ error: "Business not found" });
      res.json(biz);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  app.post("/api/businesses", async (req: Request, res: Response) => {
    try {
      const biz = await storage.createBusiness(req.body);
      res.status(201).json(biz);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  app.put("/api/businesses/:id", async (req: Request, res: Response) => {
    try {
      const biz = await storage.updateBusiness(req.params.id, req.body);
      if (!biz) return res.status(404).json({ error: "Business not found" });
      res.json(biz);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  // ── Artists ──
  app.get("/api/artists", async (_req: Request, res: Response) => {
    try {
      const artists = await storage.getArtists();
      res.json(artists);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  app.get("/api/artists/featured", async (_req: Request, res: Response) => {
    try {
      const artists = await storage.getFeaturedArtists();
      res.json(artists);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  app.get("/api/artists/:id/events", async (req: Request, res: Response) => {
    try {
      const events = await storage.getEventsByArtist(req.params.id);
      res.json(events);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  app.get("/api/artists/:id", async (req: Request, res: Response) => {
    try {
      const artist = await storage.getArtistById(req.params.id);
      if (!artist) return res.status(404).json({ error: "Artist not found" });
      res.json(artist);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  app.post("/api/artists", async (req: Request, res: Response) => {
    try {
      const artist = await storage.createArtist(req.body);
      res.status(201).json(artist);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  app.put("/api/artists/:id", async (req: Request, res: Response) => {
    try {
      const artist = await storage.updateArtist(req.params.id, req.body);
      if (!artist) return res.status(404).json({ error: "Artist not found" });
      res.json(artist);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  // ── Perks ──
  app.get("/api/perks", async (_req: Request, res: Response) => {
    try {
      const perks = await storage.getPerks();
      res.json(perks);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  app.get("/api/perks/:id", async (req: Request, res: Response) => {
    try {
      const perk = await storage.getPerkById(req.params.id);
      if (!perk) return res.status(404).json({ error: "Perk not found" });
      res.json(perk);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  app.post("/api/perks", async (req: Request, res: Response) => {
    try {
      const perk = await storage.createPerk(req.body);
      res.status(201).json(perk);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  // ── Orders ──
  app.post("/api/orders", async (req: Request, res: Response) => {
    try {
      if (!req.session.userId) return res.status(401).json({ error: "Login required" });
      const order = await storage.createOrder({ ...req.body, userId: req.session.userId });
      res.status(201).json(order);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  app.get("/api/orders", async (req: Request, res: Response) => {
    try {
      if (!req.session.userId) return res.status(401).json({ error: "Login required" });
      const orders = await storage.getOrdersByUser(req.session.userId);
      res.json(orders);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  // ── Memberships ──
  app.post("/api/memberships", async (req: Request, res: Response) => {
    try {
      if (!req.session.userId) return res.status(401).json({ error: "Login required" });
      const membership = await storage.joinOrganisation({ ...req.body, userId: req.session.userId });
      res.status(201).json(membership);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  app.get("/api/memberships", async (req: Request, res: Response) => {
    try {
      if (!req.session.userId) return res.status(401).json({ error: "Login required" });
      const memberships = await storage.getUserMemberships(req.session.userId);
      res.json(memberships);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  // ── User saved events ──
  app.post("/api/users/save-event", async (req: Request, res: Response) => {
    try {
      if (!req.session.userId) return res.status(401).json({ error: "Login required" });
      const user = await storage.getUser(req.session.userId);
      if (!user) return res.status(404).json({ error: "User not found" });

      const { eventId } = req.body;
      const saved = Array.isArray(user.savedEvents) ? [...user.savedEvents] : [];
      const idx = saved.indexOf(eventId);
      if (idx >= 0) {
        saved.splice(idx, 1);
      } else {
        saved.push(eventId);
      }
      const updated = await storage.updateUser(req.session.userId, { savedEvents: saved });
      const { password: _, ...safeUser } = updated!;
      res.json(safeUser);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  app.put("/api/users/profile", async (req: Request, res: Response) => {
    try {
      if (!req.session.userId) return res.status(401).json({ error: "Login required" });
      const { name, email, city, state, country, phone, website, socialLinks } = req.body;
      const updateData: any = { name, email, city, state };
      if (country !== undefined) updateData.country = country;
      if (phone !== undefined) updateData.phone = phone;
      if (website !== undefined) updateData.website = website;
      if (socialLinks !== undefined) updateData.socialLinks = socialLinks;
      const updated = await storage.updateUser(req.session.userId, updateData);
      if (!updated) return res.status(404).json({ error: "User not found" });
      const { password: _, ...safeUser } = updated;
      res.json(safeUser);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  // ── CPID Lookup ──
  app.get("/api/cpid/:cpid", async (req: Request, res: Response) => {
    try {
      const result = await storage.lookupCPID(req.params.cpid);
      if (!result) return res.status(404).json({ error: "CPID not found" });
      res.json(result);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  // ── Admin routes ──
  app.get("/api/admin/stats", async (req: Request, res: Response) => {
    try {
      if (!req.session.userId) return res.status(401).json({ error: "Login required" });
      const user = await storage.getUser(req.session.userId);
      if (!user || user.roleGlobal !== "admin") return res.status(403).json({ error: "Admin access required" });
      
      const allUsers = await storage.getAllUsers();
      const allEvents = await storage.getAllEvents();
      const allOrgs = await storage.getAllOrganisations();
      const allBiz = await storage.getAllBusinesses();
      const allArtists = await storage.getAllArtists();
      const allOrders = await storage.getAllOrders();
      const pendingOrgs = await storage.getPendingOrganisations();
      const pendingBiz = await storage.getPendingBusinesses();
      const pendingArtists = await storage.getPendingArtists();
      
      res.json({
        users: allUsers.length,
        events: allEvents.length,
        organisations: allOrgs.length,
        businesses: allBiz.length,
        artists: allArtists.length,
        orders: allOrders.length,
        pendingOrganisations: pendingOrgs.length,
        pendingBusinesses: pendingBiz.length,
        pendingArtists: pendingArtists.length,
        totalPending: pendingOrgs.length + pendingBiz.length + pendingArtists.length,
      });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  app.get("/api/admin/pending", async (req: Request, res: Response) => {
    try {
      if (!req.session.userId) return res.status(401).json({ error: "Login required" });
      const user = await storage.getUser(req.session.userId);
      if (!user || user.roleGlobal !== "admin") return res.status(403).json({ error: "Admin access required" });
      
      const orgs = await storage.getPendingOrganisations();
      const biz = await storage.getPendingBusinesses();
      const artists = await storage.getPendingArtists();
      
      res.json({ organisations: orgs, businesses: biz, artists: artists });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  app.post("/api/admin/approve/:type/:id", async (req: Request, res: Response) => {
    try {
      if (!req.session.userId) return res.status(401).json({ error: "Login required" });
      const user = await storage.getUser(req.session.userId);
      if (!user || user.roleGlobal !== "admin") return res.status(403).json({ error: "Admin access required" });
      
      const { type, id } = req.params;
      let result;
      if (type === "organisation") {
        result = await storage.updateOrganisation(id, { status: "active" });
      } else if (type === "business") {
        result = await storage.updateBusiness(id, { status: "active" });
      } else if (type === "artist") {
        result = await storage.updateArtist(id, { status: "active" });
      } else {
        return res.status(400).json({ error: "Invalid type" });
      }
      if (!result) return res.status(404).json({ error: "Not found" });
      res.json(result);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  app.post("/api/admin/reject/:type/:id", async (req: Request, res: Response) => {
    try {
      if (!req.session.userId) return res.status(401).json({ error: "Login required" });
      const user = await storage.getUser(req.session.userId);
      if (!user || user.roleGlobal !== "admin") return res.status(403).json({ error: "Admin access required" });
      
      const { type, id } = req.params;
      let result;
      if (type === "organisation") {
        result = await storage.updateOrganisation(id, { status: "rejected" });
      } else if (type === "business") {
        result = await storage.updateBusiness(id, { status: "rejected" });
      } else if (type === "artist") {
        result = await storage.updateArtist(id, { status: "rejected" });
      } else {
        return res.status(400).json({ error: "Invalid type" });
      }
      if (!result) return res.status(404).json({ error: "Not found" });
      res.json(result);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  app.post("/api/admin/make-admin/:userId", async (req: Request, res: Response) => {
    try {
      if (!req.session.userId) return res.status(401).json({ error: "Login required" });
      const user = await storage.getUser(req.session.userId);
      if (!user || user.roleGlobal !== "admin") return res.status(403).json({ error: "Admin access required" });
      
      const updated = await storage.updateUser(req.params.userId, { roleGlobal: "admin" });
      if (!updated) return res.status(404).json({ error: "User not found" });
      const { password: _, ...safeUser } = updated;
      res.json(safeUser);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  // ── User Submissions (authenticated users submit pages for admin approval) ──
  app.post("/api/submit/organisation", async (req: Request, res: Response) => {
    try {
      if (!req.session.userId) return res.status(401).json({ error: "Login required" });
      const org = await storage.createOrganisation({
        ...req.body,
        status: "pending",
        ownerId: req.session.userId,
      });
      res.status(201).json(org);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  app.post("/api/submit/business", async (req: Request, res: Response) => {
    try {
      if (!req.session.userId) return res.status(401).json({ error: "Login required" });
      const biz = await storage.createBusiness({
        ...req.body,
        status: "pending",
        ownerId: req.session.userId,
      });
      res.status(201).json(biz);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  app.post("/api/submit/artist", async (req: Request, res: Response) => {
    try {
      if (!req.session.userId) return res.status(401).json({ error: "Login required" });
      const artist = await storage.createArtist({
        ...req.body,
        status: "pending",
        ownerId: req.session.userId,
      });
      res.status(201).json(artist);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  // ── Get user's own submissions ──
  app.get("/api/my-submissions", async (req: Request, res: Response) => {
    try {
      if (!req.session.userId) return res.status(401).json({ error: "Login required" });
      const allOrgs = await storage.getAllOrganisations();
      const allBiz = await storage.getAllBusinesses();
      const allArtists = await storage.getAllArtists();
      
      const myOrgs = allOrgs.filter(o => o.ownerId === req.session.userId);
      const myBiz = allBiz.filter(b => b.ownerId === req.session.userId);
      const myArtists = allArtists.filter(a => a.ownerId === req.session.userId);
      
      res.json({ organisations: myOrgs, businesses: myBiz, artists: myArtists });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  // ── Stripe Checkout ──
  app.get("/api/stripe/publishable-key", async (_req: Request, res: Response) => {
    try {
      const key = await getStripePublishableKey();
      res.json({ publishableKey: key });
    } catch (err: any) {
      res.status(500).json({ error: "Stripe not configured" });
    }
  });

  app.post("/api/checkout", async (req: Request, res: Response) => {
    try {
      if (!req.session.userId) return res.status(401).json({ error: "Login required" });
      const user = await storage.getUser(req.session.userId);
      if (!user) return res.status(404).json({ error: "User not found" });

      const { eventId, quantity = 1 } = req.body;
      if (!eventId) return res.status(400).json({ error: "Event ID required" });

      const event = await storage.getEventById(eventId);
      if (!event) return res.status(404).json({ error: "Event not found" });

      if (event.price === 0) {
        const order = await storage.createOrder({
          userId: user.id,
          eventId: event.id,
          quantity,
          amount: 0,
          status: "confirmed",
          customerName: user.name,
          customerEmail: user.email || "",
        });
        return res.json({ free: true, order });
      }

      const stripe = await getUncachableStripeClient();
      const baseUrl = `https://${process.env.REPLIT_DOMAINS?.split(',')[0]}`;

      const session = await stripe.checkout.sessions.create({
        payment_method_types: ["card"],
        line_items: [
          {
            price_data: {
              currency: event.currency || "aud",
              product_data: {
                name: event.title,
                description: `${event.date} at ${event.venue}, ${event.city}`,
              },
              unit_amount: Math.round(event.price * 100),
            },
            quantity,
          },
        ],
        mode: "payment",
        success_url: `${baseUrl}/api/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${baseUrl}/api/checkout/cancel`,
        metadata: {
          eventId: event.id,
          userId: user.id,
          quantity: String(quantity),
        },
        customer_email: user.email || undefined,
      });

      const order = await storage.createOrder({
        userId: user.id,
        eventId: event.id,
        quantity,
        amount: event.price * quantity,
        status: "pending",
        customerName: user.name,
        customerEmail: user.email || "",
      });

      res.json({ url: session.url, orderId: order.id });
    } catch (err: any) {
      console.error("Checkout error:", err);
      res.status(500).json({ error: err.message });
    }
  });

  app.get("/api/checkout/success", async (req: Request, res: Response) => {
    try {
      const sessionId = req.query.session_id as string;
      if (sessionId) {
        const stripe = await getUncachableStripeClient();
        const session = await stripe.checkout.sessions.retrieve(sessionId);
        if (session.payment_status === "paid" && session.metadata) {
          const { eventId, userId, quantity } = session.metadata;
          const orders = await storage.getOrdersByUser(userId);
          const pendingOrder = orders.find(o => o.eventId === eventId && o.status === "pending");
          if (pendingOrder) {
            await storage.updateOrder(pendingOrder.id, { status: "confirmed" });
          }
        }
      }
      res.send(`<html><body style="font-family:system-ui;display:flex;align-items:center;justify-content:center;height:100vh;margin:0;background:#FAFAF8">
        <div style="text-align:center;padding:40px">
          <div style="font-size:64px;margin-bottom:16px">&#10003;</div>
          <h1 style="color:#1A535C;margin-bottom:8px">Payment Successful!</h1>
          <p style="color:#6B6B6F">Your tickets have been booked. You can close this window and return to the app.</p>
        </div>
      </body></html>`);
    } catch (err: any) {
      res.send(`<html><body style="font-family:system-ui;display:flex;align-items:center;justify-content:center;height:100vh;margin:0">
        <div style="text-align:center"><h1>Payment received</h1><p>You can close this window.</p></div>
      </body></html>`);
    }
  });

  app.get("/api/checkout/cancel", (_req: Request, res: Response) => {
    res.send(`<html><body style="font-family:system-ui;display:flex;align-items:center;justify-content:center;height:100vh;margin:0;background:#FAFAF8">
      <div style="text-align:center;padding:40px">
        <div style="font-size:64px;margin-bottom:16px">&#10007;</div>
        <h1 style="color:#E2725B;margin-bottom:8px">Payment Cancelled</h1>
        <p style="color:#6B6B6F">No charges were made. You can close this window and return to the app.</p>
      </div>
    </body></html>`);
  });

  // ── Venues ──
  app.get("/api/venues", async (_req: Request, res: Response) => {
    try {
      const venuesList = await storage.getVenues();
      res.json(venuesList);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  app.get("/api/venues/:id", async (req: Request, res: Response) => {
    try {
      const venue = await storage.getVenueById(req.params.id);
      if (!venue) return res.status(404).json({ error: "Venue not found" });
      res.json(venue);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  app.get("/api/venues/:id/events", async (req: Request, res: Response) => {
    try {
      const eventsList = await storage.getEventsByVenue(req.params.id);
      res.json(eventsList);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  app.post("/api/venues", requireAuth, async (req: Request, res: Response) => {
    try {
      const venue = await storage.createVenue(req.body);
      res.status(201).json(venue);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  app.put("/api/venues/:id", requireAuth, async (req: Request, res: Response) => {
    try {
      const venue = await storage.updateVenue(req.params.id, req.body);
      if (!venue) return res.status(404).json({ error: "Venue not found" });
      res.json(venue);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  // ── Map Data ──
  app.get("/api/map/data", async (_req: Request, res: Response) => {
    try {
      const data = await storage.getMapData();
      res.json(data);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  // ── Forgot Password / Reset ──
  app.post("/api/auth/forgot-password", async (req: Request, res: Response) => {
    try {
      const { email } = req.body;
      if (!email) return res.status(400).json({ error: "Email is required" });

      const user = await storage.getUserByEmail(email);
      if (!user) {
        return res.json({ message: "If that email exists, a reset link has been sent." });
      }

      const token = crypto.randomBytes(32).toString("hex");
      const expiresAt = new Date(Date.now() + 15 * 60 * 1000);
      await storage.createPasswordResetToken(user.id, token, expiresAt);

      const baseUrl = `https://${process.env.REPLIT_DOMAINS?.split(',')[0]}`;
      const resetUrl = `${baseUrl}/api/auth/reset-password-page?token=${token}`;

      console.log(`[Password Reset] Token for ${email}: ${token}`);
      console.log(`[Password Reset] URL: ${resetUrl}`);

      res.json({ message: "If that email exists, a reset link has been sent." });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  app.get("/api/auth/reset-password-page", async (req: Request, res: Response) => {
    const token = req.query.token as string;
    if (!token) return res.status(400).send("Missing token");

    const record = await storage.getPasswordResetToken(token);
    if (!record) {
      return res.send(`<html><body style="font-family:system-ui;display:flex;align-items:center;justify-content:center;height:100vh;margin:0;background:#FAFAF8">
        <div style="text-align:center;padding:40px">
          <h1 style="color:#E2725B">Link Expired</h1>
          <p style="color:#6B6B6F">This reset link has expired or already been used. Please request a new one.</p>
        </div></body></html>`);
    }

    res.send(`<html><head><meta name="viewport" content="width=device-width,initial-scale=1"></head>
      <body style="font-family:system-ui;display:flex;align-items:center;justify-content:center;height:100vh;margin:0;background:#FAFAF8">
      <div style="max-width:400px;width:100%;padding:40px">
        <h1 style="color:#1A535C;margin-bottom:24px">Reset Password</h1>
        <form method="POST" action="/api/auth/reset-password">
          <input type="hidden" name="token" value="${token}" />
          <div style="margin-bottom:16px">
            <label style="display:block;margin-bottom:4px;color:#6B6B6F;font-size:14px">New Password</label>
            <input type="password" name="password" required minlength="6" style="width:100%;padding:12px;border:1px solid #E8E6E1;border-radius:10px;font-size:16px;box-sizing:border-box" />
          </div>
          <div style="margin-bottom:24px">
            <label style="display:block;margin-bottom:4px;color:#6B6B6F;font-size:14px">Confirm Password</label>
            <input type="password" name="confirmPassword" required minlength="6" style="width:100%;padding:12px;border:1px solid #E8E6E1;border-radius:10px;font-size:16px;box-sizing:border-box" />
          </div>
          <button type="submit" style="width:100%;padding:14px;background:#1A535C;color:white;border:none;border-radius:10px;font-size:16px;cursor:pointer;font-weight:600">Reset Password</button>
        </form>
      </div></body></html>`);
  });

  app.post("/api/auth/reset-password", async (req: Request, res: Response) => {
    try {
      const { token, password, confirmPassword } = req.body;
      if (!token || !password) return res.status(400).json({ error: "Token and password required" });
      if (password !== confirmPassword) {
        return res.send(`<html><body style="font-family:system-ui;display:flex;align-items:center;justify-content:center;height:100vh;margin:0;background:#FAFAF8">
          <div style="text-align:center;padding:40px">
            <h1 style="color:#E2725B">Passwords Don't Match</h1>
            <p style="color:#6B6B6F">Please go back and try again.</p>
            <a href="javascript:history.back()" style="color:#1A535C">Go Back</a>
          </div></body></html>`);
      }

      const record = await storage.getPasswordResetToken(token);
      if (!record) {
        return res.send(`<html><body style="font-family:system-ui;display:flex;align-items:center;justify-content:center;height:100vh;margin:0;background:#FAFAF8">
          <div style="text-align:center;padding:40px">
            <h1 style="color:#E2725B">Link Expired</h1>
            <p style="color:#6B6B6F">This reset link has expired or already been used.</p>
          </div></body></html>`);
      }

      const hashed = await bcrypt.hash(password, 10);
      await storage.updateUser(record.userId, { password: hashed });
      await storage.markTokenUsed(record.id);

      res.send(`<html><body style="font-family:system-ui;display:flex;align-items:center;justify-content:center;height:100vh;margin:0;background:#FAFAF8">
        <div style="text-align:center;padding:40px">
          <div style="font-size:64px;margin-bottom:16px;color:#34C759">&#10003;</div>
          <h1 style="color:#1A535C">Password Reset!</h1>
          <p style="color:#6B6B6F">Your password has been updated. You can now log in with your new password in the app.</p>
        </div></body></html>`);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  // ── Health ──
  app.get("/api/health", (_req: Request, res: Response) => {
    res.json({ status: "ok", version: "1.0.0", name: "CulturePass API" });
  });

  const httpServer = createServer(app);
  return httpServer;
}
