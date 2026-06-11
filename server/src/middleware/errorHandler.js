/* eslint-disable no-unused-vars */
// Central Express error handler. Controllers throw ApiError (or any error)
// and it is translated into a consistent JSON response here.
function errorHandler(err, _req, res, _next) {
  // Mongoose duplicate-key error (unique index violation)
  if (err && err.code === 11000) {
    return res.status(409).json({ error: 'Username or email already exists' });
  }

  const status = err.status || 500;
  if (status >= 500) {
    console.error('Unhandled error:', err);
  }
  return res.status(status).json({ error: err.message || 'Server error' });
}

module.exports = errorHandler;
