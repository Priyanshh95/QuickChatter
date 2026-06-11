const bcrypt = require('bcryptjs');
const User = require('../models/User');
const { randomAvatar } = require('../utils/avatar');
const { signToken } = require('../utils/token');
const ApiError = require('../utils/ApiError');
const asyncHandler = require('../utils/asyncHandler');

const EMAIL_RE = /^\S+@\S+\.\S+$/;
const SALT_ROUNDS = 10;

/** POST /api/auth/register — create a user with a bcrypt-hashed password. */
const register = asyncHandler(async (req, res) => {
  const { email, username, password, confirmPassword } = req.body || {};

  if (!email || !username || !password || !confirmPassword) {
    throw new ApiError(400, 'All fields are required');
  }
  if (!EMAIL_RE.test(email)) {
    throw new ApiError(400, 'Invalid email format');
  }
  if (username.trim().length < 3) {
    throw new ApiError(400, 'Username must be at least 3 characters');
  }
  if (password.length < 6) {
    throw new ApiError(400, 'Password must be at least 6 characters');
  }
  if (password !== confirmPassword) {
    throw new ApiError(400, 'Passwords do not match');
  }

  const exists = await User.findOne({
    $or: [{ username }, { email: email.toLowerCase() }],
  });
  if (exists) {
    throw new ApiError(409, 'Username or email already exists');
  }

  const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);
  const user = await User.create({ username, email, passwordHash, avatar: randomAvatar() });

  res.status(201).json({ success: true, username: user.username, avatar: user.avatar });
});

/** POST /api/auth/login — verify credentials and return a signed JWT. */
const login = asyncHandler(async (req, res) => {
  const { identifier, password } = req.body || {};

  if (!identifier || !password) {
    throw new ApiError(400, 'All fields are required');
  }

  const user = await User.findOne({
    $or: [{ username: identifier }, { email: identifier.toLowerCase() }],
  });
  if (!user) {
    throw new ApiError(401, 'Invalid credentials');
  }

  const ok = await bcrypt.compare(password, user.passwordHash);
  if (!ok) {
    throw new ApiError(401, 'Invalid credentials');
  }

  const token = signToken({ id: user._id.toString(), username: user.username });
  res.json({ success: true, token, username: user.username, avatar: user.avatar });
});

/** GET /api/auth/me — return the currently authenticated user. */
const me = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user.id);
  if (!user) {
    throw new ApiError(404, 'User not found');
  }
  res.json({ user }); // toJSON transform hides passwordHash
});

module.exports = { register, login, me };
