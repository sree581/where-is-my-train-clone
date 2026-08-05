const mongoose = require('mongoose');
require('dotenv').config();
const Train = require('./models/Train');

const sampleTrains = [
  {
    trainNumber: "12626",
    trainName: "Kerala Express",
    source: "New Delhi (NDLS)",
    destination: "Thiruvananthapuram Central (TVC)",
    runsOn: ["Daily"],
    schedule: [
      { stationCode: "NDLS", stationName: "New Delhi", arrivalTime: "START", departureTime: "20:10", day: 1, platform: "3" },
      { stationCode: "BPL", stationName: "Bhopal Junction", arrivalTime: "05:30", departureTime: "05:35", day: 2, platform: "1" },
      { stationCode: "ERS", stationName: "Ernakulam Town", arrivalTime: "14:15", departureTime: "14:20", day: 3, platform: "2" },
      { stationCode: "TVC", stationName: "Thiruvananthapuram Central", arrivalTime: "18:00", departureTime: "END", day: 3, platform: "1" }
    ]
  },
  {
    trainNumber: "12002",
    trainName: "Bhopal Shatabdi Express",
    source: "New Delhi (NDLS)",
    destination: "Rani Kamlapati (RKMP)",
    runsOn: ["Daily"],
    schedule: [
      { stationCode: "NDLS", stationName: "New Delhi", arrivalTime: "START", departureTime: "06:00", day: 1, platform: "1" },
      { stationCode: "AGC", stationName: "Agra Cantt", arrivalTime: "07:50", departureTime: "07:55", day: 1, platform: "1" },
      { stationCode: "RKMP", stationName: "Rani Kamlapati", arrivalTime: "14:40", departureTime: "END", day: 1, platform: "5" }
    ]
  }
];

const seedDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    await Train.deleteMany({}); // Clears existing data
    await Train.insertMany(sampleTrains);
    console.log("Database seeded successfully with sample train schedules!");
    process.exit();
  } catch (error) {
    console.error("Error seeding database:", error);
    process.exit(1);
  }
};

seedDB();