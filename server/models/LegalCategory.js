const mongoose = require('mongoose');

const legalQuestionSchema = new mongoose.Schema({
  question: { type: String, required: true },
  answer: { type: String, required: true },
});

const legalCategorySchema = new mongoose.Schema({
  icon: { type: String, required: true },
  iconColor: { type: String, enum: ['red', 'gold', 'orange', 'plain'], default: 'plain' },
  title: { type: String, required: true },
  subtitle: { type: String, required: true },
  questions: { type: [legalQuestionSchema], default: [] },
  order: { type: Number, default: 0 },
});

module.exports = mongoose.model('LegalCategory', legalCategorySchema);
