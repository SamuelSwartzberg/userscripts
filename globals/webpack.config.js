const path = require("path");

module.exports = {
  entry: "./src/index.js",
  output: {
    filename: "main.user.js",
    path: path.resolve(__dirname, "dist"),
  },
  mode: "production",
  optimization: {
    minimize: false,
  },
};
