const mongoose = require('mongoose');

// Keep a reference so we can clean up the in-memory server on shutdown if we started one.
let memoryServer = null;

async function connectDB() {
  const uriFromEnv = process.env.MONGODB_URI && process.env.MONGODB_URI.trim();

  if (uriFromEnv) {
    // A real MongoDB (local install or Atlas) was configured — use it.
    await mongoose.connect(uriFromEnv);
    console.log(`[db] Connected to MongoDB at ${uriFromEnv.replace(/\/\/.*@/, '//<credentials>@')}`);
    return;
  }

  // No MONGODB_URI given -> zero-setup local dev mode.
  // Spin up a real MongoDB engine in-process, persisted to server/data/db so
  // data survives restarts, but nothing needs to be installed by hand.
  const { MongoMemoryServer } = require('mongodb-memory-server');
  const path = require('path');
  const fs = require('fs');

  const dbPath = path.join(__dirname, '..', 'data', 'db');
  fs.mkdirSync(dbPath, { recursive: true });

  memoryServer = await MongoMemoryServer.create({
    instance: {
      dbPath,
      port: 27117,
      storageEngine: 'wiredTiger',
    },
  });

  const uri = memoryServer.getUri('shakticonnect');
  await mongoose.connect(uri);
  console.log('[db] MONGODB_URI not set — started a local built-in MongoDB for development.');
  console.log(`[db] Data is being saved to server/data/db so it persists between restarts.`);
  console.log(`[db] Connected at ${uri}`);
}

async function disconnectDB() {
  await mongoose.disconnect();
  if (memoryServer) {
    await memoryServer.stop();
  }
}

module.exports = { connectDB, disconnectDB };
