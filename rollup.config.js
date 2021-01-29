import noderesolve from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';

export default [{
	input: 'dist/package/index.js',
	output: {
		name: 'CCI',
		file: 'dist/browser/cube-codes-ide.js',
		format: 'iife',
		sourcemap: 'inline'
	},
	onwarn: function(warning) {
		if(warning.code === 'THIS_IS_UNDEFINED') return;
	},
	plugins: [
		noderesolve({
			browser: true
		}),
		commonjs()
	],
}];