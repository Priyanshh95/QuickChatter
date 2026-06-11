module.exports = {
  testEnvironment: 'node',
  setupFiles: ['<rootDir>/server/__tests__/jest.setup.js'],
  testMatch: ['<rootDir>/server/**/*.test.js'],
  testTimeout: 30000,
};
