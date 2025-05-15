import webpack, { Configuration, DefinePlugin } from "webpack";
import path from "path";
import HtmlWebpackPlugin from "html-webpack-plugin";
import MiniCssExtractPlugin from "mini-css-extract-plugin";
import ForkTsCheckerWebpackPlugin from "fork-ts-checker-webpack-plugin";
import CopyPlugin from "copy-webpack-plugin";
import { BundleAnalyzerPlugin } from "webpack-bundle-analyzer";
// types
import { BuildOptions } from "./types/types";
import dotenv from "dotenv";

export function buildPlugins({
  mode,
  paths,
  analyzer,
}: BuildOptions): Configuration["plugins"] {
  const isDev = mode === "development";
  const isProd = mode === "production";

  const env = dotenv.config().parsed || {};
  const envKeys = Object.entries(env).reduce((acc, [key, value]) => {
    acc[`process.env.${key}`] = JSON.stringify(value);
    return acc;
  }, {} as Record<string, string>);

  const plugins: Configuration["plugins"] = [
    new HtmlWebpackPlugin({
      template: paths.html,
      favicon: path.resolve(paths.public, "favicon.ico"),
    }),
    new webpack.DefinePlugin(envKeys),
  ];

  // if (isDev) {
  //   plugins.push(new ForkTsCheckerWebpackPlugin());
  // }

  if (isProd) {
    plugins.push(
      new MiniCssExtractPlugin({
        filename: "css/[name].[contenthash:8].css",
        chunkFilename: "css/[name].[contenthash:8].css",
      })
    );

    // CopyPlugin

    // plugins.push(
    //   new CopyPlugin({
    //     patterns: [
    //       {
    //         from: path.resolve(paths.public, "locales"),
    //         to: path.resolve(paths.output, "locales"),
    //       },
    //     ],
    //   })
    // );

    if (analyzer) {
      plugins.push(new BundleAnalyzerPlugin());
    }
  }
    console.log("ENV keys passed to DefinePlugin:", envKeys);
  return plugins;
}
