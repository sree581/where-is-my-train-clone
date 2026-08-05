const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const Train = require('./models/Train');

const app = express();

app.use(cors());
app.use(express.json());

// 1. Health Check
app.get('/api/health', (req, res) => {
    res.json({ status: "Train gateway active" });
});

// 2. Find Trains Between Stations (MUST BE ABOVE /spot/:query)
app.get('/api/trains/search', async (req, res) => {
    try {
        const { from, to } = req.query;
        
        // Searches for trains where the schedule contains BOTH station codes
        const trains = await Train.find({
            "schedule.stationCode": { $all: [from?.toUpperCase(), to?.toUpperCase()] }
        });

        res.json(trains);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// 3. Search Train by Number or Name
app.get('/api/trains/spot/:query', async (req, res) => {
    try {
        const { query } = req.params;
        const train = await Train.findOne({
            $or: [
                { trainNumber: query },
                { trainName: { $regex: query, $options: 'i' } }
            ]
        });

        if (!train) {
            return res.status(404).json({ message: "Train not found" });
        }

        res.json(train);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

const PORT = process.env.PORT || 5000;

mongoose.connect(process.env.MONGO_URI)
    .then(() => {
        app.listen(PORT, () => console.log(`Server rolling on port ${PORT}`));
    })
    .catch(err => console.error("Database connection failed:", err));