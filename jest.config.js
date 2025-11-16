/** @type {import('ts-jest').JestConfigWithTsJest} */
module.exports = {
  // Use the standard ts-jest preset
  preset: 'ts-jest',
  testEnvironment: 'node',

  // --- THIS IS THE FIX ---
  // Tells Jest to load the .env file before running tests
  setupFiles: ['dotenv/config'],
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