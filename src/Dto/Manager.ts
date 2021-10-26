import {Mapper} from "./Mapper";
import {Serialization} from "./Serialization";
import type {Configuration} from "./Types";


class Manager {

	public configuration: Configuration = {
		autoLoadDtos  : false,
		useValidation : true,
		validation : {
			always : true,
		}
	};

	initiate(configuration?: Configuration) {
		if (configuration) {
			Object.keys(configuration).forEach(key => {
				if (configuration[key] !== undefined) {
					this.configuration[key] = configuration[key];
				}
			});
		}

//		if (this.configuration.autoLoadDtos) {
//			Loader.loadDataTransferObjects();

//			for (let mappingsKey in Loader.mappings) {
//				Mapper.register(Loader.mappings[mappingsKey]);
//			}
//		}
	}

	serialization(): Serialization {
		return new Serialization(Mapper.mappings);
	}
}

export const DataTransferObjectManager = new Manager();
