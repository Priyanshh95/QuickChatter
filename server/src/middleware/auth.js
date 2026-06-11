const { verifyToken } = require('../utils/token');
const ApiError = require('../utils/ApiError');

/**
 * Protects a route: requires a valid `Authorization: Bearer <token>` header.
 * On success, attaches { id, username } to req.user.
 */
function requireAuth(req, _res, next) {
  const header = req.headers.authorization || '';
  const token = header.startsWith('Bearer ') ? header.slice(7).trim() : null;

  if (!token) {
    return next(new ApiError(401, 'Authentication required'));
  }

  try {
    const decoded = verifyToken(token);
    req.user = { id: decoded.id, username: decoded.username };
    return next();
  } catch (_err) {
    return next(new ApiError(401, 'Invalid or expired token'));
  }
}

module.exports = requireAuth;
