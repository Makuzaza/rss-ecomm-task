import { Configuration } from "webpack";
import path from "path";
import HtmlWebpackPlugin from "html-webpack-plugin";
import MiniCssExtractPlugin from "mini-css-extract-plugin";
// import CopyPlugin from "copy-webpack-plugin";
import { BundleAnalyzerPlugin } from "webpack-bundle-analyzer";
import Dotenv from "dotenv-webpack";

// types
import { BuildOptions } from "./types/types";

export function buildPlugins({
  mode,
  paths,
  analyzer,
}: BuildOptions): Configuration["plugins"] {
  // const isDev = mode === "development";
  const isProd = mode === "production";

  const plugins: Configuration["plugins"] = [
    new HtmlWebpackPlugin({
      template: paths.html,
      favicon: path.resolve(paths.public, "favicon.ico"),
    }),
    new Dotenv({
      path: `./.env`,
    }),
  ];
  // if (isDev) {
  //   plugins.push(
  //     new Dotenv({
  //       path: `./.env`,
  //     })
  //   );
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

  return plugins;
}
