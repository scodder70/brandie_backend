/** @type {import('ts-jest').JestConfigWithTsJest} */
module.exports = {
  // Use the standard ts-jest preset
  preset: 'ts-jest',
  testEnvironment: 'node',

  // Tells Jest to load the .env file before running tests
  setupFiles: ['dotenv/config'],

  // --- THIS IS THE FIX ---
  // Forces Jest to run one test file at a time (serially).
  // This prevents integration tests from interfering with each other.
  maxWorkers: 1,
  // -----------------------

  // It ONLY looks for files in src/modules ending in .spec.ts
  testRegex: '/src/modules/.*\\.spec\\.ts$',

  // This mapper is correct and will now work
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
  },

  clearMocks: true,
  collectCoverage: true,
  coverageDirectory: 'coverage',
  coverageProvider: 'v8',
  coveragePathIgnorePatterns: [
    'node_modules',
    'dist',
    '.interface.ts',
    '.types.ts',
    'main.ts',
    'schema.ts',
    'src/config',
    'src/shared/db',
  ],
};