const webpack = require('webpack');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const SWPrecacheWebpackPlugin = require('sw-precache-webpack-plugin');
const preactCliSwPrecachePlugin = require('preact-cli-sw-precache');
//const DotenvPlugin = require('webpack-dotenv-plugin');

/**
 * Function that mutates original webpack config.
 * Supports asynchronous changes when promise is returned.
 *
 * @param {object} config - original webpack config.
 * @param {object} env - options passed to CLI.
 * @param {WebpackConfigHelpers} helpers - object with useful helpers when working with config.
 **/
export default function (config, env, helpers) {
	//try {
	//	throw new Error('');
	//}
	//catch( e ) {
	//	console.log(e.message + "\n" + e.stack);
	//}
	//if( typeof(process) !== 'undefined' ) {
	//	console.log(process.env.ADD_SW);
	//}

	const precacheConfig = {
		verbose: true,
		maximumFileSizeToCacheInBytes: 8 * 1024 * 1024,
		runtimeCaching: [{
			urlPattern: /^https:\/\/shintorg48.ru\/mpreorders\/api\/backend/,
			handler: 'fastest',
			options: {
				debug: true,
				cache: {
					maxEntries: 1000000,
					maxAgeSeconds: 86400 * 7,
					networkTimeoutSeconds: 30,
					name: 'backend-cache'
				}
			}
		}]
	};

	let cfg = preactCliSwPrecachePlugin(config, precacheConfig);

	let plugin = cfg.plugins.find(v => v.constructor === SWPrecacheWebpackPlugin);

	if (plugin)
		plugin.options.minify = false;

	// plugin = cfg.plugins.find(v => v.constructor === HtmlWebpackPlugin);
	// if (plugin)
	// 	plugin.options.minify = false;
			
	// plugin = cfg.plugins.find(v => v.constructor === webpack.DefinePlugin);
	// if (plugin)
	// 	console.log(plugin.definitions['process.env.NODE_ENV']);

	//console.log('--------------------------------------------------------------------------------');
	// cfg.plugins.forEach(v => console.log(v.constructor));
	// console.log(cfg.plugins.find(v => v.constructor === HtmlWebpackPlugin));
	//cfg.plugins.forEach(v => console.log(v));
	//console.log('--------------------------------------------------------------------------------');

	return cfg;
}
