const mongoose = require('mongoose');

const stationScheduleSchema = new mongoose.Schema({
  stationCode: { type: String, required: true },
  stationName: { type: String, required: true },
  arrivalTime: String,
  departureTime: String,
  day: { type: Number, default: 1 },
  platform: { type: String, default: "1" }
});

const trainSchema = new mongoose.Schema({
  trainNumber: { type: String, required: true, unique: true },
  trainName: { type: String, required: true },
  source: { type: String, required: true },
  destination: { type: String, required: true },
  runsOn: [String], // e.g., ["Daily"] or ["Mon", "Wed", "Fri"]
  schedule: [stationScheduleSchema]
});

module.exports = mongoose.model('Train', trainSchema);