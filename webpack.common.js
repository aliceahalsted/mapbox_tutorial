const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const { WebpackManifestPlugin } = require('webpack-manifest-plugin');
const CopyPlugin = require("copy-webpack-plugin");

module.exports = {
  entry: {
    index: './src/index.js',
  },
  output: {
    filename: '[name].bundle.js',
    path: path.resolve(__dirname, 'dist'),
    clean: true,
    assetModuleFilename: 'src/assets/images/[name][ext]'
  },
  plugins: [
    new HtmlWebpackPlugin({
      title: 'Mapbox Boilerplate',
     template: 'src/index.html',
    }),
    new WebpackManifestPlugin({
      fileName: 'site.webmanifest'
    }),
    new CopyPlugin({
      patterns: [
        { from: "src/data", to: "data" },
      ],
    }),
  ],
  module: {
    rules: [
        {
            test: /\.css$/i,
            use: ['style-loader', 'css-loader']
        }, 
        {
            test: /\.(png|svg|jpg|jpeg|gif)$/i,
            type: 'asset/resource',
          },
    ]
  }
};