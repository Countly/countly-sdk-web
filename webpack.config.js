const path = require("path");

module.exports = {
  entry: "./lib/countly",
  output: {
    path: path.resolve(__dirname, "./lib"),
    filename: "countly.min.js",
  },
};
