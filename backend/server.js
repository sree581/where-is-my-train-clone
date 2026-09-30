require('dotenv').config();
const express = require('express');
const axios = require('axios');
const cors = require('cors');
const mongoose = require('mongoose');
const Train = require('./models/Train');
const Feedback = require('./models/Feedback');

const app = express();
// X-Data-Source tells the frontend whether it got live RapidAPI data or the sample fallback
app.use(cors({ exposedHeaders: ['X-Data-Source'] }));
app.use(express.json({ limit: '10kb' }));

const PORT = process.env.PORT || 5000;
const RAPIDAPI_KEY = process.env.RAPIDAPI_KEY;
const RAPIDAPI_HOST = process.env.RAPIDAPI_HOST || 'irctc-indian-railway-pnr-status.p.rapidapi.com';
const MONGO_URI = process.env.MONGO_URI || process.env.MONGODB_URI;

// ==========================================
// 1. CONNECT TO MONGODB ATLAS
// ==========================================
if (MONGO_URI) {
    mongoose.connect(MONGO_URI)
        .then(() => console.log('✅ Connected to MongoDB Atlas successfully!'))
        .catch(err => console.error('❌ MongoDB Atlas Connection Error:', err.message));
} else {
    console.warn('⚠️ Warning: MONGO_URI is missing in your .env file!');
}

// Schema and Model to record search history
const searchSchema = new mongoose.Schema({
    queryType: { type: String, required: true },
    searchQuery: { type: String, required: true },
    searchedAt: { type: Date, default: Date.now }
});

const SearchHistory = mongoose.model('SearchHistory', searchSchema);

const isDbConnected = () => mongoose.connection.readyState === 1;


// ==========================================
// 2. SAVED TIMETABLES (MongoDB "trains" collection, filled by seed.js)
//    Used when RapidAPI has no live data, before the hard-coded fallback.
// ==========================================

// "HH:MM" on journey day N -> minutes since day 1 00:00
function toMinutes(time, day) {
    const match = /^(\d{1,2}):(\d{2})$/.exec(time || '');
    return match ? (day - 1) * 1440 + Number(match[1]) * 60 + Number(match[2]) : null;
}

function formatDuration(minutes) {
    if (minutes === null || minutes < 0) return 'N/A';
    return `${Math.floor(minutes / 60)}h ${String(minutes % 60).padStart(2, '0')}m`;
}

// Returns the train in the /spot response shape, or null if it isn't saved
async function findSavedTrain(trainNumber) {
    if (!isDbConnected()) return null;

    const train = await Train.findOne({ trainNumber }).lean();
    if (!train) return null;

    return {
        trainNumber: train.trainNumber,
        trainName: train.trainName,
        source: train.source,
        destination: train.destination,
        runsOn: train.runsOn,
        positionStatus: 'Scheduled timetable (live position unavailable)',
        delayMinutes: null,
        schedule: train.schedule.map(stop => ({
            stationName: stop.stationName,
            stationCode: stop.stationCode,
            arrivalTime: stop.arrivalTime,
            departureTime: stop.departureTime,
            day: stop.day,
            platform: stop.platform
        }))
    };
}

// Returns saved trains that stop at `from` and later at `to` (the /between response shape),
// or null when no timetables have been seeded at all
async function findSavedTrainsBetween(from, to) {
    if (!isDbConnected()) return null;
    if (await Train.estimatedDocumentCount() === 0) return null;

    const candidates = await Train.find({ 'schedule.stationCode': { $all: [from, to] } }).lean();

    return candidates
        .map(train => {
            const fromIndex = train.schedule.findIndex(stop => stop.stationCode === from);
            const toIndex = train.schedule.findIndex(stop => stop.stationCode === to);
            if (fromIndex === -1 || toIndex === -1 || fromIndex >= toIndex) return null;

            const fromStop = train.schedule[fromIndex];
            const toStop = train.schedule[toIndex];
            const start = toMinutes(fromStop.departureTime, fromStop.day);
            const end = toMinutes(toStop.arrivalTime, toStop.day);

            return {
                trainNumber: train.trainNumber,
                trainName: train.trainName,
                departureTime: fromStop.departureTime,
                arrivalTime: toStop.arrivalTime,
                travelTime: start !== null && end !== null ? formatDuration(end - start) : 'N/A',
                runsOn: train.runsOn
            };
        })
        .filter(Boolean)
        .sort((a, b) => a.departureTime.localeCompare(b.departureTime));
}


// ==========================================
// 3. API ENDPOINTS
// ==========================================

