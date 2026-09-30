// Fills the MongoDB "trains" collection with sample timetables.
// The server uses these when RapidAPI has no live status / trains-between data.
//
// NOTE: timings and platforms are APPROXIMATE SAMPLE DATA for the college demo,
// not official Indian Railways timetables.
//
// Run from the backend folder:  npm run seed   (or: node seed.js)
// This REPLACES everything in the "trains" collection. Search history and feedback are untouched.

const mongoose = require('mongoose');
require('dotenv').config();
const Train = require('./models/Train');

// Shorthand for one stop: [code, name, arrival, departure, day, platform]
const stops = (list) => list.map(([stationCode, stationName, arrivalTime, departureTime, day, platform]) => ({
  stationCode, stationName, arrivalTime, departureTime, day, platform
}));

const sampleTrains = [
  {
    trainNumber: "12625",
    trainName: "Kerala Express",
    source: "Thiruvananthapuram Central (TVC)",
    destination: "New Delhi (NDLS)",
    runsOn: ["Daily"],
    schedule: stops([
      ["TVC", "Thiruvananthapuram Central", "START", "11:15", 1, "1"],
      ["QLN", "Kollam Jn", "12:17", "12:20", 1, "1"],
      ["KYJ", "Kayamkulam Jn", "12:58", "13:00", 1, "2"],
      ["CNGR", "Chengannur", "13:28", "13:30", 1, "1"],
      ["KTYM", "Kottayam", "14:07", "14:10", 1, "1"],
      ["ERN", "Ernakulam Town", "15:32", "15:35", 1, "2"],
      ["TCR", "Thrissur", "17:02", "17:05", 1, "1"],
      ["PGT", "Palakkad Jn", "18:40", "18:45", 1, "4"],
      ["CBE", "Coimbatore Jn", "20:05", "20:10", 1, "2"],
      ["BPL", "Bhopal Jn", "04:55", "05:05", 3, "1"],
      ["NDLS", "New Delhi", "13:30", "END", 4, "8"]
    ])
  },
  {
    trainNumber: "12626",
    trainName: "Kerala Express",
    source: "New Delhi (NDLS)",
    destination: "Thiruvananthapuram Central (TVC)",
    runsOn: ["Daily"],
    schedule: stops([
      ["NDLS", "New Delhi", "START", "20:10", 1, "3"],
      ["AGC", "Agra Cantt", "22:50", "22:55", 1, "1"],
      ["BPL", "Bhopal Jn", "05:30", "05:35", 2, "1"],
      ["CBE", "Coimbatore Jn", "08:40", "08:45", 3, "1"],
      ["PGT", "Palakkad Jn", "10:05", "10:10", 3, "3"],
      ["TCR", "Thrissur", "11:35", "11:38", 3, "1"],
      ["ERN", "Ernakulam Town", "13:05", "13:08", 3, "1"],
      ["KTYM", "Kottayam", "14:25", "14:28", 3, "2"],
      ["QLN", "Kollam Jn", "16:30", "16:33", 3, "2"],
      ["TVC", "Thiruvananthapuram Central", "18:00", "END", 3, "1"]
    ])
  },
  {
    trainNumber: "16301",
    trainName: "Venad Express",
    source: "Thiruvananthapuram Central (TVC)",
    destination: "Shoranur Jn (SRR)",
    runsOn: ["Daily"],
    schedule: stops([
      ["TVC", "Thiruvananthapuram Central", "START", "05:00", 1, "1"],
      ["QLN", "Kollam Jn", "05:57", "06:00", 1, "1"],
      ["KYJ", "Kayamkulam Jn", "06:38", "06:40", 1, "1"],
      ["CNGR", "Chengannur", "07:08", "07:10", 1, "1"],
      ["KTYM", "Kottayam", "07:52", "07:55", 1, "1"],
      ["ERS", "Ernakulam Jn", "09:15", "09:20", 1, "3"],
      ["AWY", "Aluva", "09:48", "09:50", 1, "1"],
      ["TCR", "Thrissur", "10:40", "10:43", 1, "1"],
      ["SRR", "Shoranur Jn", "11:45", "END", 1, "4"]
    ])
  },
  {
    trainNumber: "12076",
    trainName: "Jan Shatabdi Express",
    source: "Thiruvananthapuram Central (TVC)",
    destination: "Kozhikode (CLT)",
    runsOn: ["Daily"],
    schedule: stops([
      ["TVC", "Thiruvananthapuram Central", "START", "05:55", 1, "2"],
      ["QLN", "Kollam Jn", "06:48", "06:50", 1, "1"],
      ["KYJ", "Kayamkulam Jn", "07:20", "07:22", 1, "1"],
      ["ALLP", "Alappuzha", "08:07", "08:10", 1, "1"],
      ["ERS", "Ernakulam Jn", "09:00", "09:05", 1, "2"],
      ["TCR", "Thrissur", "10:20", "10:23", 1, "2"],
      ["SRR", "Shoranur Jn", "11:05", "11:10", 1, "3"],
      ["CLT", "Kozhikode", "12:45", "END", 1, "1"]
    ])
  },
  {
    trainNumber: "16347",
    trainName: "Mangaluru Express",
    source: "Thiruvananthapuram Central (TVC)",
    destination: "Mangaluru Central (MAQ)",
    runsOn: ["Daily"],
    schedule: stops([
      ["TVC", "Thiruvananthapuram Central", "START", "20:40", 1, "3"],
      ["QLN", "Kollam Jn", "21:42", "21:45", 1, "2"],
      ["ALLP", "Alappuzha", "23:00", "23:03", 1, "1"],
      ["ERS", "Ernakulam Jn", "00:05", "00:10", 2, "4"],
      ["TCR", "Thrissur", "01:25", "01:28", 2, "1"],
      ["SRR", "Shoranur Jn", "02:30", "02:40", 2, "2"],
      ["CLT", "Kozhikode", "04:10", "04:15", 2, "1"],
      ["CAN", "Kannur", "05:50", "05:55", 2, "1"],
      ["MAQ", "Mangaluru Central", "09:00", "END", 2, "2"]
    ])
  },
  {
    trainNumber: "12618",
    trainName: "Mangala Lakshadweep Express",
    source: "Ernakulam Jn (ERS)",
    destination: "Hazrat Nizamuddin (NZM)",
    runsOn: ["Daily"],
    schedule: stops([
      ["ERS", "Ernakulam Jn", "START", "13:25", 1, "1"],
      ["TCR", "Thrissur", "14:50", "14:53", 1, "1"],
      ["SRR", "Shoranur Jn", "15:40", "15:45", 1, "1"],
      ["CLT", "Kozhikode", "17:05", "17:10", 1, "1"],
      ["CAN", "Kannur", "18:40", "18:43", 1, "1"],
      ["MAQ", "Mangaluru Central", "21:05", "21:15", 1, "3"],
      ["NZM", "Hazrat Nizamuddin", "10:20", "END", 3, "5"]
    ])
  },
  {
    trainNumber: "12002",
    trainName: "Bhopal Shatabdi Express",
    source: "New Delhi (NDLS)",
    destination: "Rani Kamlapati (RKMP)",
    runsOn: ["Daily"],
    schedule: stops([
      ["NDLS", "New Delhi", "START", "06:00", 1, "1"],
      ["AGC", "Agra Cantt", "07:50", "07:55", 1, "1"],
      ["GWL", "Gwalior Jn", "09:23", "09:28", 1, "1"],
      ["RKMP", "Rani Kamlapati", "14:40", "END", 1, "5"]
    ])
  }
];

const seedDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI || process.env.MONGODB_URI);
    await Train.deleteMany({}); // Clears existing timetables
    await Train.insertMany(sampleTrains);
    console.log(`Database seeded successfully with ${sampleTrains.length} sample train timetables!`);
    await mongoose.disconnect();
    process.exit();
  } catch (error) {
    console.error("Error seeding database:", error);
    process.exit(1);
  }
};

seedDB();
