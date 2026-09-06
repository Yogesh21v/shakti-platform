const mongoose = require('mongoose');

const mentorSchema = new mongoose.Schema({
  name: { type: String, required: true },
  role: { type: String, required: true },
  avatarColor: { type: String, default: '#8B1A2B' },
  order: { type: Number, default: 0 },
});

module.exports = mongoose.model('Mentor', mentorSchema);
