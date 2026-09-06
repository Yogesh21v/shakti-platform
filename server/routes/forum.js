const express = require('express');
const router = express.Router();
const {
  getCategories,
  getMentors,
  listPosts,
  getPost,
  createPost,
  addReply,
  toggleVote,
} = require('../controllers/forumController');
const { requireAuth, optionalAuth } = require('../middleware/auth');

router.get('/categories', getCategories);
router.get('/mentors', getMentors);
router.get('/posts', optionalAuth, listPosts);
router.post('/posts', requireAuth, createPost);
router.get('/posts/:id', optionalAuth, getPost);
router.post('/posts/:id/replies', requireAuth, addReply);
router.post('/posts/:id/vote', requireAuth, toggleVote);

module.exports = router;
