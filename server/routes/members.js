const express = require('express');
const router = express.Router();
const { listMembers, getMember, updateMe } = require('../controllers/memberController');
const { requireAuth } = require('../middleware/auth');

router.get('/', listMembers);
router.put('/me', requireAuth, updateMe);
router.get('/:id', getMember);

module.exports = router;
