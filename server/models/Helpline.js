const mongoose = require('mongoose');

const helplineSchema = new mongoose.Schema({
  name: { type: String, required: true },
  number: { type: String, required: true },
  order: { type: Number, default: 0 },
});

module.exports = mongoose.model('Helpline', helplineSchema);
