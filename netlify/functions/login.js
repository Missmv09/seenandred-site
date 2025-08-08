const crypto = require('crypto');
const { signSession } = require('./token');

const pendingCodes = {};

async function sendCode(email, code) {
  // Placeholder: integrate with email service in production
  console.log(`Sending code ${code} to ${email}`);
}

exports.handler = async (event) => {
  let body;
  try {
    body = JSON.parse(event.body || '{}');
  } catch (e) {
    body = {};
  }
  const { email, code } = body;
  if (!email) {
    return { statusCode: 400, body: JSON.stringify({ error: 'Email required' }) };
  }

  if (!code) {
    const generated = String(crypto.randomInt(100000, 1000000)).padStart(6, '0');
    pendingCodes[email] = { code: generated, exp: Date.now() + 10 * 60 * 1000 };
    await sendCode(email, generated);
    return { statusCode: 200, body: JSON.stringify({ sent: true }) };
  }

  const record = pendingCodes[email];
  if (!record || record.exp < Date.now() || record.code !== code) {
    return { statusCode: 401, body: JSON.stringify({ error: 'Invalid code' }) };
  }
  delete pendingCodes[email];

  const token = signSession(email);
  return { statusCode: 200, body: JSON.stringify({ token }) };
};
