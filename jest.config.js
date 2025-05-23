/** @type {import('ts-jest').JestConfigWithTsJest} **/
module.exports = {
  // testEnvironment: "node",
  // transform: {
  //   "^.+\.tsx?$": ["ts-jest", {}],
  // },
  preset: "ts-jest",
  testEnvironment: "jsdom",
  setupFilesAfterEnv: ["<rootDir>/jest.setup.js"],
  setupFiles: ["<rootDir>/jest.polyfills.js"], // Add this line
  moduleNameMapper: {
    "^@/(.*)$": "<rootDir>/src/$1",
    "\\.(css|less|scss|sass)$": "<rootDir>/__mocks__/styleMock.js",
    "\\.(jpg|jpeg|png|gif|webp|svg)$": "<rootDir>/__mocks__/fileMock.js",
  },
};
