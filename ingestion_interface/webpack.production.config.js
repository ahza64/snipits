const webpack = require('webpack');
const webpack_config = require('./webpack.config');
var path = require('path');
var ROOT_PATH = path.resolve(__dirname);


webpack_config.output.path =  path.resolve(ROOT_PATH, 'app/build_prod');
webpack_config.devServer = undefined;
webpack_config.plugins = [
	new webpack.DefinePlugin({
      	    'process.env':{
            'NODE_ENV': JSON.stringify('production')
          }
        }),
        new webpack.optimize.UglifyJsPlugin({
            beautify: false,
            mangle: {
                screw_ie8: true,
                keep_fnames: true
            },
            compress: {
                screw_ie8: true
            },
            comments: false
        })
    ];
module.exports = webpack_config;
