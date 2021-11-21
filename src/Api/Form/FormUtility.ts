export class FormUtility {

	public static objectToFormData(object, formData = new FormData(), parent = null): FormData {
		if (object === null || object === 'undefined' || object.length === 0) {
			formData.append(parent, object);

			return formData;
		}

		for (const property in object) {
			if (object.hasOwnProperty(property)) {
				this.appendToFormData(formData, this.getKey(parent, property), object[property]);
			}
		}

		return formData;
	}

	public static getKey(parent, property) {
		return parent ? parent + '[' + property + ']' : property;
	}

	public static appendToFormData(formData, key, value) {
		if (value instanceof Date) {
			return formData.append(key, value.toISOString());
		}

		if (value instanceof File) {
			return formData.append(key, value, value.name);
		}

		if (typeof value === "boolean") {
			return formData.append(key, value ? '1' : '0');
		}

		if (value === null) {
			return formData.append(key, '');
		}

		if (typeof value !== 'object') {
			return formData.append(key, value);
		}

		this.objectToFormData(value, formData, key);
	}


	public static hasFiles(object) {
		for (const property in object) {
			if (this.hasFilesDeep(this[property])) {
				return true;
			}
		}

		return false;
	};

	public static hasFilesDeep(object) {
		if (object === null) {
			return false;
		}

		if (typeof object === "object") {
			for (const key in object) {
				if (object.hasOwnProperty(key)) {
					if (this.hasFilesDeep(object[key])) {
						return true;
					}
				}
			}
		}

		if (Array.isArray(object)) {
			for (const key in object) {
				if (object.hasOwnProperty(key)) {
					return this.hasFilesDeep(object[key]);
				}
			}
		}

		return this.isFile(object);
	}
	public static isFile(object) {
		return object instanceof File || object instanceof FileList;
	}
}
