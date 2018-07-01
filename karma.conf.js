const webpackConfig = require("./webpack.config");

module.exports = config => {
  config.set({
    frameworks: ["mocha", "chai", "sinon"],

    files: [
      {
        pattern: "src/**/*.ts",
        watched: false,
        included: true,
        served: true
      },
      {
        pattern: "src/**/*.tsx",
        watched: false,
        included: true,
        served: true
      }
    ],
    preprocessors: {
      "src/**/*.ts": ["webpack", "sourcemap"],
      "src/**/*.tsx": ["webpack", "sourcemap"]
    },

    // Ignore the npm package entry point
    exclude: ["src/index.ts"],

    // karma-webpack doesn't change the file extensions so we just need to tell karma what these extensions mean.
    mime: {
      "text/x-typescript": ["ts", "tsx"]
    },

    webpack: webpackConfig,

    webpackMiddleware: {
      stats: "errors-only",
      bail: true
    },

    browsers: ["Chrome", "Firefox"],

    reporters: ["progress", "coverage-istanbul"],
    coverageIstanbulReporter: {
      reports: ["json", "html"],
      fixWebpackSourcePaths: true
    }
  });
};
