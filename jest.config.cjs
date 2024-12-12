/** @type {import('jest').Config} */
module.exports = {
  testEnvironment: 'jsdom',
  moduleFileExtensions: ['js', 'jsx', 'ts', 'tsx'],
  moduleNameMapper: {
    '^@/styles/(.*)$': '<rootDir>/src/$1',
    '\\.(css|less|scss)$': '<rootDir>/__mocks__/styleMock.js'
  },
  transform: {
    "^.+\\.(t|j)sx?$": ["babel-jest", {
      "configFile": "./.babelrc.json"
    }]
  },
  transformIgnorePatterns: [
    'node_modules/(?!(nanoid)/)'
  ],
  testMatch: [
    '<rootDir>/src/**/__tests__/**/*.[jt]s?(x)',
    '<rootDir>/example/src/**/?(*.)+(spec|test).[jt]s?(x)'
  ]
};