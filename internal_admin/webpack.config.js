var webpack = require('webpack');
var path = require('path');
var ROOT_PATH = path.resolve(__dirname);

module.exports = {  
  entry: [
    path.resolve(ROOT_PATH, 'app/src/index'),
  ],
  module: {
    loaders: [
      {
        test: /\.jsx?$/,
        exclude: /node_modules/,
        loader: ['babel'],
        query: {
          presets: ['es2015', 'react']
        }
      },
      {
        test: /\.scss$/,
        loaders: ['style', 'css', 'sass']
      },
      { 
        test: /\.(png|jpg)$/, 
        loader: 'url-loader?limit=20000',
        include: path.resolve(ROOT_PATH, 'app/styles/assets') 
      },
      {
        test: /\.json$/,
        loaders: ['json']
      }
    ]
  },
  resolve: {
    extensions: ['', '.js', '.jsx']
  },
  output: {
    path: path.resolve(ROOT_PATH, 'app/build'),
    publicPath: '/',
    filename: 'bundle.js'
  },
  devServer: {
    contentBase: path.resolve(ROOT_PATH, 'app/build'),
    historyApiFallback: true,
    hot: true,
    inline: true,
    progress: true,
    host: require('dsp_shared/conf.d/config').admin.host,
    port: require('dsp_shared/conf.d/config').admin.web_port
  },
  plugins: [
    new webpack.HotModuleReplacementPlugin()
  ]
}; 