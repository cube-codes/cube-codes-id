import noderesolve from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';

export default [{
	input: 'dist/package/app/src/index.rollup.js',
	output: {
		name: 'CCI',
		file: 'dist/browser/browser.js',
		format: 'iife',
		sourcemap: 'inline'
	},
	plugins: [
		noderesolve({
			browser: true
		}),
		commonjs()
	],
}];