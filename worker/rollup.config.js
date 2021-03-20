import noderesolve from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';

export default [{
	input: 'dist/package/worker/src/index.rollup.js',
	output: {
		name: 'CCI',
		file: 'dist/browser/cube-codes-ide-worker.js',
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