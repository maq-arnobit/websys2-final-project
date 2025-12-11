export default {
  preset: 'ts-jest',
  testEnvironment: 'node',
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
  },
  moduleFileExtensions: ['ts', 'js', 'json'],
  testMatch: ['<rootDir>/src/**/*.test.ts'],
  reporters: [
    "default",
    ["jest-html-reporter", {
      pageTitle: "Test Report",
      outputPath: "tests-report.html"
    }]
  ],
  // collectCoverage: true,
  // coverageDirectory: "coverage",
  // coverageReporters: ["text", "lcov", "html"],
  // collectCoverageFrom: [
  //   "src/**/*.{js,ts,jsx,tsx}",
  //   "!src/**/*.d.ts"
  // ],
};
