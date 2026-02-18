import type { Express, Request, Response } from "express";
import { createServer, type Server } from "node:http";
import { storage } from "./storage";
import bcrypt from "bcryptjs";
import session from "express-session";
import pgSession from "connect-pg-simple";
import pg from "pg";

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
      const { username, password, name, email, city, state } = req.body;
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
      const { name, email, city, state } = req.body;
      const updated = await storage.updateUser(req.session.userId, { name, email, city, state });
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

  // ── Health ──
  app.get("/api/health", (_req: Request, res: Response) => {
    res.json({ status: "ok", version: "1.0.0", name: "CulturePass API" });
  });

  const httpServer = createServer(app);
  return httpServer;
}
