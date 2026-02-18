# CulturePass

## Overview
CulturePass is a mobile app for discovering and booking cultural events for Kerala/Malayalee communities in Australia. Built with Expo (React Native) + Express backend with PostgreSQL database.

## Recent Changes
- 2026-02-18: Social media links (Facebook, Instagram, Twitter/X, YouTube, TikTok, LinkedIn) and website URL fields added to users, organisations, businesses, artists, venues; SocialLinksBar component on all detail pages; social fields in submission forms and profile edit
- 2026-02-18: Stripe payment integration for paid event ticket purchases via /api/checkout endpoint; free events confirmed directly, paid events redirect to Stripe checkout
- 2026-02-18: Admin system with role-based access (roleGlobal field), admin dashboard (/admin), pending submission approval/rejection, admin API routes (/api/admin/*)
- 2026-02-18: User submission forms (/submit) for organisations, businesses, artists with pending status workflow
- 2026-02-18: Full auth system with login/signup/logout, profile editing, API-backed saved events (replaced AsyncStorage), join community, book tickets with auth guards
- 2026-02-18: Full backend infrastructure with PostgreSQL database, Drizzle ORM, REST API, session auth, and all screens connected to live data
- 2026-02-17: Initial MVP build with event discovery, calendar, community directory, business listings, artist profiles, perks, and user profile

## Architecture
- **Frontend**: Expo Router (file-based routing) with React Native
- **Backend**: Express server on port 5000
- **Database**: PostgreSQL with Drizzle ORM (`shared/schema.ts` for schema, `server/storage.ts` for queries)
- **Auth**: Session-based auth with connect-pg-simple for PostgreSQL session storage
- **Data Fetching**: React Query (`@tanstack/react-query`) with default queryFn in `lib/query-client.ts`
- **Fonts**: Poppins (Google Fonts)
- **Colors**: Warm coral/terracotta primary (#E2725B), deep teal secondary (#1A535C), gold accent (#D4A017)

## Database Schema (shared/schema.ts)
- users, events, organisations, businesses, artists, perks, orders, memberships
- CPID system for unique entity identification (e.g., CP-EVT-001, CP-ORG-001)

## API Routes (server/routes.ts)
- Auth: POST /api/auth/register, /api/auth/login, /api/auth/logout; GET /api/auth/me
- Events: GET /api/events, /api/events/featured, /api/events/trending, /api/events/dates, /api/events/by-date/:date, /api/events/:id; POST/PUT/DELETE /api/events/:id
- Organisations: GET /api/organisations, /api/organisations/:id; POST/PUT
- Businesses: GET /api/businesses, /api/businesses/:id; POST/PUT
- Artists: GET /api/artists, /api/artists/featured, /api/artists/:id; POST/PUT
- Perks: GET /api/perks, /api/perks/:id; POST
- Orders: GET/POST /api/orders
- Checkout: POST /api/checkout (Stripe for paid events, direct confirm for free)
- Memberships: GET/POST /api/memberships
- Users: POST /api/users/save-event; PUT /api/users/profile
- Admin: GET /api/admin/stats, /api/admin/pending; POST /api/admin/approve/:type/:id, /api/admin/reject/:type/:id
- CPID lookup: GET /api/cpid/:cpid

## Tab Structure
- Discover (index) - Featured/trending events, search, categories
- Calendar - Month view with event dates
- Community - Organisations, businesses, artists tabs
- Perks - Member discount codes
- Profile - Auth gate, saved events, my tickets, my communities, edit profile, logout

## Detail Screens
- /event/[id] - Full event details with booking (Stripe checkout for paid, direct confirm for free)
- /community/[id] - Organisation detail
- /artist/[id] - Artist profile
- /business/[id] - Business detail
- /allevents - All events list with category filter
- /admin - Admin dashboard (stats, pending submissions, approve/reject)
- /submit - User submission forms (organisations, businesses, artists)
- /settings/notifications - Notification toggle preferences
- /settings/privacy - Profile visibility, data sharing, account management
- /settings/help - FAQ accordion, contact options, community guidelines
- /settings/about - App info, mission, features, social links

## Key Libraries
- @expo-google-fonts/poppins for typography
- expo-image for optimized images
- expo-linear-gradient for gradients
- expo-haptics for touch feedback
- @react-native-async-storage/async-storage for local persistence
- @tanstack/react-query for server state
- drizzle-orm + drizzle-kit for database
- connect-pg-simple for session storage

## Auth Flow
- AuthProvider wraps app in lib/auth.tsx with React Context
- Auth modal at /auth route with login/signup toggle
- All protected actions (save event, book ticket, join community) redirect to /auth if not logged in
- Saved events are API-backed via POST /api/users/save-event (toggled)
- Join community via POST /api/memberships
- Book tickets via POST /api/orders

## Notes
- Query keys use array format: ['/api/resource', id] which joins to /api/resource/id via default queryFn
- lib/storage.ts exists but is no longer used (AsyncStorage replaced by API calls)
