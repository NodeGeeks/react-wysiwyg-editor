/** @type {import('jest').Config} */
module.exports = {
    testEnvironment: "node",
    testMatch: ["<rootDir>/**/*.test.{js,ts}"],
    transform: {
        "^.+\\.tsx?$": ["babel-jest", {
            presets: [
                ["@babel/preset-env", { targets: { node: "current" } }],
                "@babel/preset-typescript",
            ],
        }],
    },
    testTimeout: 60000,
};
