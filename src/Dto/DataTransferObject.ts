import {plainToInstance} from "class-transformer";
import {validateSync} from 'class-validator';
import type {ValidatorOptions} from "class-validator/types/validation/ValidatorOptions";
import {ValidationErrors} from "./ValidationErrors";
import {Validator} from "./Validator";

export class DataTransferObject<T extends DataTransferObject<any>> /*implements DataTransferObjectContract<T>*/ {

	public validator: Validator<T> = new Validator();

	public static validateOnCreate: boolean = false;

	public static create<M extends DataTransferObject<any>, Value = object | object[]>(
		this: new () => M,
		data: Value,
		validate: boolean = true
	): (Value extends object[] ? M[] : M) {

		const dto = plainToInstance<M, Value>(this, data, {}) as (Value extends object[] ? M[] : M);

		if (DataTransferObject.validateOnCreate && validate) {
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

}
