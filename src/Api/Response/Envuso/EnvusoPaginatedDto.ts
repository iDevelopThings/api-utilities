import {Type} from "class-transformer";
import type {DataTransferObject} from "../../../Dto";


export class EnvusoPaginatedDto<T extends DataTransferObject<any>> {
	data: T[] = [];

	@Type(() => Pagination)
	public pagination?: Pagination = null;
}

export class Pagination {
	public after?: string|null;
	public before?: string|null;
	public hasNext?: boolean;
	public hasPrevious?: boolean;
	public limit?: number;
	public total?: number;
}
