// Lightweight HTTP error carrying a status code, thrown by controllers and
// translated into a JSON response by the central error handler.
class ApiError extends Error {
  constructor(status, message) {
    super(message);
    this.status = status;
    this.name = 'ApiError';
  }
}

module.exports = ApiError;
