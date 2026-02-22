# 🛡️ SafePath AI — Aplicație de navigare sigură pentru pietoni în Chișinău

> Aplicație mobilă care ajută pietonii să navigheze prin Chișinău evitând zonele periculoase, aglomerate sau cu infracțiuni ridicate — combinând date deschise, feedback comunitar și hartă OSM în timp real.

---

## 📋 Cuprins

1. [Viziunea produsului](#viziunea-produsului)
2. [Stack tehnologic](#stack-tehnologic)
3. [Arhitectura sistemului](#arhitectura-sistemului)
4. [Structura proiectului](#structura-proiectului)
5. [Schema bazei de date (Firebase)](#schema-bazei-de-date-firebase)
6. [Ecranele aplicației (UI/UX)](#ecranele-aplicatiei-uiux)
7. [Funcționalități — Faza 1 (fără AI)](#functionalitati--faza-1-fara-ai)
8. [Roadmap de implementare pas cu pas](#roadmap-de-implementare-pas-cu-pas)
9. [Instalare și rulare locală](#instalare-si-rulare-locala)
10. [Variabile de mediu](#variabile-de-mediu)
11. [Ce urmează (Faza 2 — AI)](#ce-urmeaza-faza-2--ai)

---

## Viziunea produsului

SafePath AI este un asistent de navigare pentru pietoni în Chișinău. Spre deosebire de Google Maps sau Waze (orientate pe mașini), SafePath optimizează rutele pietonale ținând cont de:

- **Siguranță** — zone cu infracțiuni raportate, iluminat slab, locuri izolate
- **Aglomerație** — intersecții sau zone cu trafic pietonal intens
- **Feedback comunitar** — utilizatorii raportează incidente în timp real
- **Ora zilei** — un traseu sigur ziua poate fi periculos noaptea

**Faza 1** (acest README) acoperă aplicația de bază fără AI — infrastructura, harta, autentificarea, raportarea incidentelor și rutele simple.

---

## Stack tehnologic

| Componentă | Tehnologie | Rol |
|---|---|---|
| Frontend mobile | React Native (Expo) | UI cross-platform iOS/Android |
| Autentificare | Firebase Auth | Login cu email/parolă și Google |
| Bază de date | Firebase Firestore | Stocare incidente, utilizatori, rute |
| Hartă | Leaflet.js + OpenStreetMap | Harta Chișinău, rute pietonale |
| Integrare hartă RN | react-native-webview | Leaflet rulează într-un WebView |
| Routing pietonal | OSRM (public API) | Calcul rute pietonale pe OSM |
| State management | Zustand sau Context API | State global simplu |
| Navigație | React Navigation v6 | Stack + Tab navigation |

---

## Arhitectura sistemului

```
┌─────────────────────────────────────────────────────────┐
│                  React Native App (Expo)                 │
│                                                          │
│  ┌──────────────┐  ┌──────────────┐  ┌───────────────┐  │
│  │  Auth Screen │  │  Map Screen  │  │ Report Screen │  │
│  └──────┬───────┘  └──────┬───────┘  └──────┬────────┘  │
│         │                 │                  │           │
│  ┌──────▼─────────────────▼──────────────────▼────────┐  │
│  │              Services Layer                         │  │
│  │  authService | incidentService | routeService       │  │
│  └──────┬──────────────────┬──────────────────────────┘  │
│         │                  │                              │
└─────────┼──────────────────┼──────────────────────────── ┘
          │                  │
    ┌─────▼──────┐    ┌──────▼────────────────────────┐
    │  Firebase  │    │         WebView (Leaflet)       │
    │            │    │                                 │
    │  - Auth    │    │  OSM Chișinău + markers         │
    │  - Firestore    │  + rute OSRM                   │
    └────────────┘    └──────────────────┬──────────────┘
                                         │
                                  ┌──────▼──────┐
                                  │  OSRM API   │
                                  │ (routing)   │
                                  └─────────────┘
```

### Flux de date — Raportare incident

```
Utilizator → Report Screen → incidentService.addIncident()
    → Firestore (incidents collection)
    → Map Screen ascultă schimbările (onSnapshot)
    → Leaflet primește noile date via WebView postMessage
    → Marker apare pe hartă în timp real
```

### Comunicare React Native ↔ Leaflet (WebView)

Deoarece Leaflet nu rulează nativ în React Native, se folosește un `WebView` care încarcă un fișier HTML local cu Leaflet:

```
React Native → webViewRef.injectJavaScript(...)  →  Leaflet
React Native ←  window.ReactNativeWebView.postMessage(...)  ← Leaflet
```

---

## Structura proiectului

```
safepath-ai/
├── app/                          # Expo Router sau React Navigation
│   ├── (auth)/
│   │   ├── login.tsx
│   │   └── register.tsx
│   ├── (tabs)/
│   │   ├── map.tsx               # Ecranul principal cu harta
│   │   ├── report.tsx            # Raportare incident
│   │   ├── history.tsx           # Istoricul rapoartelor mele
│   │   └── profile.tsx           # Profil utilizator
│   └── _layout.tsx
│
├── components/
│   ├── MapView/
│   │   ├── LeafletMap.tsx        # WebView wrapper pentru Leaflet
│   │   ├── leaflet.html          # HTML cu Leaflet init
│   │   └── mapUtils.ts           # Funcții postMessage helper
│   ├── IncidentMarker.tsx
│   ├── RoutePanel.tsx            # Panoul de jos cu detalii rută
│   └── ReportForm.tsx
│
├── services/
│   ├── firebase/
│   │   ├── config.ts             # Firebase init
│   │   ├── authService.ts        # Login, register, logout
│   │   └── incidentService.ts    # CRUD incidente Firestore
│   ├── routing/
│   │   └── osrmService.ts        # Cereri OSRM pentru rute pietonale
│   └── location/
│       └── locationService.ts    # expo-location wrapper
│
├── store/
│   ├── authStore.ts              # State autentificare
│   ├── mapStore.ts               # State hartă (incidente, rută activă)
│   └── uiStore.ts                # Loading states, modals
│
├── types/
│   ├── incident.types.ts
│   ├── route.types.ts
│   └── user.types.ts
│
├── constants/
│   ├── chisinau.ts               # Coordonate centru, bounds Chișinău
│   └── incidentTypes.ts          # Tipuri de incidente și iconițe
│
├── assets/
│   └── icons/                    # Iconițe markere (pericol, iluminat, etc.)
│
├── app.json
├── package.json
└── .env
```

---

## Schema bazei de date (Firebase)

### Colecția `users`

```
users/{userId}
  ├── uid: string
  ├── email: string
  ├── displayName: string
  ├── photoURL: string | null
  ├── createdAt: Timestamp
  ├── reportsCount: number        // câte rapoarte a făcut
  └── reputation: number          // puncte pentru contribuții valide
```

### Colecția `incidents`

```
incidents/{incidentId}
  ├── id: string
  ├── type: IncidentType          // 'crime' | 'poor_lighting' | 'crowded' | 'construction' | 'other'
  ├── severity: 1 | 2 | 3        // 1=minor, 2=moderat, 3=sever
  ├── location: GeoPoint          // lat/lng
  ├── address: string             // adresa textuală (Strada X, Chișinău)
  ├── description: string
  ├── reportedBy: string          // userId
  ├── createdAt: Timestamp
  ├── expiresAt: Timestamp        // auto-expiră după 24h (incidente temporare)
  ├── upvotes: number             // alți useri confirmă incidentul
  ├── downvotes: number           // alți useri infirmă incidentul
  ├── status: 'active' | 'expired' | 'resolved'
  └── imageUrl: string | null     // poză opțională
```

### Colecția `savedRoutes`

```
savedRoutes/{routeId}
  ├── userId: string
  ├── name: string                // "Acasă → Birou"
  ├── origin: GeoPoint
  ├── destination: GeoPoint
  ├── originLabel: string
  ├── destinationLabel: string
  ├── createdAt: Timestamp
  └── usageCount: number
```

### Colecția `votes` (subcollecție)

```
incidents/{incidentId}/votes/{userId}
  ├── userId: string
  ├── vote: 'up' | 'down'
  └── createdAt: Timestamp
```

### Reguli Firestore (Security Rules)

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {

    // Utilizatori — citesc toți autentificați, scriu doar ei înșiși
    match /users/{userId} {
      allow read: if request.auth != null;
      allow write: if request.auth.uid == userId;
    }

    // Incidente — citesc toți, scriu doar autentificați
    match /incidents/{incidentId} {
      allow read: if true;
      allow create: if request.auth != null;
      allow update: if request.auth != null;  // pentru upvote/downvote
      allow delete: if request.auth.uid == resource.data.reportedBy;
    }

    // Rute salvate — doar proprietarul
    match /savedRoutes/{routeId} {
      allow read, write: if request.auth.uid == resource.data.userId;
    }
  }
}
```

---

## Ecranele aplicației (UI/UX)

### 1. Ecranul de Onboarding (3 slide-uri)
- Slide 1: "Navighează sigur prin Chișinău" + ilustrație hartă
- Slide 2: "Raportează pericole în timp real" + ilustrație pin
- Slide 3: "Comunitatea te ține în siguranță" + ilustrație grup
- Butoane: `Înapoi` / `Continuă` / `Începe` (ultimul slide)

### 2. Ecranul de Login / Register
- Tab-uri: `Autentificare` | `Înregistrare`
- Câmpuri: Email, Parolă (+ Confirmare parolă la register)
- Buton `Continuă cu Google`
- Link `Am uitat parola`

### 3. Ecranul principal — Harta (Tab principal)

```
┌─────────────────────────────────┐
│  🔍  Caută destinație...    [👤] │  ← Header
├─────────────────────────────────┤
│                                 │
│         HARTĂ LEAFLET           │
│         (OSM Chișinău)          │
│                                 │
│   [🔴] marker incident          │
│   [🟡] marker iluminat slab     │
│   [🔵] marker aglomerație       │
│                                 │
│                    [📍]         │  ← Buton localizare curentă
├─────────────────────────────────┤
│  📍 Locația ta curentă          │  ← Panoul de jos (collapsed)
│  ──────────────────────────     │
│  [+ Raportează]  [🔍 Rută]      │
└─────────────────────────────────┘
```

**Interacțiuni hartă:**
- Tap pe marker → popup cu detalii incident (tip, severitate, timp raportat, nr. upvote-uri)
- Long press pe hartă → opțiune "Raportează incident aici"
- Pinch to zoom, drag pentru navigare
- Buton centrat pe locația curentă

### 4. Ecranul de căutare rută

```
┌─────────────────────────────────┐
│  ← Calculează rută              │
├─────────────────────────────────┤
│  📍 Locația curentă             │
│  ─────────────────────────      │
│  🏁 Destinație...               │
│                                 │
│  Rute salvate:                  │
│  ⭐ Acasă → Birou               │
│  ⭐ Centru → Universitate        │
│                                 │
│       [ Calculează rută ]       │
└─────────────────────────────────┘
```

**După calcul — Rută afișată pe hartă:**
- Linie albastră pentru ruta calculată de OSRM
- Indicatori: distanță (km) și timp estimat (minute mers pe jos)
- Markere incidente pe traseul calculat evidențiate
- Buton `Pornește navigarea` (mod pas cu pas — Faza 2)

### 5. Ecranul de raportare incident

```
┌─────────────────────────────────┐
│  ← Raportează incident          │
├─────────────────────────────────┤
│  📍 Locație detectată:          │
│     Str. Ștefan cel Mare, 45    │
│     [Schimbă locația pe hartă]  │
│                                 │
│  Tipul incidentului:            │
│  ┌──────┐ ┌──────┐ ┌─────────┐ │
│  │ 🔴   │ │ 💡   │ │  👥    │ │
│  │Crimă │ │Ilum. │ │Aglom.  │ │
│  └──────┘ └──────┘ └─────────┘ │
│  ┌──────┐ ┌──────┐             │
│  │ 🚧   │ │ ❓   │             │
│  │Const.│ │Altul │             │
│  └──────┘ └──────┘             │
│                                 │
│  Severitate:  ○ Mic ● Mediu ○ Mare │
│                                 │
│  Descriere (opțional):          │
│  ┌────────────────────────────┐ │
│  │                            │ │
│  └────────────────────────────┘ │
│                                 │
│  📷 Adaugă fotografie           │
│                                 │
│       [ Trimite raport ]        │
└─────────────────────────────────┘
```

### 6. Ecranul Profil

- Avatar + Nume utilizator
- Statistici: Rapoarte trimise, Upvote-uri primite, Reputație
- Listă rapoarte personale cu status (activ/expirat/rezolvat)
- Setări notificări
- Buton Deconectare

---

## Funcționalități — Faza 1 (fără AI)

### ✅ Autentificare
- [x] Register cu email + parolă
- [x] Login cu email + parolă
- [x] Login cu Google (OAuth)
- [x] Logout
- [x] Persistența sesiunii (Firebase Auth State)
- [x] Resetare parolă prin email

### ✅ Harta
- [x] Afișare hartă OSM Chișinău cu Leaflet în WebView
- [x] Localizare curentă (expo-location)
- [x] Centrare pe locația utilizatorului
- [x] Markere incidente active pe hartă (cu culori pe tip)
- [x] Popup informativ la tap pe marker
- [x] Actualizare markere în timp real (Firestore onSnapshot)

### ✅ Raportare incidente
- [x] Formular raportare cu tip, severitate, descriere
- [x] Detectare automată locație la deschiderea formularului
- [x] Selecție manuală locație pe hartă (long press)
- [x] Încărcare imagine opțională (Firebase Storage)
- [x] Expirare automată incidente după 24h (Firestore TTL sau Cloud Function)

### ✅ Sistem Votare
- [x] Upvote / Downvote pe incidente (confirmare sau infirmare)
- [x] Un singur vot per utilizator per incident
- [x] Incidentele cu downvote majoritar devin inactive automat

### ✅ Calcul rute
- [x] Căutare destinație (geocoding OSM Nominatim)
- [x] Calcul rută pietonală via OSRM public API
- [x] Afișare rută pe hartă (polyline albastru)
- [x] Afișare distanță și timp estimat
- [x] Salvare rute favorite în Firestore

### ✅ Profil utilizator
- [x] Vizualizare și editare profil
- [x] Istoricul incidentelor raportate
- [x] Statistici personale

---

## Roadmap de implementare pas cu pas

### Sprint 1 — Fundație (Săptămâna 1-2)

**Obiectiv:** Proiect funcțional cu hartă și autentificare

1. Inițializare proiect Expo + TypeScript
   ```bash
   npx create-expo-app safepath-ai --template expo-template-blank-typescript
   ```

2. Instalare dependențe principale
   ```bash
   npx expo install expo-location expo-image-picker
   npm install @react-navigation/native @react-navigation/bottom-tabs @react-navigation/stack
   npm install firebase
   npm install zustand
   npx expo install react-native-webview
   ```

3. Configurare Firebase (Auth + Firestore)
   - Creare proiect Firebase
   - Activare Email/Password și Google Auth
   - Creare Firestore database în modul test
   - Adăugare `google-services.json` (Android) și `GoogleService-Info.plist` (iOS)

4. Implementare `authService.ts` — register, login, logout, Google sign-in

5. Creare ecrane Login / Register cu validare formular

6. Creare fișierul `leaflet.html` cu Leaflet inițializat pe Chișinău
   ```html
   <!-- Centrat pe Chișinău: lat 47.0105, lng 28.8638 -->
   var map = L.map('map').setView([47.0105, 28.8638], 13);
   ```

7. Creare componentei `LeafletMap.tsx` cu WebView + comunicare bidirecțională

8. Ecran principal cu harta afișată și localizare curentă

**Deliverable:** Poți vedea harta Chișinău, te poți autentifica.

---

### Sprint 2 — Incidente (Săptămâna 3-4)

**Obiectiv:** Raportare și vizualizare incidente pe hartă

1. Definire tipuri TypeScript pentru `Incident`

2. Implementare `incidentService.ts`
   - `addIncident(data)` — scrie în Firestore
   - `subscribeToIncidents(callback)` — onSnapshot listener activ
   - `voteIncident(id, type)` — upvote/downvote

3. Creare ecran `ReportScreen` cu formularul complet

4. Integrare Firestore → Leaflet
   - La fiecare update Firestore, trimite lista incidentelor via `postMessage` către WebView
   - Leaflet procesează lista și actualizează markerii pe hartă

5. Definire iconițe și culori per tip incident:
   - 🔴 Roșu — Crimă / Pericol
   - 🟡 Galben — Iluminat slab
   - 🔵 Albastru — Aglomerație
   - 🟠 Portocaliu — Construcții / Obstacole

6. Implementare popup Leaflet la click pe marker cu butoane upvote/downvote

7. Logică expirare incidente (Cloud Function triggered by Firestore sau verificare la citire)

**Deliverable:** Poți raporta un incident și îl vezi apărând pe hartă în timp real.

---

### Sprint 3 — Rute (Săptămâna 5-6)

**Obiectiv:** Calcul și afișare rute pietonale

1. Implementare `osrmService.ts`
   ```typescript
   // OSRM public API pentru rute pietonale
   const url = `https://router.project-osrm.org/route/v1/foot/${origin.lng},${origin.lat};${dest.lng},${dest.lat}?overview=full&geometries=geojson`;
   ```

2. Geocoding pentru căutare destinație
   ```typescript
   // Nominatim OSM pentru geocoding gratuit
   const url = `https://nominatim.openstreetmap.org/search?q=${query}&format=json&limit=5&countrycodes=md`;
   ```

3. Creare ecran `SearchRouteScreen` cu câmpuri origine/destinație

4. Afișare rută în Leaflet ca polyline (GeoJSON de la OSRM)

5. Calculare și afișare metrici rută (distanță, timp estimat la 5 km/h mers pe jos)

6. Implementare rute salvate în Firestore

7. Evidențiere marchere incidente din apropierea traseului (distanță < 50m de polyline)

**Deliverable:** Poți calcula o rută pietonală de la A la B și vezi incidentele de pe traseu.

---

### Sprint 4 — Polish UI/UX (Săptămâna 7-8)

**Obiectiv:** Aplicație finisată, pregătită pentru utilizatori reali

1. Implementare ecran Onboarding (first-time users)

2. Finalizare ecran Profil cu statistici și istoric

3. Notificări locale (expo-notifications)
   - Notificare când un incident e raportat în raza de 500m față de tine

4. Tratare erori și stări de loading în tot UI-ul

5. Testare pe device-uri fizice Android și iOS

6. Optimizare performanță WebView (debounce update markere)

7. Localizare în română și rusă (i18n-js sau expo-localization)

8. Configurare Firestore Security Rules finale (înlocuiesc regulile de test)

**Deliverable:** Aplicație completă, stabilă, gata de beta-testare cu utilizatori reali din Chișinău.

---

## Instalare și rulare locală

### Cerințe

- Node.js 18+
- Expo CLI: `npm install -g expo-cli`
- Cont Firebase (gratuit)
- Expo Go pe telefon (pentru testare rapidă)

### Pași

```bash
# 1. Clonează repository-ul
git clone https://github.com/yourname/safepath-ai.git
cd safepath-ai

# 2. Instalează dependențele
npm install

# 3. Configurează variabilele de mediu
cp .env.example .env
# Editează .env cu credențialele tale Firebase

# 4. Pornește aplicația
npx expo start

# 5. Scanează QR code-ul cu Expo Go (Android) sau Camera (iOS)
```

---

## Variabile de mediu

Crează fișierul `.env` în rădăcina proiectului:

```env
EXPO_PUBLIC_FIREBASE_API_KEY=your_api_key
EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
EXPO_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
EXPO_PUBLIC_FIREBASE_APP_ID=your_app_id
```
---

## Ce urmează (Faza 2 — AI)

- **Predicție pericol pe oră** — model ML care prezice nivelul de pericol pe fiecare stradă în funcție de ora zilei, ziua săptămânii și istoricul incidentelor
- **Scoring de siguranță pentru rute** — fiecare rută primește un scor 0-100 bazat pe incidentele de pe traseu și predicțiile AI
- **Rută optimizată de siguranță** — nu cel mai scurt drum, ci cel mai sigur
- **Heatmap de pericol** — vizualizare zone roșii/galbene/verzi pe hartă
- **Alertă proactivă** — notificare automată când intri într-o zonă marcată ca periculoasă
- **Analiza datelor deschise** — integrare cu date publice disponibile despre Chișinău (iluminat stradal, camere de supraveghere, date poliție)

---

*SafePath AI — construit pentru pietonii din Chișinău 🇲🇩*
