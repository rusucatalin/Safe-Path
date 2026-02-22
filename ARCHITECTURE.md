# SafePath AI — Arhitectură

## Stack

| Layer        | Tehnologie              | Scop                                      |
|-------------|--------------------------|-------------------------------------------|
| UI          | React Native (Expo)      | Cross-platform iOS/Android                |
| Routing     | Expo Router              | File-based routing, (auth) / (tabs)       |
| Auth        | Firebase Auth            | Email/parolă + Google                     |
| Database    | Firebase Firestore       | Incidente, users, savedRoutes             |
| Hartă       | Leaflet + OSM în WebView | Harta Chișinău, markere, rute            |
| State       | Zustand                  | authStore, mapStore, uiStore              |
| Rute OSM    | OSRM API                 | Rute pietonale (ulterior)                 |

## Diagram arhitectură

```
┌─────────────────────────────────────────────────────────────────┐
│                     React Native (Expo)                          │
│  ┌─────────────────────────────────────────────────────────────┐│
│  │  Expo Router                                                 ││
│  │  (auth)/login, register  →  (tabs)/map, report, profile      ││
│  └─────────────────────────────────────────────────────────────┘│
│  ┌──────────────┐ ┌──────────────┐ ┌──────────────┐            │
│  │ Auth Screens │ │ Map (WebView)│ │ Report/Profile│            │
│  └──────┬───────┘ └──────┬───────┘ └──────┬───────┘            │
│         │                │                 │                     │
│  ┌──────▼────────────────▼─────────────────▼──────────────────┐│
│  │  Services: authService | incidentService | routeService     ││
│  └──────┬─────────────────────────────────────────────────────┘│
│  ┌──────▼────────────┐  ┌─────────────────────────────────────┐│
│  │  Store (Zustand)   │  │  WebView ↔ Leaflet (postMessage)    ││
│  │  authStore, etc.   │  │  OSM Chișinău + OSRM                ││
│  └──────┬────────────┘  └─────────────────────────────────────┘│
└─────────┼──────────────────────────┬────────────────────────────┘
          │                          │
    ┌─────▼──────┐            ┌───────▼────────┐
    │  Firebase  │            │  OSRM /       │
    │  Auth +     │            │  Nominatim    │
    │  Firestore  │            │  (rute/geo)   │
    └────────────┘            └───────────────┘
```

## Flux autentificare

1. App load → `_layout.tsx` citește `authStore.user` / Firebase `onAuthStateChanged`.
2. Dacă `user == null` → redirect la `/(auth)/login`.
3. După login/register reușit → `authStore.setUser` → redirect la `/(tabs)`.
4. Logout → `authService.logout()` → `authStore.clearUser` → redirect la `/(auth)/login`.

## Comunicare RN ↔ Leaflet (WebView)

- **RN → Leaflet:** `webViewRef.injectJavaScript(script)`.
- **Leaflet → RN:** `window.ReactNativeWebView.postMessage(JSON.stringify(data))`.
- Evenimente: set markers, set route polyline, on marker click, location update.

## Structura directoare (boilerplate)

```
app/
  _layout.tsx           # Root layout, auth state → (auth) sau (tabs)
  (auth)/
    _layout.tsx         # Stack: login, register
    login.tsx
    register.tsx
  (tabs)/
    _layout.tsx         # Bottom tabs
    map.tsx             # Harta (Leaflet WebView)
    report.tsx          # Raport incident (placeholder)
    profile.tsx         # Profil (placeholder)

components/
  MapView/
    LeafletMap.tsx
    leaflet.html
  ui/                   # Input, Button, etc. reutilizabile

services/
  firebase/
    config.ts
    authService.ts

store/
  authStore.ts

types/
  user.types.ts

constants/
  chisinau.ts
```

## Securitate

- Credențiale Firebase doar în `.env` (EXPO_PUBLIC_*).
- Firestore Rules: users (read auth, write self), incidents (read all, create/update auth), savedRoutes (owner only).
