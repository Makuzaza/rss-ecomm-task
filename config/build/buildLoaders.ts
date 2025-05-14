import { ModuleOptions } from "webpack";
import MiniCssExtractPlugin from "mini-css-extract-plugin";
import { BuildOptions } from "./types/types";

export function buildLoaders(options: BuildOptions): ModuleOptions["rules"] {
  const isDev = options.mode === "development";

  const assetLoader = {
    test: /\.(png|jpg|jpeg|gif)$/i,
    type: "asset/resource",
  };

  const svgrLoader = {
    test: /\.svg$/i,
    use: [
      {
        loader: "@svgr/webpack",
        options: {
          icon: true,
          svgoConfig: {
            plugins: [
              {
                name: "convertColors",
                params: {
                  currentColor: true,
                },
              },
            ],
          },
        },
      },
    ],
  };

  const cssLoaderWithModules = {
    loader: "css-loader",
    options: {
      modules: {
        localIdentName: isDev ? "[path][name]__[local]" : "[hash:base64:8]",
      },
    },
  };

    // Regular CSS loader (for normal CSS files)
    const cssLoader = {
      test: /\.css$/i,
      use: [
        isDev ? "style-loader" : MiniCssExtractPlugin.loader,
        "css-loader"
      ],
    };

  const scssLoader = {
    test: /\.s[ac]ss$/i,
    use: [
      // Creates `style` nodes from JS strings
      isDev ? "style-loader" : MiniCssExtractPlugin.loader,
      // Translates CSS into CommonJS
      cssLoaderWithModules,
      // Compiles Sass to CSS
      "sass-loader",
    ],
  };

  // const scssModulesLoader = {
  //   test: /\.module\.s[ac]ss$/i,
  //   use: [
  //     isDev ? "style-loader" : MiniCssExtractPlugin.loader,
  //     {
  //       loader: "css-loader",
  //       options: {
  //         modules: {
  //           localIdentName: isDev ? "[path][name]__[local]" : "[hash:base64:8]",
  //         },
  //       },
  //     },
  //     "sass-loader",
  //   ],
  // };

  // const scssLoader = {
  //   test: /\.s[ac]ss$/i,
  //   exclude: /\.module\.s[ac]ss$/i, // exclude CSS modules
  //   use: [
  //     isDev ? "style-loader" : MiniCssExtractPlugin.loader,
  //     "css-loader", // <== NO modules here
  //     "sass-loader",
  //   ],
  // };

  const tsLoader = {
    test: /\.tsx?$/,
    exclude: /node_modules/,
    use: [
      {
        loader: "ts-loader",
        options: {
          transpileOnly: true,
        },
      },
    ],
  };

  return [assetLoader, cssLoader, scssLoader, tsLoader, svgrLoader];
}
