module.exports = {
  entry: "./src/game.js",
  output: {
    path: __dirname,
    filename: "index.js"
  },
  module: {
    loaders: [
      { test: /\.css$/, loader: "style!css" }
    ]
  }
};
