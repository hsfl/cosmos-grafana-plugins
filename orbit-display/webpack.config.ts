// const path = require('path');
const webpack = require('webpack');
// const cesiumSource = '../node_modules/cesium/Source';
// const cesiumWorkers = '../Build/Cesium/Workers/';
const HtmlPlugin = require("html-webpack-plugin");
const HtmlTagsPlugin = require("html-webpack-tags-plugin");
const CopyWebpackPlugin = require('copy-webpack-plugin');

import path from 'path';
import type { Configuration } from 'webpack';
import { merge } from 'webpack-merge';
import grafanaConfig from './.config/webpack/webpack.config';

const config = async (env): Promise<Configuration> => {
    const baseConfig = await grafanaConfig(env);
  
    return merge(baseConfig, {
      // Add custom config here...
      module: {
        rules: [
          {
            exclude: /(node_modules)/,
            test: /\.css$/,
            use: ["style-loader", "css-loader"],
          },
        ],
      },
      // Note: these are required in webpack 5 and excludes certain polyfills
      resolve: {
        fallback: {
          util: false,
          tty: false,
          stream: false,
          http: false,
          https: false,
          url: false,
          zlib: false,
        }
      },
      plugins: [
        // Copy Cesium Assets, Widgets, and Workers to a static directory
        new CopyWebpackPlugin({
          patterns: [
            {
              from: path.resolve(__dirname, "node_modules/cesium/Build/Cesium"),
              to: "cesium",
            },
          ],
        }),
        new webpack.DefinePlugin({
          // Define relative base path in cesium for loading assets
          CESIUM_BASE_URL: JSON.stringify('/public/plugins/hsfl-orbit-display/cesium')
        }),
      ],
    });
  };
  
  export default config;
