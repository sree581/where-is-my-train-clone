# 🚆 Where Is My Train — Clone

A railway information web app inspired by the *Where Is My Train* app, built as a college **Advanced Web Technologies (AWT)** group project.

Users can search trains between two stations, check the running status and schedule of a train, see the coach position (coach order) of a train, check PNR status, and get help (and send feedback) from a Help Desk page.

**Run it:** `cd backend` → `npm install` → `npm start` → open **http://localhost:5000**. The full steps are in [Getting Started](#getting-started).

```
Browser ──http://localhost:5000──▶  Express backend (Node.js)
                                     ├── serves the website (frontend/ HTML, CSS, JS)
                                     └── /api/... routes

Frontend (HTML / CSS / JavaScript)  ──fetch()──▶  Express backend (Node.js)  ──axios──▶  RapidAPI (IRCTC API)
                                                        │
                                                        └──mongoose──▶  MongoDB Atlas
                                                                          • search history
                                                                          • saved train timetables
                                                                          • Help Desk feedback
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
| Search trains between two stations | `train-list.html` | RapidAPI → saved timetables in MongoDB → sample data |
| Live running status and schedule of a train | `tracking.html` | RapidAPI → saved timetables in MongoDB → sample data |
| Coach position (order of coaches) and seat layouts | `coach.html` | **Live** from RapidAPI; static sample layout as fallback |
| PNR status | `index.html` (PNR tab) | **Live** from RapidAPI |
| Help Desk: searchable help topics with answers | `helpdesk.html` | Static content |
| Help Desk: feedback form | `helpdesk.html` | Saved to MongoDB (`POST /api/feedback`) |
| Search history (proves MongoDB integration) | `GET /api/history` | MongoDB Atlas |
| Classic tracker with a route timeline | `index-legacy.html` | Same sources as the Live Status page |

The train list and Live Status pages say where their data came from: live, the saved timetable, or sample data. See [Live data vs. fallback data](#live-data-vs-fallback-data).

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
│
├── backend/
│   ├── server.js              # Express app: middleware, MongoDB connection, all API routes, error handlers
│   ├── models/
│   │   ├── Train.js           # Mongoose model for saved train timetables ("trains" collection)
│   │   └── Feedback.js        # Mongoose model for Help Desk feedback ("feedbacks" collection)
│   ├── seed.js                # fills the "trains" collection with 7 sample timetables (npm run seed)
│   ├── package.json           # backend dependencies and npm scripts (start, seed)
│   ├── package-lock.json
│   ├── .env.example           # template for your .env (no real secrets)
│   └── .env                   # YOUR secrets. Not committed; create it yourself.
│
└── frontend/                  # served by the backend at http://localhost:5000
    ├── js/config.js           # backend URL (API_BASE_URL) for when pages are opened as files; loaded by every page
    ├── js/nav.js              # shared navigation bar, added to the top of every page
    ├── css/nav.css            # styles for the navigation bar
    ├── favicon.svg            # browser-tab icon (🚆)
    │
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
    ├── helpdesk.html          # Help Desk (help topics, answer dialog, feedback form)
    ├── css/helpdesk.css
    ├── js/helpdesk.js
    │
    ├── index-legacy.html      # Classic tracker (spot train / between stations + route timeline)
    ├── script.js              # logic for index-legacy.html
    ├── style.css              # styles for index-legacy.html (also linked by index.html)
    │
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

### 4. Load the sample timetables (first time only)

```bash
npm run seed
```

This fills the `trains` collection with 7 sample timetables. The server uses them when RapidAPI has no live data (see [Live data vs. fallback data](#live-data-vs-fallback-data)).

⚠️ Seeding **replaces everything** in the `trains` collection. Search history and feedback are not touched. The timings are approximate demo data, not official Indian Railways timetables.

| Train | Name | Route |
|---|---|---|
| 12625 | Kerala Express | TVC → QLN → KTYM → ERN → TCR → PGT → … → NDLS |
| 12626 | Kerala Express | NDLS → … → PGT → TCR → ERN → KTYM → QLN → TVC |
| 16301 | Venad Express | TVC → QLN → KTYM → ERS → TCR → SRR |
| 12076 | Jan Shatabdi Express | TVC → QLN → ALLP → ERS → TCR → CLT |
| 16347 | Mangaluru Express | TVC → QLN → ALLP → ERS → CLT → CAN → MAQ |
| 12618 | Mangala Lakshadweep Express | ERS → TCR → CLT → CAN → MAQ → NZM |
| 12002 | Bhopal Shatabdi Express | NDLS → AGC → GWL → RKMP |

Good routes to try: `QLN → ERS`, `TVC → CLT`, `ERS → MAQ`, `NDLS → TVC`.

### 5. Start the app

```bash
npm start            # same as: node server.js
```

You should see:

```
🚀 Server running on http://localhost:5000
🌐 Open the website: http://localhost:5000
✅ Connected to MongoDB Atlas successfully!
```

### 6. Open the website

Go to **http://localhost:5000** in your browser.

The backend serves **both** the website and the API from this one address, so there is no separate frontend command. There is no `npm run dev`: the frontend is plain HTML/CSS/JS with nothing to build. Every page has the same navigation bar at the top (Home · Find Trains · Live Status · Coach Position · PNR Status · Help).

Keep the terminal open while you use the app. Press `Ctrl + C` in it to stop the server. After changing backend code, stop it and run `npm start` again. After changing frontend files, just refresh the browser.

If you see `❌ Port 5000 is already in use`, another copy of the server is still running (for example in another terminal). Stop that one first.

**Other ways to open the pages** (optional): you can also double-click `frontend/index.html`, or use the VS Code **Live Server** extension. The pages then call the API at `http://localhost:5000` (set in `frontend/js/config.js`), so the backend must still be running. CORS allows this.

