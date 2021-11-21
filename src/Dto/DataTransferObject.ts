import {plainToInstance} from "class-transformer";
import {validateSync} from 'class-validator';
import type {ValidatorOptions} from "class-validator/types/validation/ValidatorOptions";
import type {DtoProperty, Magic} from "../index";
import {ValidationErrors} from "./ValidationErrors";

export class DataTransferObject<T> /*implements DataTransferObjectContract<T>*/ {

	public static useDtoValidation: boolean = false;

	public static create<M extends DataTransferObject<any>, Value = object | object[]>(
		this: new () => M,
		data: Value,
		validate: boolean = true
	): (Value extends object[] ? M[] : M) {

		const dto = plainToInstance<M, Value>(this, data) as (Value extends object[] ? M[] : M);

		if (DataTransferObject.useDtoValidation && validate) {
			if (Array.isArray(dto)) {
				dto.forEach((d) => d.validate());
			} else {
				//@ts-ignore
				dto.validate();
			}
		}

		return dto;
	}

	/**
	 * Run the class validator validations on the DTO
	 *
	 * @param {string[] | null} groups
	 * @param {ValidatorOptions} classValidatorOptions
	 */
	public validate(groups: string[] | null = null, classValidatorOptions: ValidatorOptions = {}): boolean {
		const validatorOptions: ValidatorOptions = {
			...{groups : groups ? groups : undefined},
			...classValidatorOptions
		};

		const validationErrors = validateSync(this, validatorOptions);

		if (validationErrors.length) {
			throw new ValidationErrors(validationErrors);
		}

		return validationErrors.length === 0;
	}

	/**
	 * Get the property keys defined on this dto
	 *
	 * @returns {DtoProperty<T>[]}
	 */
	public getProperties(): DtoProperty<T>[] {
		return Object.getOwnPropertyNames(this) as DtoProperty<T>[];
	}

	/**
	 * Get the default dto values
	 *
	 * @returns {Magic<T>}
	 */
	public getDefaultValues(): Magic<T> {
		const properties = this.getProperties();
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
