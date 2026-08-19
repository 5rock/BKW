module.exports = {
  testEnvironment: 'node',
  setupFilesAfterEnv: ['./tests/setup.js'],
  clearMocks: true,
  restoreMocks: true,
  testMatch: ['**/tests/**/*.test.js'],
  verbose: true,
  forceExit: true,
};
