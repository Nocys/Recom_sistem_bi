module.exports = {
  testEnvironment: 'node',
  testMatch: ['**/__tests__/**/*.test.js'],
  clearMocks: true,
  collectCoverageFrom: [
    'utils/**/*.js',
    'services/**/*.js',
    '!services/**/db*.js'
  ]
};
