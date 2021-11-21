import {IsNumber, IsString} from "class-validator";
import {DataTransferObject} from "../Dto";

export default class UserModel extends DataTransferObject<UserModel> {
	@IsNumber()
	public id: number;
	@IsString()
	public username: string;
}




