import {DataTransferObject, dto} from "../Dto";

@dto(UserModel)
export default class UserModel extends DataTransferObject<UserModel> {
	public id: number;
	public username: string;
}




