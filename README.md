# Sofia trip dashboard

A client-side, editable Sofia trip dashboard for 22 to 25 October 2026.

## Live site

https://relrtl-hub.github.io/sofia-trip/

## What it includes

- Day-by-day route planning for Sofia.
- An airport arrival route, central heritage walk, Boyana nature route, and Vitosha shopping route.
- Four planned routes only: airport arrival, central Sofia, Boyana and southern return, and Vitosha shopping.
- Interactive Leaflet map with route segments, place markers, popups, and optional place labels.
- The same place groups as the Warsaw dashboard: Core, Sightseeing, Shopping, Restaurants, and Utilities.
- Core anchors for Sofia Airport, Art Hotel 158, Serdika Metro Station, Vitosha Metro Station, and Sofia Synagogue, also labelled Big Synagogue.
- Central Sofia route places: Alexander Nevsky Cathedral, Saint Sofia Church, Rotunda of St. George, Archaeological Museum, Ancient Serdika, Banya Bashi Mosque, Central Mineral Baths, Sofia City Court, Ivan Vazov National Theatre, Vitosha Boulevard, City Garden, Crystal Garden, and Beit Habad.
- Nature route places: Boyana Church, Boyana Lake, Boyana Waterfall, National Museum of History, Bulgaria Mall, and Yuzhen Park.
- Sofia-specific OpenStreetMap place search and local persistence for user-added places.
- Sofia weather forecast for 22 to 25 October.
- Live EUR/ILS exchange rate.
- Google Maps handoff links for individual places and planned routes.
- Local travel-paper links for the two flight PDFs and the Art Hotel 158 PNG under `public/travel-papers/`. These files are publicly downloadable if the static site is deployed.

## Current routes

### Airport arrival

Sofia Airport → Metro M4 → Serdika Metro Station → walk → Art Hotel 158.

### Central Sofia walk

Art Hotel 158 → Sofia Synagogue → Banya Bashi Mosque → Central Mineral Baths / Sofia History Museum → Ancient Serdika Archaeological Complex → Rotunda of St. George → Archaeological Museum → Sofia City Court → Vitosha Boulevard → City Garden → Ivan Vazov National Theatre → Crystal Garden → Saint Sofia Church → Alexander Nevsky Cathedral → Beit Habad / Chabad Sofia → Art Hotel 158.

### Boyana and southern return

Art Hotel 158 → Serdika Metro Station → Vitosha Metro Station → bus 64 → Boyana Church → Boyana Lake → Boyana Waterfall → National Museum of History → Bulgaria Mall → Yuzhen Park → Art Hotel 158.

### Vitosha shopping

Art Hotel 158 → Vitosha Boulevard → Graf Ignatiev Street → Serdika Center → Art Hotel 158.

## Technology

- React 19 and React DOM 19
- TypeScript 6
- Vite 8
- Leaflet and React-Leaflet
- OpenStreetMap tiles and Nominatim search
- OSM pedestrian-capable routing with Google Maps handoff
- Open-Meteo for Sofia weather
- Frankfurter / ECB reference rates for EUR to ILS
- Browser `localStorage` for user-added places and short-lived API caches

## Local development

Requirements:

- Node.js and npm.
- Network access for live map tiles, routing, weather, currency, and place search.

```bash
npm ci
npm run dev
```

The local site normally runs at:

```text
http://localhost:5173/sofia-trip/
```

For the production build:

```bash
npm run build
npm run preview
```

## Checks

```bash
npm run build
npm run lint
```

`npm run build` runs the TypeScript project build and creates the Vite output. `npm run lint` runs Oxlint.

## GitHub Pages

Repository:

https://github.com/relrtl-hub/sofia-trip

The site is deployed by `.github/workflows/deploy.yml` to:

https://relrtl-hub.github.io/sofia-trip/

The Vite base path is `/sofia-trip/`, so assets and future document links work under the repository Pages path.

## Privacy and future documents

The Sofia repository contains the requested flight and hotel files under `public/travel-papers/`. Anything placed under `public/` becomes part of the static GitHub Pages site and should be treated as publicly downloadable.

User-added places and API caches stay in the current browser profile. They are not committed or synchronized across devices.
