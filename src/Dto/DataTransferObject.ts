import {plainToClass} from "class-transformer";
import {validateSync} from 'class-validator';
import {Http} from "../Api/Http";
import {DataTransferObjectManager} from "./Manager";
import {ValidationErrors} from "./ValidationErrors";

//interface DataTransferObjectContract<M> {
//	validate(groups?: string[] | null): void;
//}

//interface DataTransferObjectContractConstructor<T> {
//	new(...args: any[]): DataTransferObjectContract<T>;
//
//	create<M extends DataTransferObjectContract<M>, Value = object | object[]>(
//		this: DataTransferObjectContractConstructor<M>,
//		data: Value,
//		validate?: boolean
//	): (Value extends object[] ? M[] : M);
//}

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

//	public static async getMany<M extends DataTransferObjectContract<M>, Value = object | object[]>(
//		this: DataTransferObjectContractConstructor<M>,
//		endpoint: string,
//		data: object = {}
//	): Promise<M[]> {
//		const res = await Http.many('GET', endpoint, data);
//
//		return this.create(res);
//	}

}
