const Post = require('../models/Post');
const Mentor = require('../models/Mentor');

const CATEGORIES = [
  'All Topics',
  'Home & Kitchen',
  'Parenting',
  'Money & Jobs',
  'Health',
  'Business',
  'Rights & Law',
  'Education',
];

async function getCategories(req, res) {
  res.json({ categories: CATEGORIES });
}

async function getMentors(req, res) {
  const mentors = await Mentor.find().sort({ order: 1 });
  res.json({ mentors });
}

async function listPosts(req, res) {
  const { category = '', district = '' } = req.query;
  const query = {};
  if (category && category !== 'All Topics') query.category = category;
  if (district && district !== 'All Districts') query.district = district;

  const posts = await Post.find(query).sort({ pinned: -1, createdAt: -1 }).limit(100);
  res.json({ posts: posts.map((p) => p.toPublicJSON(req.user && req.user._id)) });
}

async function getPost(req, res) {
  const post = await Post.findById(req.params.id);
  if (!post) return res.status(404).json({ error: 'Discussion not found.' });
  res.json({ post: post.toPublicJSON(req.user && req.user._id) });
}

async function createPost(req, res) {
  const { title, body, category, district, anonymous, tags } = req.body;
  if (!title || !category) {
    return res.status(400).json({ error: 'Title and category are required.' });
  }
  const post = await Post.create({
    title,
    body: body || '',
    category,
    district: district || '',
    anonymous: !!anonymous,
    tags: Array.isArray(tags) ? tags : [],
    author: req.user._id,
    authorName: req.user.name,
  });
  res.status(201).json({ post: post.toPublicJSON(req.user._id) });
}

async function addReply(req, res) {
  const { body } = req.body;
  if (!body || !body.trim()) {
    return res.status(400).json({ error: 'Reply cannot be empty.' });
  }
  const post = await Post.findById(req.params.id);
  if (!post) return res.status(404).json({ error: 'Discussion not found.' });

  post.replies.push({ author: req.user._id, authorName: req.user.name, body });
  await post.save();
  res.status(201).json({ post: post.toPublicJSON(req.user._id) });
}

async function toggleVote(req, res) {
  const post = await Post.findById(req.params.id);
  if (!post) return res.status(404).json({ error: 'Discussion not found.' });

  const userId = req.user._id.toString();
  const idx = post.voters.findIndex((v) => v.toString() === userId);
  if (idx === -1) {
    post.voters.push(req.user._id);
  } else {
    post.voters.splice(idx, 1);
  }
  await post.save();
  res.json({ post: post.toPublicJSON(req.user._id) });
}

module.exports = { getCategories, getMentors, listPosts, getPost, createPost, addReply, toggleVote };
