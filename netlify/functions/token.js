const crypto = require('crypto');

const SECRET = process.env.SESSION_SECRET || 'dev-secret';

function signSession(email) {
  const payload = JSON.stringify({ email, exp: Date.now() + 24 * 60 * 60 * 1000 });
  const signature = crypto.createHmac('sha256', SECRET).update(payload).digest('hex');
  return Buffer.from(payload).toString('base64') + '.' + signature;
}

function verifySession(token) {
  if (!token) return null;
  const parts = token.split('.');
  if (parts.length !== 2) return null;
  const [payloadB64, signature] = parts;
  let payloadStr;
  try {
    payloadStr = Buffer.from(payloadB64, 'base64').toString();
  } catch (e) {
    return null;
  }
  const expectedSig = crypto.createHmac('sha256', SECRET).update(payloadStr).digest('hex');
  if (signature !== expectedSig) return null;
  let payload;
  try {
    payload = JSON.parse(payloadStr);
  } catch (e) {
    return null;
  }
  if (payload.exp < Date.now()) return null;
  return payload.email;
}

module.exports = { signSession, verifySession };