// Spot Train Route and Live Status
app.get('/api/trains/spot/:query', async (req, res) => {
    const { query } = req.params;

    // Save search log to MongoDB
    if (mongoose.connection.readyState === 1) {
        SearchHistory.create({ queryType: 'SPOT', searchQuery: query })
            .catch(err => console.error('Error logging to MongoDB:', err.message));
    }

    try {
        const response = await axios.get(`https://${RAPIDAPI_HOST}/getTrainStatus`, {
            params: { trainNo: query, startDay: '0' },
            headers: {
                'x-rapidapi-key': RAPIDAPI_KEY,
                'x-rapidapi-host': RAPIDAPI_HOST
            }
        });

        res.set('X-Data-Source', 'live').json(response.data);
    } catch (err) {
        console.error("Spot Train API Error:", err.response?.data || err.message);

        // Next best: the saved timetable for this train in MongoDB
        try {
            const savedTrain = await findSavedTrain(query);
            if (savedTrain) {
                return res.set('X-Data-Source', 'database').json(savedTrain);
            }
        } catch (dbErr) {
            console.error('Saved timetable lookup failed:', dbErr.message);
        }

        // Fallback mock payload for offline testing/presentation
        res.set('X-Data-Source', 'fallback').json({
            trainNumber: query,
            trainName: "KERALA EXPRESS",
            source: "NDLS",
            destination: "TVC",
            positionStatus: "Train running on time",
            delayMinutes: 0,
            schedule: [
                { stationName: "NEW DELHI", stationCode: "NDLS", arrivalTime: "START", departureTime: "20:10", platform: "3" },
                { stationName: "MATHURA JN", stationCode: "MTJ", arrivalTime: "22:00", departureTime: "22:05", platform: "1" },
                { stationName: "AGRA CANTT", stationCode: "AGC", arrivalTime: "22:50", departureTime: "22:55", platform: "1" },
                { stationName: "GWALIOR", stationCode: "GWL", arrivalTime: "00:30", departureTime: "00:35", platform: "2" },
                { stationName: "THIRUVANANTHAPURAM", stationCode: "TVC", arrivalTime: "18:00", departureTime: "END", platform: "1" }
            ]
        });
    }
});

// Trains Between Stations
app.get('/api/trains/between/:from/:to', async (req, res) => {
    const { from, to } = req.params;
    const searchString = `${from.toUpperCase()} to ${to.toUpperCase()}`;

    // Save search log to MongoDB
    if (mongoose.connection.readyState === 1) {
        SearchHistory.create({ queryType: 'BETWEEN_STATIONS', searchQuery: searchString })
            .catch(err => console.error('Error logging to MongoDB:', err.message));
    }

    try {
        const today = new Date();
        const formattedDate = `${String(today.getDate()).padStart(2, '0')}-${String(today.getMonth() + 1).padStart(2, '0')}-${today.getFullYear()}`;

        const response = await axios.get(`https://${RAPIDAPI_HOST}/getTrainsBetweenStations`, {
            params: {
                fromStationCode: from.toUpperCase(),
                toStationCode: to.toUpperCase(),
                dateOfJourney: formattedDate
            },
            headers: {
                'x-rapidapi-key': RAPIDAPI_KEY,
                'x-rapidapi-host': RAPIDAPI_HOST
            }
        });

        const rawData = response.data;
        const list = rawData?.data || rawData?.trains || (Array.isArray(rawData) ? rawData : []);

        if (!Array.isArray(list) || list.length === 0) {
            // Handled below: saved timetables, then the sample list
            throw new Error('RapidAPI returned no trains');
        }

        const trainList = list.map(t => ({
            trainNumber: t.train_number || t.trainNo || t.train_no || '12626',
            trainName: t.train_name || t.trainName || 'Express',
            departureTime: t.departure_time || t.std || 'N/A',
            arrivalTime: t.arrival_time || t.sta || 'N/A',
            travelTime: t.travel_time || t.duration || 'N/A'
        }));

        res.set('X-Data-Source', 'live').json(trainList);
    } catch (err) {
        console.error("Between Stations API Error:", err.response?.data || err.message);

        // Next best: saved timetables in MongoDB (an empty list means no saved train runs this route)
        try {
            const savedTrains = await findSavedTrainsBetween(from.toUpperCase(), to.toUpperCase());
            if (savedTrains) {
                return res.set('X-Data-Source', 'database').json(savedTrains);
            }
        } catch (dbErr) {
            console.error('Saved timetable lookup failed:', dbErr.message);
        }

        res.set('X-Data-Source', 'fallback').json([
            { trainNumber: "12626", trainName: "KERALA EXPRESS", departureTime: "20:10", arrivalTime: "18:00", travelTime: "45h 50m" },
            { trainNumber: "12618", trainName: "MANGALA LAKSHADWEEP EXP", departureTime: "05:40", arrivalTime: "10:25", travelTime: "50h 45m" }
        ]);
    }
});

