module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  bail: true,   // stop after 1 failed test
  modulePaths: [
    ".",
  ],
  moduleDirectories: [
    "node_modules"
  ],
};