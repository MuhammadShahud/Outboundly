const { defineConfig } = require('@vue/cli-service')
const CopyWebpackPlugin = require('copy-webpack-plugin');

module.exports = defineConfig({
	transpileDependencies: true,
	publicPath: '',
	chainWebpack: config => {
		config.plugin('html').tap(args => {
		  args[0].title = process.env.VUE_APP_TITLE + " Extension"; // Change the title here
		  return args;
		});
	},
	configureWebpack: {
		devtool: 'source-map',
		plugins: [
			// Add the copy-webpack-plugin configuration here
			new CopyWebpackPlugin({
				patterns: [
					{
						from: `src/assets/manifest.${process.env.VUE_APP_CONFIG_NAME}.json`,
						to: 'manifest.json',
					},
					{
						from: `src/assets/${process.env.VUE_APP_LOGO_URL}`,
						to: 'img/[name][ext]',
					},
					{
						from: `src/assets/${process.env.VUE_APP_LOGO_SM_URL}`,
						to: '128[ext]',
					},
					{
						from: `src/assets/onboarding.${process.env.VUE_APP_CONFIG_NAME}.html`,
						to: 'onboarding.html',
					},
				],
			}),
		],
	},

})