// Coach Position
app.get('/api/trains/coach/:trainNo', async (req, res) => {
    const { trainNo } = req.params;

    // Save search log to MongoDB
    if (mongoose.connection.readyState === 1) {
        SearchHistory.create({ queryType: 'COACH', searchQuery: trainNo })
            .catch(err => console.error('Error logging to MongoDB:', err.message));
    }

    try {
        const response = await axios.get(
            `https://${RAPIDAPI_HOST}/coach-position/${encodeURIComponent(trainNo)}`,
            {
                headers: {
                    'x-rapidapi-key': RAPIDAPI_KEY,
                    'x-rapidapi-host': RAPIDAPI_HOST
                }
            }
        );

        res.json(response.data);
    } catch (err) {
        console.error(
            "Coach Position API Error:",
            err.response?.data || err.message
        );

        res.status(500).json({
            success: false,
            message: "Failed to fetch coach position"
        });
    }
});

// PNR Status (RapidAPI returns { success, message } for invalid/flushed PNRs, or { success, data } for valid ones)
app.get('/api/pnr/:pnr', async (req, res) => {
    const { pnr } = req.params;

    if (!/^\d{10}$/.test(pnr)) {
        return res.status(400).json({ success: false, message: "PNR number must be exactly 10 digits" });
    }

    // Save search log to MongoDB (masked, since a PNR identifies a passenger booking)
    if (mongoose.connection.readyState === 1) {
        SearchHistory.create({ queryType: 'PNR', searchQuery: `${pnr.slice(0, 3)}XXXXX${pnr.slice(-2)}` })
            .catch(err => console.error('Error logging to MongoDB:', err.message));
    }

    try {
        const response = await axios.get(`https://${RAPIDAPI_HOST}/getPNRStatus/${pnr}`, {
            headers: {
                'x-rapidapi-key': RAPIDAPI_KEY,
                'x-rapidapi-host': RAPIDAPI_HOST
            }
        });

        res.json(response.data);
    } catch (err) {
        console.error("PNR Status API Error:", err.response?.data || err.message);

        res.status(502).json({
            success: false,
            message: "PNR service is unavailable right now. Please try again later."
        });
    }
});

// History Endpoint (To prove MongoDB integration during evaluation)
app.get('/api/history', async (req, res) => {
    try {
        const history = await SearchHistory.find().sort({ searchedAt: -1 }).limit(10);
        res.json(history);
    } catch (err) {
        res.status(500).json({ error: "Failed to fetch search history" });
    }
});

// Help Desk feedback form
app.post('/api/feedback', async (req, res) => {
    const { name, email, category, message } = req.body || {};

    if (typeof message !== 'string' || message.trim().length < 5) {
        return res.status(400).json({ success: false, message: "Please write a message of at least 5 characters" });
    }
    if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        return res.status(400).json({ success: false, message: "Please enter a valid email address" });
    }
    if (!isDbConnected()) {
        return res.status(503).json({ success: false, message: "Feedback can't be saved right now. Please try again later." });
    }

    try {
        const feedback = await Feedback.create({
            name: name || undefined,
            email: email || undefined,
            category: category || undefined,
            message
        });
        res.status(201).json({ success: true, message: "Thank you! Your feedback has been received.", id: feedback._id });
    } catch (err) {
        if (err.name === 'ValidationError') {
            return res.status(400).json({ success: false, message: Object.values(err.errors)[0].message });
        }
        console.error('Error saving feedback:', err.message);
        res.status(500).json({ success: false, message: "Failed to save feedback" });
    }
});


// ==========================================
// 4. ERROR HANDLING
// ==========================================

// Unknown /api routes answer in JSON instead of Express's HTML page
app.use('/api', (req, res) => {
    res.status(404).json({ success: false, message: `No API route for ${req.method} ${req.originalUrl}` });
});

// Last-resort handler, e.g. for malformed or oversized JSON bodies sent to POST routes.
// Express only treats a middleware as an error handler when it takes all four arguments.
app.use((err, req, res, next) => {
    const status = err.status || err.statusCode || 500;
    const messages = { 400: "Invalid request body", 413: "Request body is too large" };

    if (status >= 500) console.error('Unhandled server error:', err);
    res.status(status).json({ success: false, message: messages[status] || "Internal server error" });
});

// Start Server
// Express 5 passes listen errors (e.g. port already in use) to this callback
app.listen(PORT, (err) => {
    if (err) {
        console.error(err.code === 'EADDRINUSE'
            ? `❌ Port ${PORT} is already in use. Stop the other server (or change PORT in .env) and try again.`
            : `❌ Server failed to start: ${err.message}`);
        process.exit(1);
    }
    console.log(`🚀 Server running on http://localhost:${PORT}`);
});