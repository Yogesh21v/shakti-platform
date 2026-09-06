const BusinessIdea = require('../models/BusinessIdea');
const Scheme = require('../models/Scheme');

async function listIdeas(req, res) {
  const ideas = await BusinessIdea.find().sort({ order: 1 });
  res.json({ ideas });
}

async function listSchemes(req, res) {
  const schemes = await Scheme.find().sort({ order: 1 });
  res.json({ schemes });
}

module.exports = { listIdeas, listSchemes };
