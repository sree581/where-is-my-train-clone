require('dotenv').config();
const express = require('express');
const axios = require('axios');
const cors = require('cors');
const mongoose = require('mongoose');

const app = express();
// X-Data-Source tells the frontend whether it got live RapidAPI data or the sample fallback
app.use(cors({ exposedHeaders: ['X-Data-Source'] }));
app.use(express.json());

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


// ==========================================
// 2. API ENDPOINTS
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
        let list = rawData?.data || rawData?.trains || (Array.isArray(rawData) ? rawData : []);
        let dataSource = 'live';

        if (!Array.isArray(list) || list.length === 0) {
            dataSource = 'fallback';
            list = [
                { train_number: "12626", train_name: "KERALA EXPRESS", departure_time: "20:10", arrival_time: "18:00", duration: "45h 50m" },
                { train_number: "12618", train_name: "MANGALA LAKSHADWEEP EXP", departure_time: "05:40", arrival_time: "10:25", duration: "50h 45m" }
            ];
        }

        const trainList = list.map(t => ({
            trainNumber: t.train_number || t.trainNo || t.train_no || '12626',
            trainName: t.train_name || t.trainName || 'Express',
            departureTime: t.departure_time || t.std || 'N/A',
            arrivalTime: t.arrival_time || t.sta || 'N/A',
            travelTime: t.travel_time || t.duration || 'N/A'
        }));

        res.set('X-Data-Source', dataSource).json(trainList);
    } catch (err) {
        console.error("Between Stations API Error:", err.response?.data || err.message);

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

// Start Server
app.listen(PORT, () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
});