import {Type} from "class-transformer";
import type {DataTransferObject} from "../../../Dto";


export class LaravelPaginatedDto<T extends DataTransferObject<any>> {
	data: T[] = [];

	@Type(() => Links)
	public links?: Links = null;

	@Type(() => Meta)
	public meta?: Meta = null;
}

export class Links {
	public first?: string;
	public last?: string;
	public prev?: any;
	public next?: any;
}

export class Meta {
	public current_page?: number;
	public from?: number;
	public last_page?: number;
	public path?: string;
	public per_page?: number;
	public to?: number;
	public total?: number;
}
