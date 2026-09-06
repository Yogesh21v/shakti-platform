const mongoose = require('mongoose');

const schemeSchema = new mongoose.Schema({
  name: { type: String, required: true },
  info: { type: String, default: '' },
  order: { type: Number, default: 0 },
});

module.exports = mongoose.model('Scheme', schemeSchema);
