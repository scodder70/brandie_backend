/** @type {import('ts-jest').JestConfigWithTsJest} */
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  // Look for test files only inside the src/modules directory
  testRegex: '(/src/modules/.*|(\\.|/)(test|spec))\\.ts$',
  moduleNameMapper: {
    // Handle module aliases (see tsconfig.json)
    '^@/src/(.*)$': '<rootDir>/src/$1',
    '^@/modules/(.*)$': '<rootDir>/src/modules/$1',
    '^@/shared/(.*)$': '<rootDir>/src/shared/$1',
    '^@/config/(.*)$': '<rootDir>/src/config/$1',
  },
  // Setup file to run before each test (e.g., mock Prisma)
  // setupFilesAfterEnv: ['<rootDir>/tests/setup.ts'],
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