### npm scripts (run inside `backend/`)

| Command | What it does |
|---|---|
| `npm install` | Installs the dependencies from `package.json` |
| `npm start` | Starts the server: website + API on http://localhost:5000 (`node server.js`) |
| `npm run seed` | Replaces the `trains` collection with the sample timetables (`node seed.js`) |

---

## Environment Variables

All variables live in `backend/.env`, which git ignores and must never be committed. Use `backend/.env.example` as the template.

| Variable | Required | Default | Description |
|---|---|---|---|
| `PORT` | No | `5000` | Port the Express server listens on. The frontend expects `5000`. |
| `MONGO_URI` | Yes, for history | none | MongoDB Atlas connection string, e.g. `mongodb+srv://<user>:<password>@<cluster>/<db>`. `MONGODB_URI` is also accepted. |
| `RAPIDAPI_KEY` | Yes, for live data | none | Your personal RapidAPI key. |
| `RAPIDAPI_HOST` | No | `irctc-indian-railway-pnr-status.p.rapidapi.com` | RapidAPI host of the IRCTC API. |

If `MONGO_URI` is missing, the server still starts. It prints a warning, skips history logging and saved timetables, and the feedback form answers "can't be saved right now".
If `RAPIDAPI_KEY` is wrong, the RapidAPI calls fail. The train status and trains-between routes then use saved timetables or sample data, and the coach and PNR routes return an error message.

The frontend's backend address is set in one place, [`frontend/js/config.js`](frontend/js/config.js) (`API_BASE_URL`, default `http://localhost:5000`). If you change `PORT`, change it there too.

---

## Backend in Detail

All backend code is in [`backend/server.js`](backend/server.js).

### Startup sequence

