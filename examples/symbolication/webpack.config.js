const path = require('path');
const webpack = require('webpack');
const TerserPlugin = require('terser-webpack-plugin');

module.exports = {
  mode: 'development',
  plugins: [new webpack.ProgressPlugin()],
  devtool: "hidden-source-map",

  module: {
    rules: [{
      test: /\.(js|jsx)$/,
      include: [path.resolve(__dirname, 'src')],
      loader: 'babel-loader'
    }]
  },

  optimization: {
    minimize: true,
    minimizer: [new TerserPlugin()],
  },

  output: {
    devtoolModuleFilenameTemplate: '[resource-path]',
    devtoolFallbackModuleFilenameTemplate: '[absolute-resource-path]'
  }
};
