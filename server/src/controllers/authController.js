const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const User = require('../models/User');
const { randomAvatar } = require('../utils/avatar');

const EMAIL_RE = /^\S+@\S+\.\S+$/;
const SALT_ROUNDS = 10;

/**
 * POST /api/auth/register
 * Creates a user with a bcrypt-hashed password in MongoDB.
 */
async function register(req, res) {
  try {
    const { email, username, password, confirmPassword } = req.body || {};

    if (!email || !username || !password || !confirmPassword) {
      return res.status(400).json({ error: 'All fields are required' });
    }
    if (!EMAIL_RE.test(email)) {
      return res.status(400).json({ error: 'Invalid email format' });
    }
    if (password.length < 6) {
      return res.status(400).json({ error: 'Password must be at least 6 characters' });
    }
    if (password !== confirmPassword) {
      return res.status(400).json({ error: 'Passwords do not match' });
    }

    const exists = await User.findOne({
      $or: [{ username }, { email: email.toLowerCase() }],
    });
    if (exists) {
      return res.status(409).json({ error: 'Username or email already exists' });
    }

    const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);
    const user = await User.create({ username, email, passwordHash, avatar: randomAvatar() });

    return res.status(201).json({ success: true, username: user.username, avatar: user.avatar });
  } catch (err) {
    // Handle the rare duplicate-key race between findOne and create
    if (err && err.code === 11000) {
      return res.status(409).json({ error: 'Username or email already exists' });
    }
    console.error('register error:', err);
    return res.status(500).json({ error: 'Server error' });
  }
}

/**
 * POST /api/auth/login
 * Verifies credentials with bcrypt and returns a session token.
 * NOTE: the token is a temporary random string for now; it is replaced
 * with a signed JWT in the next commit.
 */
async function login(req, res) {
  try {
    const { identifier, password } = req.body || {};

    if (!identifier || !password) {
      return res.status(400).json({ error: 'All fields are required' });
    }

    const user = await User.findOne({
      $or: [{ username: identifier }, { email: identifier.toLowerCase() }],
    });
    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const ok = await bcrypt.compare(password, user.passwordHash);
    if (!ok) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const token = crypto.randomBytes(24).toString('hex');
    return res.json({ success: true, token, username: user.username, avatar: user.avatar });
  } catch (err) {
    console.error('login error:', err);
    return res.status(500).json({ error: 'Server error' });
  }
}

module.exports = { register, login };
