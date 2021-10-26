import {plainToClass} from "class-transformer";
import {isString} from "class-validator";
import type {MappedValue, Mappings, ReturnType} from "./Types";

export class Serialization {

	constructor(public mappings: Mappings) { }

	/**
	 * Try to find the correct type for our value from the mapping
	 *
	 * @param value
	 * @returns {string}
	 */
	public getType(value: any): string {

		if (Array.isArray(value)) {
			const firstItem = value[0] ?? null;

			if (!firstItem) {
				return null;
			}

			return `array:${this.getType(value[0])}`;
		}

		if (!value?.constructor) {
			return null;
		}

		for (let mappingsKey in this.mappings) {
			if (this.mappings[mappingsKey] === value?.constructor) {
				return mappingsKey;
			}
		}

		const constructorName = this.mappings[value?.constructor?.name] ?? undefined;
		if (constructorName) {
			return value?.constructor?.name;
		}

		return null;
	}

	/**
	 * Try to convert our value to a mapping type from our mappings
	 *
	 * @param {string} mappingType
	 * @param {V} value
	 * @returns {ReturnType<T, V>}
	 */
	public convertType<T, V extends MappedValue>(mappingType: string, value: V): ReturnType<T, V> {

		if (value?.type && value?.value) {
			return this.convertType<T, V>(value.type as string, value.value);
		}

		if (mappingType === null) {
			return value as unknown as ReturnType<T, V>;
		}

		if (mappingType.startsWith('array:')) {
			mappingType = mappingType.replace('array:', '');
		}

		const mapping = this.mappings[mappingType] ?? undefined;

		if (Array.isArray(value) && mapping) {
			if (mapping?.create) {
				return mapping.create(value);
			}
			return plainToClass<T, any[]>(mapping, value) as ReturnType<T, V>;
		}

		if (mapping) {
			if (mapping?.create) {
				return mapping.create(value);
			}
			return plainToClass<T, any>(mapping, value) as ReturnType<T, V>;
		}

		return value as unknown as ReturnType<T, V>;
	}

	/**
	 * Serialize our object to json, will store it in a format of {value: {object}, type: ObjectType}
	 * @param {T} data
	 * @returns {string}
	 */
	public serialize<T>(data: T): string {
		let values = {};

		if (Array.isArray(data)) {
			let arrValues = [];

			for (let datum of data) {
				arrValues.push(this.serialize<T>(datum));
			}

			values = arrValues;
		}

		for (let key of Object.keys(data)) {
			const value = data[key];

			let valueType: any = typeof value;

			// If the value is a constructor
			// We'll first check out mappings to see if we can get a match by type
			// If we can't, we'll then check for a mapping by the constructor name
			let valType = this.getType(value);
			if (valType) {
				valueType = valType;
			}

			values[key] = {
				type  : valueType,
				value : value
			};
		}

		return JSON.stringify({
			type  : this.getType(data),
			value : values
		});
	}

	/**
	 * Deserialize our json back to it's original class/value instances
	 *
	 * @param data
	 * @returns {T}
	 */
	public deserialize<T>(data: any): T {
		if (isString(data)) {
			data = JSON.parse(data);
		}

		let value = data?.value;
		let type  = data?.type;

		if (Array.isArray(value)) {
			const values = [];
			for (let valueElement of value) {
				values.push(this.convertType(valueElement.type, valueElement.value) as T);
			}

			value = values;
		} else {
			for (let key of Object.keys(value)) {
				value[key] = this.convertType(value[key].type, value[key].value) as T;
			}
		}

		return this.convertType(type, value) as T;

		/*const predefinedMapping = this.mappings[valueType] ?? undefined;

		 if (!predefinedMapping) {
		 values[key] = value;

		 continue;
		 }

		 values[key] = plainToClass(predefinedMapping, value);

		 return values as T;*/
	}
}
