//const webpack = require('webpack');
//const SWPrecacheWebpackPlugin = require('sw-precache-webpack-plugin');
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
		runtimeCaching: [{
			urlPattern: /^https:\/\/shintorg48.ru\/mpreorders\/api\/backend/,
			handler: 'cacheFirst'
		}]
	};

	let cfg = preactCliSwPrecachePlugin(config, precacheConfig);

	//cfg.plugins.push(new webpack.DefinePlugin({'process.env.ADD_SW': true}));
	//cfg.plugins.push(new DotenvPlugin({sample: './.env.default', path: './.env'}));
	//helpers.getPluginsByName(cfg, 'DefinePlugin')

	//cfg.plugins.push(new SWPrecacheWebpackPlugin({
	//		filename: 'sw.js',
	//		navigateFallback: 'index.html',
	//		navigateFallbackWhitelist: [/^(?!\/__).*/],
	//		minify: false,
	//		staticFileGlobsIgnorePatterns: [/polyfills(\..*)?\.js$/, /\.map$/, /push-manifest\.json$/, /.DS_Store/]
	//	}));
	//cfg.plugins.push(new webpack.DefinePlugin({
	//		'process.env.ADD_SW': true
	//	}));

	//console.log('--------------------------------------------------------------------------------');
	//console.log(cfg);
	//console.log('--------------------------------------------------------------------------------');

	return cfg;
}
