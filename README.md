# PACKMATE – Intelligent Packing Planner

> **Pack Smart. Travel Easy.**  
> *Make every journey stress-free, organized, and unforgettable.*

**PACKMATE** is a 100% offline, production-grade React Native mobile application built with **Expo (SDK 58)**, **TypeScript**, and **Expo SQLite** for University **ICA 03 – Individual React Native Project**.

---

## Core Features

1. **Trip Creation & Management** — Create, edit, and manage trips with interactive calendar date pickers, automatic duration calculation, traveller count scaling, and automatic date-driven status updates (`Upcoming`, `Ongoing`, `Completed`).
2. **Destination-Based Packing Templates** — 8 locally stored packing templates (**158 curated items**) covering *Beach Vacation, Business Trip, Camping, Mountain Adventure, International Travel, Family Vacation, Weekend Getaway,* and *City Exploration*.
3. **Intelligent Offline Recommendation Engine** — Local rule engine combining trip type, destination environment keywords, trip duration, and traveller count to generate deduplicated Essential & Optional packing lists.
4. **Interactive Packing Checklist** — Smooth Reanimated checkmark toggles, inline quantity steppers, custom item creation, item editing, search, and multi-axis filtering.
5. **7 Structured Item Categories** — *Clothing, Toiletries, Electronics, Documents, Accessories, Travel Essentials,* and *Health & Safety* with expandable accordions and per-category progress tracking.
6. **Dynamic Packing Progress & Previous Trip History** — Live SQLite-driven completion percentages, SVG circular progress rings, completed trip history archive, and non-destructive **Reuse Packing List** cloning for new trips.

---

## Technology Stack

- **Framework**: React Native `0.88` + Expo `~58.0` + TypeScript `~6.0`
- **Navigation**: `@react-navigation/native`, `@react-navigation/native-stack`, `@react-navigation/bottom-tabs`
- **Local Relational Database**: `expo-sqlite` (`packmate.db` with WAL mode, foreign keys, indexes, and atomic transactions)
- **Animations & Gestures**: `react-native-reanimated`, `react-native-worklets`, `react-native-gesture-handler`, `react-native-safe-area-context`
- **Vector UI**: `lucide-react-native`, `react-native-svg`, `expo-linear-gradient`
- **Offline Guarantee**: Zero external APIs, zero cloud databases, zero network requests.

---

## Running Locally

```bash
# 1. Install dependencies
npm install

# 2. Start Expo development server
npx expo start

# 3. Run TypeScript verification
npm run typecheck
```

Scan the QR code with **Expo Go** on Android/iOS, or press `a` for Android emulator / `i` for iOS simulator.
