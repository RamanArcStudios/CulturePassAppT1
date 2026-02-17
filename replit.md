# CulturePass

## Overview
CulturePass is a mobile app for discovering and booking cultural events for Kerala/Malayalee communities in Australia. Built with Expo (React Native) + Express backend.

## Recent Changes
- 2026-02-17: Initial MVP build with event discovery, calendar, community directory, business listings, artist profiles, perks, and user profile

## Architecture
- **Frontend**: Expo Router (file-based routing) with React Native
- **Backend**: Express server on port 5000
- **Data**: Local sample data in `lib/data.ts`, AsyncStorage for user preferences
- **Fonts**: Poppins (Google Fonts)
- **Colors**: Warm coral/terracotta primary (#E2725B), deep teal secondary (#1A535C), gold accent (#D4A017)

## Tab Structure
- Discover (index) - Featured/trending events, search, categories
- Calendar - Month view with event dates
- Community - Organisations, businesses, artists tabs
- Perks - Member discount codes
- Profile - Saved events, settings

## Detail Screens
- /event/[id] - Full event details with booking
- /community/[id] - Organisation detail
- /artist/[id] - Artist profile
- /business/[id] - Business detail
- /allevents - All events list with category filter

## Key Libraries
- @expo-google-fonts/poppins for typography
- expo-image for optimized images
- expo-linear-gradient for gradients
- expo-haptics for touch feedback
- @react-native-async-storage/async-storage for local persistence
