import type {DataTransferObject} from "../../Dto";
import {ApiResponseResolver} from "../Response/ApiResponseResolver";

export class ManyResolver<T extends DataTransferObject<any>> extends ApiResponseResolver<T, T[]>{



}
