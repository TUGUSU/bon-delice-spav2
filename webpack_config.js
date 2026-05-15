const path = require("path");
const webpack = require("webpack");
require("dotenv").config({ path: path.join(__dirname, ".env") });
const HtmlWebpackPlugin = require("html-webpack-plugin");
const CopyPlugin = require("copy-webpack-plugin");

const apiBaseUrl = (process.env.API_BASE_URL || "/api").replace(/\/$/, "") || "/api";
const demoAuth =
  process.env.DEMO_AUTH === "true" || process.env.DEMO_AUTH === "1";

const apiPort = parseInt(process.env.PORT || "4000", 10);
const apiProxyTarget =
  process.env.API_PROXY_TARGET || `http://127.0.0.1:${apiPort}`;

module.exports = {
  entry: "./src/main.jsx",
  output: {
    path: path.resolve(__dirname, "dist"),
    filename: "bundle.[contenthash].js",
    clean: true,
    publicPath: "/",
  },
  resolve: {
    extensions: [".js", ".jsx"],
  },
  module: {
    rules: [
      {
        test: /\.(js|jsx)$/,
        exclude: /node_modules/,
        use: "babel-loader",
      },
      {
        test: /\.css$/,
        use: ["style-loader", "css-loader"],
      },
      {
        test: /\.(png|jpe?g|gif|svg)$/i,
        type: "asset/resource",
      },
    ],
  },
  plugins: [
    new webpack.DefinePlugin({
      "process.env.API_BASE_URL": JSON.stringify(apiBaseUrl),
      "process.env.DEMO_AUTH": JSON.stringify(demoAuth),
    }),
    new HtmlWebpackPlugin({
      template: "./public/index.html",
    }),
    new CopyPlugin({
      patterns: [
        {
          from: "public",
          to: "",
          globOptions: {
            ignore: ["**/index.html"],
          },
        },
      ],
    }),
  ],
  devServer: {
    static: {
      directory: path.join(__dirname, "public"),
    },
    port: 3000,
    open: true,
    hot: true,
    historyApiFallback: true,
    proxy: [
      {
        context: ["/api"],
        target: apiProxyTarget,
        changeOrigin: true,
      },
    ],
  },
};
