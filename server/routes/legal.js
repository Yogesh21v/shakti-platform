const express = require('express');
const router = express.Router();
const { listCategories, listHelplines } = require('../controllers/legalController');

router.get('/categories', listCategories);
router.get('/helplines', listHelplines);

module.exports = router;
