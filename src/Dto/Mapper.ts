import type {ClassConstructor} from "class-transformer";
import type {Mappings} from "./Types";

export class Mapper {

	public static mappings: Mappings = {
		'Number'  : Number,
		'Boolean' : Boolean,
		'String'  : String,
	};

	/**
	 * Register a new class in the mappings
	 *
	 * @param {ClassConstructor<any>} classConstructor
	 */
	public static register(classConstructor: ClassConstructor<any>) {
		if (this.exists(classConstructor)) {
			return;
		}
		this.mappings[classConstructor.name] = classConstructor;
	}

	/**
	 * Check if a mapping exists for this type, can either use mapping key or class constructor
	 *
	 * @param {string | ClassConstructor<any>} value
	 * @returns {boolean}
	 */
	public static exists(value: string | ClassConstructor<any>): boolean {
		if (typeof value === 'string') {
			return this.existsViaName(value);
		}
		if (typeof value === 'function') {
			return this.existsViaConstructor(value);
		}

		return false;
	}

	/**
	 * Check if a mapping exists for this constructor
	 *
	 * @param {ClassConstructor<any>} classConstructor
	 * @returns {boolean}
	 */
	public static existsViaConstructor(classConstructor: ClassConstructor<any>): boolean {
		return this.mappings[classConstructor?.name] !== undefined;
	}

	/**
	 * Check if a mapping exists for the name
	 *
	 * @param {string} name
	 * @returns {boolean}
	 */
	public static existsViaName(name: string): boolean {
		return this.mappings[name] !== undefined;
	}

	/**
	 * Extend mappings with an object of additional mappings
	 * It will only add a new mapping if it doesn't exist already
	 *
	 * @param {Mappings} mappings
	 */
	public static extend(mappings: Mappings) {
		for (let mappingsKey in mappings) {
			if (this.exists(mappings[mappingsKey])) {
				continue;
			}
			this.mappings[mappingsKey] = mappings[mappingsKey];
		}
	}

}
