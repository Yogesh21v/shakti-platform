const mongoose = require('mongoose');

const businessIdeaSchema = new mongoose.Schema({
  emoji: { type: String, required: true },
  category: { type: String, required: true },
  title: { type: String, required: true },
  subtitle: { type: String, required: true },
  description: { type: String, required: true },
  ideas: { type: [String], default: [] },
  theme: { type: String, enum: ['saffron', 'gold', 'plain'], default: 'plain' },
  order: { type: Number, default: 0 },
});

module.exports = mongoose.model('BusinessIdea', businessIdeaSchema);
