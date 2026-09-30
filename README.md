# 🚆 Where Is My Train — Clone

A railway information web app inspired by the *Where Is My Train* app, built as a college **Advanced Web Technologies (AWT)** group project.

Users can search trains between two stations, check the running status and schedule of a train, see the coach position (coach order) of a train, check PNR status, and get help from a Help Desk page.

```
Frontend (HTML / CSS / JavaScript)  ──fetch()──▶  Express backend (Node.js)  ──axios──▶  RapidAPI (IRCTC API)
                                                        │
                                                        └──mongoose──▶  MongoDB Atlas (search history)
```

---

## Table of Contents

1. [Features](#features)
2. [Tech Stack](#tech-stack)
3. [Project Structure](#project-structure)
4. [Getting Started](#getting-started)
5. [Environment Variables](#environment-variables)
6. [Backend in Detail](#backend-in-detail)
   - [Startup sequence](#startup-sequence)
   - [Middleware](#middleware)
   - [MongoDB connection and models](#mongodb-connection-and-models)
   - [API reference](#api-reference)
   - [Live data vs. fallback data](#live-data-vs-fallback-data)
   - [Error handling](#error-handling)
7. [Frontend in Detail](#frontend-in-detail)
   - [Page flow](#page-flow)
   - [Pages](#pages)
   - [URL parameters](#url-parameters)
8. [Which RapidAPI endpoints work](#which-rapidapi-endpoints-work)
9. [Testing the Project](#testing-the-project)
10. [Troubleshooting](#troubleshooting)
11. [Security Notes](#security-notes)
12. [Git Workflow and Branches](#git-workflow-and-branches)
13. [Team](#team)
14. [Known Limitations and Future Work](#known-limitations-and-future-work)

---

## Features

| Feature | Page | Data source |
|---|---|---|
| Search trains between two stations | `train-list.html` | Backend → RapidAPI, with sample fallback data |
| Live running status and schedule of a train | `tracking.html` | Backend → RapidAPI, with sample fallback data |
| Coach position (order of coaches) and seat layouts | `coach.html` | **Live** from RapidAPI; static sample layout as fallback |
| PNR status | `index.html` (PNR tab) | **Live** from RapidAPI |
| Help Desk (searchable help topics, contact links) | `helpdesk.html` | Static content |
| Search history (proves MongoDB integration) | `GET /api/history` | MongoDB Atlas |
| Classic tracker with a route timeline | `index-legacy.html` | Backend → RapidAPI, with sample fallback data |

---

## Tech Stack

### Backend (`backend/`)

| Package | Version | What it is used for |
|---|---|---|
| [Node.js](https://nodejs.org/) | 18+ (tested on 24) | JavaScript runtime |
| [express](https://expressjs.com/) | ^5.2.1 | Web server and routing |
| [cors](https://www.npmjs.com/package/cors) | ^2.8.6 | Lets the browser frontend call the API from another origin |
| [dotenv](https://www.npmjs.com/package/dotenv) | ^17.4.2 | Loads secrets from `backend/.env` into `process.env` |
| [mongoose](https://mongoosejs.com/) | ^9.8.1 | MongoDB object modelling (schemas, models, queries) |
| [axios](https://axios-http.com/) | ^1.19.0 | HTTP client used to call RapidAPI |

### Frontend (`frontend/`)

- Plain **HTML5**, **CSS3** and **vanilla JavaScript**. There is no framework and no build step.
- The browser `fetch()` API is used to call the backend.
- Google Fonts (Inter) on the Home and Help Desk pages.

### External services

- **MongoDB Atlas**: a cloud MongoDB database that stores the search history.
- **RapidAPI, "IRCTC Indian Railway PNR Status" API** (`irctc-indian-railway-pnr-status.p.rapidapi.com`): provides the railway data.

---

## Project Structure

```
where-is-my-train-clone/
├── .gitignore                 # ignores node_modules/ and .env
├── README.md                  # this file
├── package.json               # stray root manifest (only mongoose); not needed to run the app
│
├── backend/
│   ├── server.js              # Express app: middleware, MongoDB connection, all API routes
│   ├── models/
│   │   └── Train.js           # Mongoose model for train schedules (used by seed.js only)
│   ├── seed.js                # optional script that fills the "trains" collection with sample data
│   ├── package.json           # backend dependencies
│   ├── package-lock.json
│   ├── .env.example           # template for your .env (no real secrets)
│   └── .env                   # YOUR secrets. Not committed; create it yourself.
│
└── frontend/
    ├── index.html             # Home page: Search Train / PNR Status / Coach Position tabs
    ├── css/home.css           # Home page styles (also used by helpdesk.html)
    ├── js/home.js             # Home page logic (tabs, autocomplete, PNR fetch, navigation)
    │
    ├── train-list.html        # Trains between stations
    ├── train-list.css
    ├── train-list.js          # station autocomplete, validation, fetch, train cards
    │
    ├── tracking.html          # Live running status of one train
    ├── css/tracking.css
    ├── js/tracking.js
    │
    ├── coach.html             # Coach position and seat layouts
    ├── coach.css
    ├── coach.js
    │
    ├── helpdesk.html          # Help Desk
    ├── css/helpdesk.css
    ├── js/helpdesk.js
    │
    ├── index-legacy.html      # Classic tracker (spot train / between stations + route timeline)
    ├── script.js              # logic for index-legacy.html
    ├── style.css              # styles for index-legacy.html (also linked by index.html)
    │
    ├── app.js                 # old prototype script; not referenced by any page
    └── Readme.md              # short beginner-friendly overview
```

---

## Getting Started

### Prerequisites

- Node.js 18 or newer (`node -v`)
- A MongoDB Atlas cluster, with your IP address allowed under **Network Access**
- A RapidAPI account subscribed to the **IRCTC Indian Railway PNR Status** API
- Any modern browser (Chrome, Edge or Firefox)

### 1. Clone the repository

```bash
git clone https://github.com/sree581/where-is-my-train-clone.git
cd where-is-my-train-clone
```

### 2. Configure environment variables

```bash
cd backend
cp .env.example .env        # on Windows PowerShell: Copy-Item .env.example .env
```

Open `backend/.env` and fill in your own values (see [Environment Variables](#environment-variables)).

### 3. Install backend dependencies

```bash
npm install
```

### 4. Start the backend

```bash
node server.js
```

You should see:

```
🚀 Server running on http://localhost:5000
✅ Connected to MongoDB Atlas successfully!
```

Keep this terminal open while you use the app.

### 5. Open the frontend

Open `frontend/index.html` in your browser. Double-clicking it works, because the pages are opened directly as files and need no web server.

If you prefer serving the pages over HTTP, any static server works, for example the VS Code **Live Server** extension or `npx serve frontend`. The backend allows every origin through CORS, so both ways work.

### (Optional) Seed the `trains` collection

```bash
cd backend
node seed.js
```

⚠️ `seed.js` **deletes every document** in the `trains` collection before inserting 2 sample trains. It does not touch the search history. The running server does not read this collection; it is there for demonstration.

---

## Environment Variables

All variables live in `backend/.env`, which git ignores and must never be committed. Use `backend/.env.example` as the template.

| Variable | Required | Default | Description |
|---|---|---|---|
| `PORT` | No | `5000` | Port the Express server listens on. The frontend expects `5000`. |
| `MONGO_URI` | Yes, for history | none | MongoDB Atlas connection string, e.g. `mongodb+srv://<user>:<password>@<cluster>/<db>`. `MONGODB_URI` is also accepted. |
| `RAPIDAPI_KEY` | Yes, for live data | none | Your personal RapidAPI key. |
| `RAPIDAPI_HOST` | No | `irctc-indian-railway-pnr-status.p.rapidapi.com` | RapidAPI host of the IRCTC API. |

If `MONGO_URI` is missing, the server still starts. It prints a warning and skips history logging.
If `RAPIDAPI_KEY` is wrong, the RapidAPI calls fail. The train status and trains-between routes then return sample data, and the coach and PNR routes return an error message.

---

## Backend in Detail

All backend code is in [`backend/server.js`](backend/server.js).

### Startup sequence

1. `require('dotenv').config()` reads `backend/.env` into `process.env`.
2. An Express app is created, and the [middleware](#middleware) is registered.
3. The configuration is read: `PORT`, `RAPIDAPI_KEY`, `RAPIDAPI_HOST`, `MONGO_URI`.
4. `mongoose.connect(MONGO_URI)` starts connecting to MongoDB Atlas **in the background**, without blocking.
5. The `SearchHistory` schema and model are defined.
6. The API routes are registered.
7. `app.listen(PORT)` starts the HTTP server.

Because the database connection does not block startup, the API can answer requests before MongoDB has connected. Every route checks `mongoose.connection.readyState === 1` (connected) before it writes history, so a slow or failed database connection never breaks an API response.

### Middleware

Middleware is a function that runs on each request before it reaches a route handler. The app registers these, in order:

| # | Middleware | Code | What it does | Why the project needs it |
|---|---|---|---|---|
| 1 | **CORS** | `app.use(cors({ exposedHeaders: ['X-Data-Source'] }))` | Adds `Access-Control-Allow-Origin: *` to every response and answers browser pre-flight `OPTIONS` requests. It also adds `Access-Control-Expose-Headers: X-Data-Source`. | The frontend runs on a different origin (`file://` or another port) than the API (`http://localhost:5000`). Without CORS the browser would block every `fetch()`. Browsers hide custom response headers from JavaScript by default, so the expose setting is what lets the pages read `X-Data-Source`. |
| 2 | **JSON body parser** | `app.use(express.json())` | Parses requests with `Content-Type: application/json` and puts the result in `req.body`. | Every current route is a `GET`, so nothing uses it yet. It is kept so that future `POST` routes (e.g. feedback or saving favourites) work without extra setup. |
| 3 | **Router** (built into Express) | `app.get(...)` | Matches the method and path and fills `req.params` from `:placeholders`. | Handles the endpoints listed in the [API reference](#api-reference). |
| 4 | **Default 404 handler** (built into Express) | none | Replies `404 Cannot GET /path` when no route matches. | No custom 404 handler is defined. |
| 5 | **Default error handler** (built into Express) | none | Replies `500` if a route throws without catching the error. Express 5 forwards rejected `async` handlers here automatically. | Every route has its own `try/catch`, so this only acts as a safety net. |

**Not middleware, but related:**

- **`dotenv`** is a configuration loader. It runs once at startup, not on each request.
- **Search-history logging** is done **inside each route** rather than as a global middleware. That way each route decides what to record (for example, the PNR route masks the PNR before saving it). Logging is *fire-and-forget*: `SearchHistory.create(...)` is not awaited, so a slow database write never delays the response, and failures are only printed to the console.
- **Static files** are not served by Express. The frontend is opened as plain files, separately from the API.
- There is **no authentication and no rate limiting**. The API is meant for local development.

### MongoDB connection and models

**Connection.** `mongoose.connect(MONGO_URI)` runs once at startup. Success prints `✅ Connected to MongoDB Atlas successfully!` and failure prints `❌ MongoDB Atlas Connection Error: <message>`.

**`SearchHistory` model.** Defined in `server.js`; stored in the `searchhistories` collection.

| Field | Type | Notes |
|---|---|---|
| `queryType` | String, required | One of `SPOT`, `BETWEEN_STATIONS`, `COACH`, `PNR` |
| `searchQuery` | String, required | What was searched, e.g. `12626`, `QLN to ERS`, `123XXXXX90` |
| `searchedAt` | Date | Defaults to the current time |

| Route | `queryType` saved | `searchQuery` saved |
|---|---|---|
| `/api/trains/spot/:query` | `SPOT` | the train number or name as typed |
| `/api/trains/between/:from/:to` | `BETWEEN_STATIONS` | `FROM to TO` (upper-case) |
| `/api/trains/coach/:trainNo` | `COACH` | the train number |
| `/api/pnr/:pnr` | `PNR` | **masked** PNR: first 3 and last 2 digits, e.g. `123XXXXX90` |

A PNR identifies a passenger's booking. Masking means the public `/api/history` endpoint never shows a full PNR.

**`Train` model** ([`backend/models/Train.js`](backend/models/Train.js)), stored in the `trains` collection. It is only used by `seed.js`.

| Field | Type |
|---|---|
| `trainNumber` | String, required, unique |
| `trainName` | String, required |
| `source`, `destination` | String, required |
| `runsOn` | [String], e.g. `["Daily"]` |
| `schedule` | Array of `{ stationCode, stationName, arrivalTime, departureTime, day (default 1), platform (default "1") }` |

### API reference

Base URL: `http://localhost:5000`

Every RapidAPI call sends the headers `x-rapidapi-key: <RAPIDAPI_KEY>` and `x-rapidapi-host: <RAPIDAPI_HOST>`. The key stays on the server and is never sent to the browser.

---

#### `GET /api/trains/spot/:query`

Running status and schedule of one train.

- **Params:** `query`, a train number such as `12626`
- **Calls RapidAPI:** `GET /getTrainStatus?trainNo=<query>&startDay=0`
- **Logs:** `SPOT`
- **Response header:** `X-Data-Source: live` or `fallback`
- **Response (fallback shape):**

```json
{
  "trainNumber": "12626",
  "trainName": "KERALA EXPRESS",
  "source": "NDLS",
  "destination": "TVC",
  "positionStatus": "Train running on time",
  "delayMinutes": 0,
  "schedule": [
    { "stationName": "NEW DELHI", "stationCode": "NDLS", "arrivalTime": "START", "departureTime": "20:10", "platform": "3" }
  ]
}
```

When `X-Data-Source` is `live`, the body is RapidAPI's own response, passed through unchanged. `tracking.js` reads several possible field names so that it can handle either shape.

---

#### `GET /api/trains/between/:from/:to`

Trains running between two stations.

- **Params:** `from` and `to`, station codes such as `QLN` and `ERS` (any case)
- **Calls RapidAPI:** `GET /getTrainsBetweenStations?fromStationCode=QLN&toStationCode=ERS&dateOfJourney=DD-MM-YYYY` (today's date)
- **Logs:** `BETWEEN_STATIONS`
- **Response header:** `X-Data-Source: live` or `fallback`
- **Response:** always normalised to this shape:

```json
[
  { "trainNumber": "12626", "trainName": "KERALA EXPRESS", "departureTime": "20:10", "arrivalTime": "18:00", "travelTime": "45h 50m" }
]
```

The backend maps several possible RapidAPI field names (`train_number` / `trainNo` / `train_no`, `departure_time` / `std`, and so on) to these five fields. If RapidAPI fails or returns an empty list, 2 sample trains are returned.

---

#### `GET /api/trains/coach/:trainNo`

Coach order (rake composition) of a train. This data is **live**.

- **Params:** `trainNo`, e.g. `12626`
- **Calls RapidAPI:** `GET /coach-position/<trainNo>`
- **Logs:** `COACH`
- **Success response (`200`):** RapidAPI's response, passed through unchanged:

```json
{
  "success": true,
  "data": {
    "train_no": "12626",
    "train_name": "KERALA SF EXP",
    "total_coaches": 23,
    "coaches": [
      { "position": 1, "coach": "En", "type": "En", "type_label": "Engine / Loco" },
      { "position": 3, "coach": "GN", "type": "GN", "type_label": "General" }
    ]
  }
}
```

- **Error response (`500`):** `{ "success": false, "message": "Failed to fetch coach position" }`

Coach `type` values seen so far: `En` (engine), `LPR` (power car), `GN` (general), `2A` (AC 2-tier), `3A` (AC 3-tier), `3E` (AC 3-tier economy), `SL` (sleeper), `PC` (pantry car), `SLRD` (luggage and brake van), `VP` (parcel van).

---

#### `GET /api/pnr/:pnr`

PNR status. This data is **live**.

- **Params:** `pnr`, exactly 10 digits
- **Validation:** anything else returns `400` with `{ "success": false, "message": "PNR number must be exactly 10 digits" }`
- **Calls RapidAPI:** `GET /getPNRStatus/<pnr>`
- **Logs:** `PNR` (masked)
- **Response (`200`):** RapidAPI's response, passed through unchanged. For an invalid or expired PNR:

```json
{ "success": false, "message": "Flushed Pnr Or Pnr Not Yet Generated" }
```

  For a valid PNR, `success` is `true` and the booking is under `data`.
- **Error response (`502`):** `{ "success": false, "message": "PNR service is unavailable right now. Please try again later." }`

---

#### `GET /api/history`

The 10 most recent searches, newest first. Use it to show that MongoDB logging works.

```json
[
  { "_id": "…", "queryType": "PNR", "searchQuery": "123XXXXX90", "searchedAt": "2026-09-30T17:32:23.005Z", "__v": 0 },
  { "_id": "…", "queryType": "BETWEEN_STATIONS", "searchQuery": "QLN to ERS", "searchedAt": "2026-09-30T17:32:22.554Z", "__v": 0 }
]
```

- **Error response (`500`):** `{ "error": "Failed to fetch search history" }`

### Live data vs. fallback data

The configured RapidAPI plan does **not** provide `/getTrainStatus` or `/getTrainsBetweenStations`; RapidAPI answers `404 Endpoint does not exist`. So that the app still works and can be demonstrated, these two routes return **sample (fallback) data** in that case and set the response header:

```
X-Data-Source: fallback
```

The train list and tracking pages read this header and show a notice: *"Live … data is unavailable right now – showing sample …"*. This keeps it clear which data is real.

The **coach position** and **PNR** routes use real data only. They do not fall back to sample data.

### Error handling

| Situation | What happens |
|---|---|
| RapidAPI fails on the train status or trains-between routes | The error is printed on the server, and sample data is returned with `X-Data-Source: fallback`. |
| RapidAPI fails on the coach route | `500` with a JSON message. `coach.js` then shows the static sample coach layout. |
| RapidAPI fails on the PNR route | `502` with a JSON message, which the Home page displays. |
| Invalid PNR format | `400`. It is also caught earlier in the browser. |
| MongoDB not connected | History writes are skipped, and `/api/history` returns `500`. |
| MongoDB write fails | The error is printed on the server. The API response is not affected. |
| Unknown route | Express's default `404` response. |
| Backend not running | Each page shows a "make sure the backend is running on port 5000" message. |

---

## Frontend in Detail

### Page flow

```
                         ┌──────────────────────────── index.html (Home) ────────────────────────────┐
                         │                                                                            │
          Search Train tab (From/To)            PNR Status tab                     Coach Position tab     ? icon
                         │                             │                                    │              │
                         ▼                             ▼                                    ▼              ▼
     train-list.html?from=QLN&to=ERS          result shown on Home          coach.html?train=12626   helpdesk.html
                         │                   (GET /api/pnr/:pnr)
          ┌──────────────┴──────────────┐
          ▼                             ▼
 tracking.html?train=12626     coach.html?train=12626
          │
          └──▶ "View Coach Position" ──▶ coach.html?train=12626
```

The Home footer also links to `tracking.html`, `train-list.html`, `coach.html`, `helpdesk.html` and the classic tracker `index-legacy.html`.

### Pages

#### Home — `index.html` + `css/home.css` + `js/home.js`

- **Tabs:** Search Train, PNR Status and Coach Position. A URL hash opens a tab directly, e.g. `index.html#pnr-status`.
- **Search Train:**
  - From/To inputs with station autocomplete (a built-in list of common stations) and a swap button.
  - Accepts a picked suggestion, `Name (CODE)`, a bare code (`QLN`) or a known station name.
  - Then opens `train-list.html?from=QLN&to=ERS`.
  - Links below the form: *Track live status* (`tracking.html`) and *Classic tracker* (`index-legacy.html`).
- **PNR Status:**
  - Checks that the PNR has 10 digits, then calls `GET /api/pnr/:pnr` and shows a loading message.
  - Shows the train, route, date, chart status and the status of each passenger, or the API's message (e.g. "PNR not yet generated").
  - Values are HTML-escaped before display.
- **Coach Position:**
  - A 5-digit train number opens `coach.html?train=<number>`.
  - A known train name is looked up in a small built-in list.
- **Other features:** input "shake" animation for invalid input, Enter key to search, and a Help Desk icon in the header.

#### Train List — `train-list.html` + `train-list.css` + `train-list.js`

- On load, reads `?from=&to=` (defaults to Kollam Jn (QLN) → Ernakulam Jn (ERS)) and searches immediately.
- **Station autocomplete** from a list of Kerala stations. Any other 2–5 letter station code (e.g. `NDLS`) is also accepted.
- **Validation:** invalid input shows *"Please select valid From and To stations."*
- **States:**
  - *Loading trains…* while the request runs.
  - Train cards on success.
  - *No trains found* for an empty result.
  - *Unable to load trains* if the backend can't be reached.
  - A sample-data notice when the data is fallback data.
- **Each train card** shows the number, name, route, departure and arrival times, and travel time, with links to **Live Status** (`tracking.html?train=…`) and **Coach Position** (`coach.html?train=…`).
- Swap and clear (×) buttons. The *Track Train* tab opens `tracking.html`, and the header title links Home.
- The address bar is updated after each search, so the URL can be shared.

#### Live Status — `tracking.html` + `css/tracking.css` + `js/tracking.js`

- Enter a train number; the field is required. With `?train=12626`, the search runs automatically.
- Calls `GET /api/trains/spot/:query`.
- **Shows:** train name and number, current status, source, destination, current location, delay ("On Time" or "N minutes late"), and a schedule table (station, arrival, departure, platform).
- Loading and error messages, a sample-data notice for fallback data, and a **View Coach Position** link.

#### Coach Position — `coach.html` + `coach.css` + `coach.js`

- Reads `?train=` (or `?trainNumber=` and `?trainName=`).
- Calls `GET /api/trains/coach/:trainNo` and shows the **real coach order** in a horizontal selector (engine icon, then each coach with its position number).
- Clicking a coach shows its seat layout:

  | API coach type | Layout drawn |
  |---|---|
  | `GN` | General compartment |
  | `SL` | Sleeper (berths and side berths) |
  | `2A` | AC 2-tier |
  | `3A`, `3E` | AC 3-tier |
  | anything else (engine, pantry, luggage…) | "Layout not available for …" |

- **Fallback:** if no train is given, or the API can't be reached, a static **sample rake** is shown (GEN, GEN, A1, B1–B6, S1–S9) and the title says *"showing sample coach layout"*.
- The back button returns to the previous page, or to Home if there is none.

#### Help Desk — `helpdesk.html` + `css/helpdesk.css` + `js/helpdesk.js`

- A search box that filters the help-topic cards as you type, with a "no topics" message when nothing matches.
- Topic cards, feedback, social icons and the "Live Train Map" button show a *"coming soon"* toast message.
- *Contact Support* opens an email to `support@whereismytrain.in`.
- Mobile menu, and links back to Home.
- Works on its own. It does not call the backend.

#### Classic tracker — `index-legacy.html` + `style.css` + `script.js`

- The original interface of the project, kept for reference.
- *Spot Train* and *Between Stations* tabs. The between-stations results can be clicked to open a live-route timeline.
- Light and dark themes. The 🚃 Coach button opens `coach.html?train=…`.

### URL parameters

| Page | Parameter | Example |
|---|---|---|
| `index.html` | hash = tab name | `index.html#pnr-status`, `index.html#coach-position` |
| `train-list.html` | `from`, `to` (station codes) | `train-list.html?from=QLN&to=ERS` |
| `tracking.html` | `train` | `tracking.html?train=12626` |
| `coach.html` | `train` (or `trainNumber`), optional `trainName` | `coach.html?train=12626` |

### Backend URL

Every page calls `http://localhost:5000`. To use a different host or port, change it in `js/home.js`, `train-list.js`, `js/tracking.js`, `coach.js` and `script.js`.

---

## Which RapidAPI endpoints work

These results come from calling the configured API (`irctc-indian-railway-pnr-status.p.rapidapi.com`) directly:

| RapidAPI endpoint | Used by | Status |
|---|---|---|
| `GET /coach-position/{trainNo}` | `/api/trains/coach/:trainNo` | ✅ Works (live data) |
| `GET /getPNRStatus/{pnr}` | `/api/pnr/:pnr` | ✅ Works (live data) |
| `GET /getTrainStatus` | `/api/trains/spot/:query` | ❌ `404 Endpoint does not exist` → sample data |
| `GET /getTrainsBetweenStations` | `/api/trains/between/:from/:to` | ❌ `404 Endpoint does not exist` → sample data |

For real live status or trains-between data, subscribe to a RapidAPI plan or API that offers those endpoints. Then update the URLs and the field mapping in `server.js`. The frontend already reads several field-name variants.

---

## Testing the Project

### 1. Backend (terminal or browser)

With the server running:

```bash
curl http://localhost:5000/api/trains/spot/12626
curl http://localhost:5000/api/trains/between/QLN/ERS
curl http://localhost:5000/api/trains/coach/12626
curl http://localhost:5000/api/pnr/1234567890        # → success:false, "PNR not yet generated"
curl http://localhost:5000/api/pnr/12ab              # → 400 validation error
curl http://localhost:5000/api/history
```

Add `-i` to see the `X-Data-Source` header, e.g. `curl -i http://localhost:5000/api/trains/spot/12626`.

### 2. Frontend checklist

| # | Steps | Expected result |
|---|---|---|
| 1 | Open `index.html`, type `Kollam` in *From*, pick the suggestion, type `ERS` in *To*, click **Search** | Opens the train list with 2 train cards and a sample-data notice |
| 2 | Click **Live Status** on a card | The tracking page loads the train's status and schedule automatically |
| 3 | Click **View Coach Position** | The coach page shows the real coach order (e.g. 23 coaches for 12626) |
| 4 | Click a sleeper coach, then the engine | Sleeper berth layout, then "Layout not available" |
| 5 | Open `coach.html` with no parameters | Sample rake GEN/A1/B1–B6/S1–S9 |
| 6 | Home → PNR tab, enter `123` | "Please enter a valid 10-digit PNR number." |
| 7 | Enter `1234567890` | The API's message (PNR not generated) |
| 8 | Home → Coach Position tab, enter `12626` | Opens `coach.html?train=12626` |
| 9 | Click the **?** icon | The Help Desk opens; typing in the search filters the topics |
| 10 | Stop the backend and search again on the train list | "Unable to load trains … backend server is running" |
| 11 | Call `/api/history` | The searches above are listed (PNR masked) |

Open the browser DevTools (F12) → **Console** and **Network**: there should be no red errors while the backend is running.

The final integration was checked with an automated headless-Chrome run of these flows: 48 of 48 checks passed, with no console errors, script errors or failed requests.

---

## Troubleshooting

| Problem | Cause and fix |
|---|---|
| `Error: listen EADDRINUSE :::5000` | Something else is already using port 5000, often an old `node server.js`. Stop it, or change `PORT` (then also change `API_BASE_URL` in the frontend). |
| `⚠️ Warning: MONGO_URI is missing` | `backend/.env` is missing, or has no `MONGO_URI`. Run the server from the `backend/` folder. |
| `❌ MongoDB Atlas Connection Error` | Wrong username or password in the URI, or your IP is not allowed. In Atlas, go to **Network Access** and add your current IP. |
| `/api/history` returns `500` | MongoDB is not connected (see above). |
| Coach page always shows the sample layout | The backend isn't running, or the RapidAPI key is invalid or out of quota. Check the server console for `Coach Position API Error`. |
| PNR says "service is unavailable" | RapidAPI rejected the request (bad key, quota, or network). Check the server console. |
| Every page says "make sure the backend is running" | Start `node server.js` in `backend/` and keep that terminal open. |
| `Cannot find module 'express'` | Run `npm install` inside `backend/`. |
| Status or train list always shows "sample data" | Expected with the current RapidAPI plan; see [Which RapidAPI endpoints work](#which-rapidapi-endpoints-work). |

---

## Security Notes

- **Never commit `backend/.env`.** It is listed in `.gitignore`. Share credentials privately, not through git.
- The RapidAPI key is used **only on the server**. The browser never sees it.
- PNR numbers are masked before they are stored in MongoDB.
- Values from the API are HTML-escaped before they are inserted into the page (Home PNR result, train list and tracking page).
- An earlier version of the repository committed `backend/.env`. Those credentials are still visible in the git history, so they must be **rotated**: change the Atlas database user's password and generate a new RapidAPI key.
- CORS allows every origin, and there is no authentication or rate limiting. That is fine for local development, but restrict it before any public deployment.

---

## Git Workflow and Branches

| Branch | Content | Status |
|---|---|---|
| `main` | Integrated, working project | ✅ current |
| `Athira` | Home page and Help Desk | merged |
| `keerthana-train-list` | Train List page and backend connection | merged |
| `feature/coach-view` | Coach position view and coach API route | merged |
| `feature/train-tracking` | Live train tracking page | merged |
| `feature/full-integration` | First integration of Home, Coach and Train List | merged |
| `backup/before-final-integration` | Snapshot of `main` before the final integration | backup only |

Suggested workflow for new work:

```bash
git checkout main
git pull origin main
git checkout -b feature/<short-name>
# ...make changes...
git add <files>
git commit -m "Describe the change"
git push origin feature/<short-name>
# then open a Pull Request into main on GitHub
```

`node_modules/` is not committed. After pulling, run `npm install` in `backend/`.

---

## Team

| Member | Contribution |
|---|---|
| **Sreenandana** (maintainer) | Backend (Express, RapidAPI, MongoDB Atlas history logging), classic tracker, integration of all branches |
| **Athira** | Home page and Help Desk |
| **Keerthana K K** | Train List page and its backend connection |
| **Sana** | Coach Position view and the coach-position API route |
| **Rashmi** | Live Train Tracking page |

---

## Known Limitations and Future Work

- Live running status and trains-between-stations use sample data, until an API plan that supports them is configured.
- The PNR success view reads the most likely field names and has not yet been checked against a real, valid PNR response.
- The station autocomplete lists are small built-in lists, not a full station database.
- The coach view only draws layouts for General, Sleeper, AC 2-tier and AC 3-tier coaches.
- The backend URL (`http://localhost:5000`) is hard-coded in each frontend script.
- `frontend/app.js` and the root `package.json` are leftovers and could be removed.
- Ideas: a live map, arrival alarms, saved favourite trains, a Help Desk feedback form (would use the existing `express.json()` middleware with a `POST` route), and deployment (e.g. Render for the backend, Netlify for the frontend).
