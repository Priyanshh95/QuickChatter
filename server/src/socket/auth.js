const { verifyToken } = require('../utils/token');
const User = require('../models/User');

/**
 * Socket.IO handshake authentication.
 *
 * The client connects with `io(url, { auth: { token } })`. We verify the JWT,
 * confirm the user still exists, and attach the authoritative identity to
 * socket.user — so handlers never trust client-supplied usernames.
 */
async function socketAuth(socket, next) {
  try {
    const raw =
      socket.handshake.auth?.token ||
      (socket.handshake.headers.authorization || '').replace(/^Bearer\s+/i, '');

    if (!raw) return next(new Error('Authentication required'));

    const decoded = verifyToken(raw);
    const user = await User.findById(decoded.id);
    if (!user) return next(new Error('User no longer exists'));

    socket.user = {
      id: user._id.toString(),
      username: user.username,
      avatar: user.avatar,
    };
    return next();
  } catch (_err) {
    return next(new Error('Invalid or expired token'));
  }
}

module.exports = socketAuth;
