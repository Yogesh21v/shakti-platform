require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { connectDB } = require('./config/db');

const authRoutes = require('./routes/auth');
const memberRoutes = require('./routes/members');
const forumRoutes = require('./routes/forum');
const businessRoutes = require('./routes/business');
const legalRoutes = require('./routes/legal');

const app = express();

// In local dev, reflect whatever origin the browser sends (so it doesn't matter whether
// you open the frontend via localhost or 127.0.0.1). Set CLIENT_ORIGIN in .env to lock
// this down to your real frontend URL once you deploy.
app.use(cors({ origin: process.env.CLIENT_ORIGIN || true }));
app.use(express.json());

app.get('/api/health', (req, res) => res.json({ ok: true, service: 'shakti-platform-api' }));

app.use('/api/auth', authRoutes);
app.use('/api/members', memberRoutes);
app.use('/api/forum', forumRoutes);
app.use('/api/business', businessRoutes);
app.use('/api/legal', legalRoutes);

// Fallback error handler
app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ error: 'Something went wrong on the server.' });
});

const PORT = process.env.PORT || 5000;

connectDB()
  .then(() => {
    app.listen(PORT, () => {
      console.log(`[server] ShaktiConnect API running on http://localhost:${PORT}`);
    });
  })
  .catch((err) => {
    console.error('[server] Failed to start:', err);
    process.exit(1);
  });
