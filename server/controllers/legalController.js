const LegalCategory = require('../models/LegalCategory');
const Helpline = require('../models/Helpline');

async function listCategories(req, res) {
  const categories = await LegalCategory.find().sort({ order: 1 });
  res.json({ categories });
}

async function listHelplines(req, res) {
  const helplines = await Helpline.find().sort({ order: 1 });
  res.json({ helplines });
}

module.exports = { listCategories, listHelplines };
