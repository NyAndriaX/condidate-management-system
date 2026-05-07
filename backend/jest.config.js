module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  roots: ['<rootDir>/src', '<rootDir>/tests'],
  collectCoverageFrom: [
    'src/services/candidate.service.ts',
    'src/services/validation.service.ts',
    'src/models/Candidate.model.ts',
    'src/models/User.model.ts',
    'src/middleware/auth.middleware.ts',
    'src/middleware/validation.middleware.ts',
  ],
  coverageThreshold: {
    global: {
      branches: 90,
      functions: 90,
      lines: 90,
      statements: 90,
    },
  },
  coverageDirectory: 'coverage',
  coverageReporters: ['text', 'lcov', 'html', 'json-summary'],
  setupFilesAfterEnv: ['<rootDir>/tests/setup.ts'],
};
