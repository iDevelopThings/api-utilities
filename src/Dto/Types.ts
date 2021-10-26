import type {ValidatorOptions} from "class-validator/types/validation/ValidatorOptions";

export type Mappings = {
	[key: string]: any;
}

export type ReturnType<T, V> = (V extends any[] ? T[] : T);

export type MappedValue = {
	type: keyof Mappings;
	value: Mappings[keyof Mappings] | any
}

export type DtoLoaded = {
	module: Function;
	importPath: string;
	name: string;
	nameWithoutExtension: string;
	path: string;
}

export type Configuration = {
	autoLoadDtos: boolean;
	useValidation: boolean;
	validation?: ValidatorOptions;
}
