const HtmlWebpackPlugin = require("html-webpack-plugin");


const path = require("path");

module.exports = {
  mode: "development",
  entry: "./src/threejs-compass.ts",
  output: {
    filename: "threejs-compass.js",
    path: path.resolve(__dirname, "dist"),
    libraryTarget : 'commonjs2'
  },
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        use: "ts-loader",
        exclude: /node_modules/,
      },
      {
        test: /\.html$/i,
        loader: "html-loader",
      },
    ],
  },
  resolve: {
    extensions: [".tsx", ".ts", ".js"],
  },
  node: {
    global: false,
    __filename: false,
    __dirname: false,
  },
  devServer: {
    static: {
      directory: path.join(__dirname, "dist"),
    },
    compress: true,
    hot: true,
    port: 9999,
  },
  plugins: [
    // new HtmlWebpackPlugin({ template: "./src/index.html" }),
   
  ],
};
