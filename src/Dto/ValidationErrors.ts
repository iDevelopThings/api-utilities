import type {ValidationError} from "class-validator";

export class ValidationErrors extends Error {
	public validationErrors: ValidationError[]                  = [];
	public validationErrorsFormatted: { [key: string]: string } = {};

	constructor(errors: ValidationError[]) {
		super();
		this.message                   = 'Failed to validate values.';
		this.validationErrors          = errors;

		const formatter = (errors: ValidationError[]) => {
			if (errors.length === 0) {
				return null;
			}

			const formatted = {};

			errors.forEach(error => {
				const constraint = Object.values(error.constraints);

				formatted[error.property] = constraint[0] ?? null;
			});

			return formatted;
		}
		this.validationErrorsFormatted = formatter(errors);
	}

}
