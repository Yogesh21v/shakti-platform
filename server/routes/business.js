const express = require('express');
const router = express.Router();
const { listIdeas, listSchemes } = require('../controllers/businessController');

router.get('/ideas', listIdeas);
router.get('/schemes', listSchemes);

module.exports = router;
