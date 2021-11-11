import {plainToClass} from "class-transformer";
import {validateSync} from 'class-validator';
import {DataTransferObjectManager} from "./Manager";
import {ValidationErrors} from "./ValidationErrors";

export class DataTransferObject<T> /*implements DataTransferObjectContract<T>*/ {

	public static create<M extends DataTransferObject<any>, Value = object | object[]>(
		this: new () => M,
		data: Value,
		validate: boolean = true
	): (Value extends object[] ? M[] : M) {

		const dto = plainToClass<M, Value>(this, data) as (Value extends object[] ? M[] : M);

		if (DataTransferObjectManager.configuration.useValidation && validate) {
			if (Array.isArray(dto)) {
				dto.forEach((d) => d.validate());
			} else {
				dto.validate();
			}
		}

		return dto;
	}

	public validate(groups: string[] | null = null) {
		const validationErrors = validateSync(this, {
			...DataTransferObjectManager.configuration.validation,
			groups : groups ? groups : undefined,
		});

		if (validationErrors.length) {
			throw new ValidationErrors(validationErrors);
		}
	}

}
