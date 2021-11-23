import path                        from 'path';
import {defineConfig}              from 'vite';
import {default as createTsPlugin} from 'vite-plugin-ts';

module.exports = defineConfig({
	build   : {
		lib           : {
			entry    : path.resolve(__dirname, 'src/index.ts'),
			name     : 'api-utilities',
			fileName : (format) => `index.${format}.js`,
		},
		rollupOptions : {},
	},
	plugins : [
		createTsPlugin({

		}),
	],
});
