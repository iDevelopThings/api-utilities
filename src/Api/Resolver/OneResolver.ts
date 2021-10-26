import type {DataTransferObject} from "../../Dto";
import {ApiResponseResolver} from "../Response/ApiResponseResolver";


export class OneResolver<T extends DataTransferObject<any>> extends ApiResponseResolver<T, T> {

}
