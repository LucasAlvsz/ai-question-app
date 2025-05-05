module.exports = {
  testEnvironment: "node",
  roots: ["<rootDir>/infra", "<rootDir>/app"],
  testMatch: ["**/?(*.)+(spec|test).ts"],
  transform: {
    "^.+\\.tsx?$": "ts-jest",
  },
  moduleFileExtensions: ["ts", "js", "json"],
  moduleNameMapper: {
    "^@/(.*)$": "<rootDir>/app/$1",
    "^~/(.*)$": "<rootDir>/app/$1",
  },
};
