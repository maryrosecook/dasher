module.exports = {
  entry: "./src/game.js",
  output: {
    path: __dirname,
    filename: "bundle.js"
  },

  devtool: 'source-map',

  module: {
    loaders: [
      { test: /\.css$/, loader: "style!css" }
    ]
  }
};
