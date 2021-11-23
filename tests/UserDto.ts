import {IsBoolean, IsString, MinLength} from "class-validator";
import {DataTransferObject} from "../src";

export class UserDto extends DataTransferObject<UserDto> {
	@IsString()
	@MinLength(2)
	username: string;

	@IsBoolean()
	anotherProperty?: boolean = false;
}
