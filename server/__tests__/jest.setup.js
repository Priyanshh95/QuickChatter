// Runs before the test framework is installed. Provide the env the app needs.
process.env.JWT_SECRET = process.env.JWT_SECRET || 'test-secret-for-ci';
process.env.JWT_EXPIRES_IN = '1h';
process.env.NODE_ENV = 'test';
