const jwt = require('jsonwebtoken');

function getSecret() {
  const secret = process.env.JWT_SECRET;
  if (!secret || secret === 'replace-with-a-long-random-string') {
    throw new Error('JWT_SECRET is not configured — set a strong value in your .env file.');
  }
  return secret;
}

/** Sign a JWT for the given payload (e.g. { id, username }). */
function signToken(payload) {
  return jwt.sign(payload, getSecret(), {
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  });
}

/** Verify a JWT and return its decoded payload (throws if invalid/expired). */
function verifyToken(token) {
  return jwt.verify(token, getSecret());
}

module.exports = { signToken, verifyToken };