1. `require('dotenv').config()` reads `backend/.env` into `process.env`.
2. The `Train` and `Feedback` models are loaded from `models/`.
3. An Express app is created, and the request [middleware](#middleware) is registered, including serving the `frontend/` folder.
4. The configuration is read: `PORT`, `RAPIDAPI_KEY`, `RAPIDAPI_HOST`, `MONGO_URI`.
5. `mongoose.connect(MONGO_URI)` starts connecting to MongoDB Atlas **in the background**, without blocking.
6. The `SearchHistory` schema and model are defined, along with the helpers that read saved timetables.
7. The API routes are registered.
8. The error-handling middleware is registered (JSON 404 for unknown `/api` routes, then the last-resort error handler).
9. `app.listen(PORT)` starts the HTTP server. If the port is already in use, it prints `❌ Port 5000 is already in use…` and exits instead of pretending to start.

Because the database connection does not block startup, the API can answer requests before MongoDB has connected. Every route checks `mongoose.connection.readyState === 1` (the `isDbConnected()` helper) before it touches the database, so a slow or failed database connection never breaks an API response.

### Middleware

Middleware is a function that runs on a request before (or instead of) a route handler. Express runs them **in the order they are registered**. A request goes through this chain from top to bottom:

```
request ─▶ 1 CORS ─▶ 2 JSON body parser ─▶ 3 website files ─▶ 4 API routes ─▶ 5 /api 404 handler ─▶ response
                              │                                     │
                              └────────────── any error ────────────┴──────▶ 6 error handler ─▶ JSON error response
```

| # | Middleware | Code | What it does | Why the project needs it |
|---|---|---|---|---|
| 1 | **CORS** | `app.use(cors({ exposedHeaders: ['X-Data-Source'] }))` | Adds `Access-Control-Allow-Origin: *` to every response and answers browser pre-flight `OPTIONS` requests (needed before the feedback `POST`). It also adds `Access-Control-Expose-Headers: X-Data-Source`. | The frontend runs on a different origin (`file://` or another port) than the API (`http://localhost:5000`). Without CORS the browser would block every `fetch()`. Browsers hide custom response headers from JavaScript by default, so the expose setting is what lets the pages read `X-Data-Source`. |
| 2 | **JSON body parser** | `app.use(express.json({ limit: '10kb' }))` | Parses requests with `Content-Type: application/json` into `req.body`. Bodies over 10 KB are rejected with `413`, and malformed JSON with `400`; both errors are passed on to the error handler (#6). | `POST /api/feedback` reads the form data from `req.body`. The size limit stops oversized requests from being processed. |
| 3 | **Website files** | `app.get('/js/config.js', …)` then `app.use(express.static(FRONTEND_DIR))` | `express.static` sends files from the `frontend/` folder (`/` → `index.html`, `/css/nav.css`, …). Just before it, a small route answers `/js/config.js` with `API_BASE_URL: window.location.origin`, so pages served by the backend call the API on the same address. | This is what joins the frontend and backend: one `npm start`, one URL. Only `frontend/` is served; `backend/` files such as `.env` and `server.js` can't be reached, and hidden dot-files are ignored. |
| 4 | **API routes** | `app.get(...)`, `app.post(...)` | Matches the method and path and fills `req.params` from `:placeholders`. | The endpoints in the [API reference](#api-reference). |
| 5 | **JSON 404 for the API** | `app.use('/api', (req, res) => …)` | Runs only when no route above matched a path starting with `/api`, and answers `404 { success: false, message: "No API route for GET /api/…" }`. | The frontend always expects JSON. Without this, Express would answer with an HTML "Cannot GET" page. Unknown non-API paths (e.g. `/nope.html`) still get Express's default HTML 404. |
| 6 | **Error handler** | `app.use((err, req, res, next) => …)` | Catches errors passed down the chain: `400` "Invalid request body", `413` "Request body is too large", anything else `500` "Internal server error" (and prints it on the server). | Returns every error as JSON and never leaks stack traces to the browser. Express only treats a middleware as an error handler if it takes **all four** arguments, which is why `next` is declared even though it isn't used. Express 5 also sends rejected `async` route handlers here automatically. |

**Not middleware, but related:**

- **`dotenv`** is a configuration loader. It runs once at startup, not on each request.
- **Search-history logging** is done **inside each route** rather than as a global middleware. That way each route decides what to record (for example, the PNR route masks the PNR before saving it). Logging is *fire-and-forget*: `SearchHistory.create(...)` is not awaited, so a slow database write never delays the response, and failures are only printed to the console.
- **Input validation** is also done inside the routes: the PNR format check, and the feedback message and email checks, backed by the Mongoose schema rules.
- **CORS is still needed** even though the backend serves the website. It lets the pages work when they are opened some other way (double-clicked, or VS Code Live Server).
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

**`Train` model** ([`backend/models/Train.js`](backend/models/Train.js)), stored in the `trains` collection. It is filled by `npm run seed` and read by the train status and trains-between routes.

| Field | Type |
|---|---|
| `trainNumber` | String, required, unique |
| `trainName` | String, required |
| `source`, `destination` | String, required |
| `runsOn` | [String], e.g. `["Daily"]` |
| `schedule` | Array of `{ stationCode, stationName, arrivalTime, departureTime, day (default 1), platform (default "1") }`. `arrivalTime` is `"START"` at the first stop and `departureTime` is `"END"` at the last; `day` is the journey day (1, 2, 3…). |

How the saved timetables are queried (`server.js`, section 2):

- **`findSavedTrain(trainNumber)`**: `Train.findOne({ trainNumber })`, converted to the same shape as the `/spot` response.
- **`findSavedTrainsBetween(from, to)`**:
  1. `Train.find({ 'schedule.stationCode': { $all: [from, to] } })` finds trains that stop at both stations.
  2. It keeps only trains that reach `from` **before** `to`, so direction matters.
  3. It reads the departure time at `from` and the arrival time at `to`.
  4. It works out the travel time using the journey `day` of each stop (e.g. 12:20 on day 1 to 13:30 on day 4 is `73h 10m`).
  5. It sorts the trains by departure time.
  6. It returns `null` if no timetables have been seeded at all. The route then falls back to the sample data.

**`Feedback` model** ([`backend/models/Feedback.js`](backend/models/Feedback.js)), stored in the `feedbacks` collection.

| Field | Type and rules |
|---|---|
| `name` | String, optional, max 100 characters, default `"Anonymous"` |
| `email` | String, optional, max 200 characters |
| `category` | One of `General`, `Bug Report`, `Feature Request`, `Data Issue` (default `General`) |
| `message` | String, required, 5–2000 characters |
| `submittedAt` | Date, defaults to the current time |

There is no API route that lists feedback, so people's email addresses can't be read back through the public API. View the entries in MongoDB Atlas (**Browse Collections → feedbacks**).

### API reference

Base URL: `http://localhost:5000`

Every RapidAPI call sends the headers `x-rapidapi-key: <RAPIDAPI_KEY>` and `x-rapidapi-host: <RAPIDAPI_HOST>`. The key stays on the server and is never sent to the browser.

---

#### `GET /api/trains/spot/:query`

Running status and schedule of one train.

- **Params:** `query`, a train number such as `12626`
- **Calls RapidAPI:** `GET /getTrainStatus?trainNo=<query>&startDay=0`
- **If that fails:** looks the train up in the saved timetables; if it isn't there, returns the sample train
- **Logs:** `SPOT`
- **Response header:** `X-Data-Source: live`, `database` or `fallback`
- **Response (`database` shape):**

```json
{
  "trainNumber": "16301",
  "trainName": "Venad Express",
  "source": "Thiruvananthapuram Central (TVC)",
  "destination": "Shoranur Jn (SRR)",
  "runsOn": ["Daily"],
  "positionStatus": "Scheduled timetable (live position unavailable)",
  "delayMinutes": null,
  "schedule": [
    { "stationName": "Thiruvananthapuram Central", "stationCode": "TVC", "arrivalTime": "START", "departureTime": "05:00", "day": 1, "platform": "1" }
  ]
}
```

- **Response (`fallback` shape):** used for trains that aren't in the database. The number you searched is kept, but everything else is sample data.

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
- **If that fails or returns no trains:** searches the saved timetables; if none have been seeded, returns 2 sample trains
- **Logs:** `BETWEEN_STATIONS`
- **Response header:** `X-Data-Source: live`, `database` or `fallback`
- **Response:** always normalised to this shape (`runsOn` is included for `database` results):

```json
[
  { "trainNumber": "16301", "trainName": "Venad Express", "departureTime": "06:00", "arrivalTime": "09:15", "travelTime": "3h 15m", "runsOn": ["Daily"] }
]
```

For live data, the backend maps several possible RapidAPI field names (`train_number` / `trainNo` / `train_no`, `departure_time` / `std`, and so on) to these fields. With saved timetables, an **empty list `[]`** means that no saved train runs from `from` to `to` in that direction. The page then shows "No trains found".

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

---

#### `POST /api/feedback`

Saves a message from the Help Desk feedback form to MongoDB.

- **Body (JSON, max 10 KB):**

```json
{ "name": "Anu", "email": "anu@example.com", "category": "Bug Report", "message": "The coach page did not load for 16301." }
```

  Only `message` is required.
- **Validation:**
  - `message` must be at least 5 characters long.
  - `email`, if given, must look like an email address.
  - `category` must be one of the four allowed values.
  - Schema limits apply (see the [Feedback model](#mongodb-connection-and-models)).
- **Success (`201`):** `{ "success": true, "message": "Thank you! Your feedback has been received.", "id": "…" }`
- **Errors:**

  | Status | When | Body |
  |---|---|---|
  | `400` | Validation failed | `{ "success": false, "message": "Please write a message of at least 5 characters" }`, and similar messages |
  | `400` | Malformed JSON | `{ "success": false, "message": "Invalid request body" }` |
  | `413` | Body over 10 KB | `{ "success": false, "message": "Request body is too large" }` |
  | `503` | MongoDB not connected | `{ "success": false, "message": "Feedback can't be saved right now…" }` |
  | `500` | Database write failed | `{ "success": false, "message": "Failed to save feedback" }` |

```bash
curl -X POST http://localhost:5000/api/feedback \
  -H "Content-Type: application/json" \
  -d '{"category":"General","message":"Great project!"}'
```

---

#### Any other `/api/...` path

`404` `{ "success": false, "message": "No API route for GET /api/..." }`

### Live data vs. fallback data

The configured RapidAPI plan does **not** provide `/getTrainStatus` or `/getTrainsBetweenStations`; RapidAPI answers `404 Endpoint does not exist`. So that the app still works and can be demonstrated, these two routes fall back in steps:

```
1. RapidAPI (live)  ──fails──▶  2. Saved timetable in MongoDB  ──not found──▶  3. Hard-coded sample data
   X-Data-Source: live             X-Data-Source: database                         X-Data-Source: fallback
```

The train list and tracking page read the `X-Data-Source` header and tell the user where the data came from (the classic tracker does not show this notice):

| Header value | Notice shown on the page |
|---|---|
| `live` | none |
| `database` | *"Live … unavailable right now – showing saved timetables from our database."* |
| `fallback` | *"Live … unavailable right now – showing sample trains / sample data."* |

The **coach position** and **PNR** routes use real data only. They do not fall back to database or sample data (the coach **page** shows its own clearly labelled sample layout if the API fails).

### Error handling

| Situation | What happens |
|---|---|
| RapidAPI fails on the train status or trains-between routes | The error is printed on the server. The saved timetable is returned (`X-Data-Source: database`), or sample data if there is none (`fallback`). |
| Saved-timetable lookup throws | The error is printed on the server, and sample data is returned. |
| Invalid feedback | `400` with a readable message, shown in the form. |
| Malformed or oversized JSON body | `400` / `413` from the error-handling middleware. |
| RapidAPI fails on the coach route | `500` with a JSON message. `coach.js` then shows the static sample coach layout. |
| RapidAPI fails on the PNR route | `502` with a JSON message, which the Home page displays. |
| Invalid PNR format | `400`. It is also caught earlier in the browser. |
| MongoDB not connected | History writes and saved timetables are skipped, feedback returns `503`, and `/api/history` returns `500`. |
| MongoDB history write fails | The error is printed on the server. The API response is not affected. |
| Unknown `/api` route | JSON `404`. |
| Port already in use at startup | Clear error message, and the process exits. |
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

### Shared navigation bar

[`js/nav.js`](frontend/js/nav.js) and [`css/nav.css`](frontend/css/nav.css) add the same dark-blue bar to the top of **every** page, so you can reach any feature from anywhere:

| Link | Opens | Highlighted on |
|---|---|---|
| 🏠 Home | `index.html` | Home (Search Train / Coach Position tabs) |
| 🔍 Find Trains | `train-list.html` | Train List |
| 📍 Live Status | `tracking.html` (+ `?train=` if the page has one) | Live Status, Classic tracker |
| 🚃 Coach Position | `coach.html` (+ `?train=` if the page has one) | Coach Position |
| 🎫 PNR Status | `index.html#pnr-status` | Home when the PNR tab is open |
| ❓ Help | `helpdesk.html` | Help Desk |

- **The train carries over.** On `tracking.html?train=16301`, the Coach Position link points to `coach.html?train=16301`, and the other way round, so you can switch between a train's status and its coaches in one click.
- **Home tabs stay in sync.** When you switch tabs on Home, `js/home.js` updates the URL (`#pnr-status`) and sends a `wimt:navchange` event, so the highlight follows the tab you're on.
- On narrow screens the brand text is hidden and the links scroll sideways.
- Class names start with `wimt-` so they don't clash with any page's own styles.

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
  - A notice when the data comes from the saved timetables or is sample data.
- **Each train card** shows the number, name, route, departure and arrival times, running days and travel time, with links to **Live Status** (`tracking.html?train=…`) and **Coach Position** (`coach.html?train=…`).
- Swap and clear (×) buttons. The *Track Train* tab opens `tracking.html`, and the header title links Home.
- The address bar is updated after each search, so the URL can be shared.

#### Live Status — `tracking.html` + `css/tracking.css` + `js/tracking.js`

- Enter a train number; the field is required. With `?train=12626`, the search runs automatically.
- Calls `GET /api/trains/spot/:query`.
- **Shows:** train name and number, current status, source, destination, current location, delay ("On Time", "N minutes late", or "N/A" for saved timetables), and a schedule table (station, arrival, departure, platform).
- Loading and error messages, a notice saying whether the data is a saved timetable or sample data, and a **View Coach Position** link.

#### Coach Position — `coach.html` + `coach.css` + `coach.js`

- Reads `?train=` (or `?trainNumber=` and `?trainName=`). You can also type a 5-digit train number in the **search box** at the top right and click **Show Coaches**.
- Opens on the first coach that has a seat layout, rather than the engine.
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
- **Help topics:**
  - Clicking a card (or pressing Enter or Space on it) opens a dialog that explains how to use that feature of this app, with links to the right page.
  - The six topics: Train Running Status, PNR Status (including what CNF / RAC / WL mean), Train Schedule, Platform & Station Info, Account & Profile, and App & Website Issues.
  - Close the dialog with ×, the Escape key, or by clicking outside it.
- **Feedback form:**
  - *Give Feedback* (or the link in "App & Website Issues") opens a form with name, email, category and message.
  - It is checked in the browser, then sent to `POST /api/feedback` and saved in MongoDB.
  - The result appears in the form: success, a validation message, or "Unable to reach the server".
- *Contact Support* opens an email to `support@whereismytrain.in`.
- Social icons and the "Live train map" button show a *"coming soon"* toast message.
- Mobile menu, and links back to Home.
- The help topics work without the backend; only the feedback form needs it.

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

### Backend URL (shared config)

Every page loads `js/config.js`, then `js/nav.js`, then its own script. Each page script reads `window.APP_CONFIG.API_BASE_URL`, falling back to `http://localhost:5000` if it isn't set.

| How the page was opened | Where `js/config.js` comes from | `API_BASE_URL` |
|---|---|---|
| From the backend, e.g. `http://localhost:5000/tracking.html` (recommended) | Generated by the backend route `GET /js/config.js` | `window.location.origin`, the same server. This works on any `PORT`, and from another device via your PC's IP address. |
| Double-clicked file, or VS Code Live Server | The real file [`frontend/js/config.js`](frontend/js/config.js) | `'http://localhost:5000'`. Edit this line if your backend runs elsewhere. |

---

## Which RapidAPI endpoints work

These results come from calling the configured API (`irctc-indian-railway-pnr-status.p.rapidapi.com`) directly:

| RapidAPI endpoint | Used by | Status |
|---|---|---|
| `GET /coach-position/{trainNo}` | `/api/trains/coach/:trainNo` | ✅ Works (live data) |
| `GET /getPNRStatus/{pnr}` | `/api/pnr/:pnr` | ✅ Works (live data) |
| `GET /getTrainStatus` | `/api/trains/spot/:query` | ❌ `404 Endpoint does not exist` → sample data |
| `GET /getTrainsBetweenStations` | `/api/trains/between/:from/:to` | ❌ `404 Endpoint does not exist` → sample data |

Until then, these two routes use the saved timetables in MongoDB (see [Live data vs. fallback data](#live-data-vs-fallback-data)). For real live status or trains-between data, subscribe to a RapidAPI plan or API that offers those endpoints. Then update the URLs and the field mapping in `server.js`. The frontend already reads several field-name variants.

---

## Testing the Project

### 1. Backend (terminal or browser)

With the server running:

```bash
curl http://localhost:5000/api/trains/spot/16301          # saved timetable (X-Data-Source: database)
curl http://localhost:5000/api/trains/spot/99999          # unknown train → sample data (fallback)
curl http://localhost:5000/api/trains/between/QLN/ERS     # 3 saved trains
curl http://localhost:5000/api/trains/between/ERS/QLN     # [] – no saved train in that direction
curl http://localhost:5000/api/trains/coach/12626         # live coach order
curl http://localhost:5000/api/pnr/1234567890             # → success:false, "PNR not yet generated"
curl http://localhost:5000/api/pnr/12ab                   # → 400 validation error
curl http://localhost:5000/api/history
curl http://localhost:5000/api/nope                       # → JSON 404
curl -X POST http://localhost:5000/api/feedback -H "Content-Type: application/json" -d '{"message":"hi"}'   # → 400
```

Add `-i` to see the `X-Data-Source` header, e.g. `curl -i http://localhost:5000/api/trains/spot/16301`.

### 2. Frontend checklist

| # | Steps | Expected result |
|---|---|---|
| 0 | Open **http://localhost:5000**, then click every link in the top navigation bar | Each page opens with its link highlighted |
| 1 | On Home, type `Kollam` in *From*, pick the suggestion, type `ERS` in *To*, click **Search** | The train list shows 3 trains (Venad, Jan Shatabdi, Mangaluru Exp) and a "saved timetables" notice |
| 2 | Click **Live Status** on the Venad Express card | The tracking page shows its 9-stop schedule with a "saved timetable" notice |
| 3 | Click **View Coach Position** | The coach page shows the real coach order from RapidAPI (23 coaches) |
| 4 | Click a sleeper coach, then the engine | Sleeper berth layout, then "Layout not available" |
| 5 | Open `coach.html` with no parameters | Sample rake GEN/A1/B1–B6/S1–S9 |
| 6 | Search `ERS` → `QLN` on the train list | "No trains found" (no saved train runs that way) |
| 7 | Open `tracking.html?train=99999` | Sample data, with a "sample data" notice |
| 8 | Home → PNR tab, enter `123`, then `1234567890` | "Please enter a valid 10-digit PNR number.", then the API's message (PNR not generated) |
| 9 | Home → Coach Position tab, enter `12626` | Opens `coach.html?train=12626` |
| 10 | Click the **?** icon, then the *PNR Status* topic card | The Help Desk opens, and a dialog explains PNR status codes |
| 11 | Help Desk → *Give Feedback*, send `hi`, then a longer message | "at least 5 characters", then "Thank you! Your feedback has been received." (check the `feedbacks` collection in Atlas) |
| 12 | Stop the backend and search again on the train list | "Unable to load trains … backend server is running" |
| 13 | Call `/api/history` | The searches above are listed (PNR masked) |

Open the browser DevTools (F12) → **Console** and **Network**: there should be no red errors while the backend is running.

These flows were also checked with an automated headless-Chrome run, both with the site served by the backend and with the pages opened as files. Each run passed 85 of 85 checks, with no console errors, script errors or failed requests on any page. The checks included the navigation bar on every page and a full Find Trains → Live Status → Coach Position journey using only the nav bar.

---

## Troubleshooting

| Problem | Cause and fix |
|---|---|
| `❌ Port 5000 is already in use` | Another program, often an old `node server.js`, is using port 5000. Stop it (close its terminal, or end the `node.exe` process in Task Manager), or change `PORT` in `.env` and `API_BASE_URL` in `frontend/js/config.js`. |
| Train list says "showing sample trains" for every route | The `trains` collection is empty. Run `npm run seed` in `backend/`. |
| Feedback says "can't be saved right now" | MongoDB is not connected (check the server console). |
| `⚠️ Warning: MONGO_URI is missing` | `backend/.env` is missing, or has no `MONGO_URI`. Run the server from the `backend/` folder. |
| `❌ MongoDB Atlas Connection Error` | Wrong username or password in the URI, or your IP is not allowed. In Atlas, go to **Network Access** and add your current IP. |
| `/api/history` returns `500` | MongoDB is not connected (see above). |
| Coach page always shows the sample layout | The backend isn't running, or the RapidAPI key is invalid or out of quota. Check the server console for `Coach Position API Error`. |
| PNR says "service is unavailable" | RapidAPI rejected the request (bad key, quota, or network). Check the server console. |
| Every page says "make sure the backend is running" | Start `npm start` in `backend/` and keep that terminal open. |
| `http://localhost:5000` says "Cannot GET /" | An old copy of the server (from before the website was served by the backend) is still running. Stop it and run `npm start` again. |
| A change to a page doesn't show up | Refresh the browser (`Ctrl + F5` for a hard refresh). Backend changes need a server restart. |
| `Cannot find module 'express'` | Run `npm install` inside `backend/`. |
| Status or train list shows "saved timetables" instead of live data | Expected with the current RapidAPI plan; see [Which RapidAPI endpoints work](#which-rapidapi-endpoints-work). |

---

## Security Notes

- **Never commit `backend/.env`.** It is listed in `.gitignore`. Share credentials privately, not through git.
- The RapidAPI key is used **only on the server**. The browser never sees it.
- PNR numbers are masked before they are stored in MongoDB.
- Feedback (which may include an email address) is stored in MongoDB, but no API route returns it.
- Request bodies are limited to 10 KB, and all feedback fields are validated and length-limited.
- Values from the API are HTML-escaped before they are inserted into the page (Home PNR result, train list and tracking page).
- Errors are returned as short JSON messages. Stack traces are only printed on the server.
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

- Live running status and trains-between-stations use the saved sample timetables (7 trains, approximate times) until an API plan that supports them is configured. There is no live train position or delay.
- The PNR success view reads the most likely field names and has not yet been checked against a real, valid PNR response.
- The station autocomplete lists are small built-in lists, not a full station database.
- The coach view only draws layouts for General, Sleeper, AC 2-tier and AC 3-tier coaches.
- Feedback can only be read in MongoDB Atlas; there is no admin page.
- Ideas: a live map, arrival alarms, saved favourite trains, an admin view for feedback (behind a login), and deployment (e.g. Render for the backend, Netlify for the frontend; update `frontend/js/config.js` to the deployed URL).
