import type {ClassConstructor} from "class-transformer";
import {Mapper} from "./Mapper";

const addMapping = (target) => {
	let meta: ClassConstructor<any>[] | undefined = Reflect.getMetadata('mapping', Mapper);

	if (!meta) {
		meta = [];
	}

	meta.push(target);

	Reflect.defineMetadata('mapping', meta, Reflect);

	Mapper.register(target);
}

export function dto(dto: any): ClassDecorator {
	return function (target) {
		addMapping(target);
	};
}

export function registerMapping(dto: any): ClassDecorator {
	return function (target) {
		addMapping(target);
	};
}
