import type {DtoProperty, Magic} from "../index";
import type {DataTransferObject} from "./DataTransferObject";

export class DtoUtilities {
	public static getProperties<D extends DataTransferObject<any>>(dto: D): DtoProperty<D>[] {
		return Object.getOwnPropertyNames(dto) as DtoProperty<D>[];
	}

	/**
	 * Get the default dto values
	 *
	 * @returns {Magic<T>}
	 */
	public static getDefaultValues<D extends DataTransferObject<any>>(dto: D): Magic<D> {
		const properties = this.getProperties(dto);
		const newClass   = new ((this as any).constructor)();

		const newDefaults: any = {};

		for (let property of properties) {
			const value = newClass[property];

			if (typeof value === "function") {
				continue;
			}

			newDefaults[property] = value;
		}

		return newDefaults;
	}
}
