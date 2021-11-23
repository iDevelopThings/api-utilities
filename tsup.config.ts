import {defineConfig} from 'tsup';

export default defineConfig({
	splitting   : false,
	sourcemap   : true,
	clean       : true,
	tsconfig    : 'tsconfig.json',
	entryPoints : ['src/index.ts'],
	dts         : {
		entry : 'src/index.ts'
	}
});
