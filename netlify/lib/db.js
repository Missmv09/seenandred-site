const fs = require('fs').promises;
const path = require('path');

const DB_PATH = path.join(__dirname, '..', 'data', 'subscriptions.json');
const TTL = parseInt(process.env.SUBSCRIPTION_CACHE_TTL || '86400000', 10); // 24h

async function readDb() {
  try {
    const data = await fs.readFile(DB_PATH, 'utf-8');
    return JSON.parse(data);
  } catch (err) {
    if (err.code === 'ENOENT') {
      return {};
    }
    throw err;
  }
}

async function writeDb(db) {
  await fs.mkdir(path.dirname(DB_PATH), { recursive: true });
  await fs.writeFile(DB_PATH, JSON.stringify(db, null, 2));
}

async function getSubscription(email) {
  const db = await readDb();
  const record = db[email];
  if (!record) return null;
  if (Date.now() - record.updatedAt > TTL) {
    return null;
  }
  return record.subscriptionActive;
}

async function setSubscription(email, active) {
  const db = await readDb();
  db[email] = { subscriptionActive: active, updatedAt: Date.now() };
  await writeDb(db);
}

module.exports = { getSubscription, setSubscription };
