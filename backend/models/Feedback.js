const mongoose = require('mongoose');

// Messages submitted from the Help Desk feedback form
const feedbackSchema = new mongoose.Schema({
  name: { type: String, trim: true, maxlength: 100, default: 'Anonymous' },
  email: { type: String, trim: true, maxlength: 200 },
  category: {
    type: String,
    enum: {
      values: ['General', 'Bug Report', 'Feature Request', 'Data Issue'],
      message: 'Please choose a valid feedback category'
    },
    default: 'General'
  },
  message: { type: String, required: true, trim: true, minlength: 5, maxlength: 2000 },
  submittedAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Feedback', feedbackSchema);
