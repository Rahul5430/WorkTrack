import { AppError } from './AppError';

/**
 * Error thrown when validation fails
 */
export class ValidationError extends AppError {
	public readonly field?: string;
	public readonly value?: unknown;

	constructor(
		message: string,
		field?: string,
		value?: unknown,
		context?: Record<string, unknown>
	) {
		super(message, 'VALIDATION_ERROR', 400, {
			field,
			value,
			...context,
		});

		this.field = field;
		this.value = value;
	}

	/**
	 * Create a validation error for a specific field
	 */
	static forField(
		field: string,
		message: string,
		value?: unknown,
		context?: Record<string, unknown>
	): ValidationError {
		return new ValidationError(
			`${field}: ${message}`,
			field,
			value,
			context
		);
	}

	/**
	 * Create a validation error for a required field
	 */
	static required(
		field: string,
		context?: Record<string, unknown>
	): ValidationError {
		return new ValidationError(
			`${field} is required`,
			field,
			undefined,
			context
		);
	}

	/**
	 * Create a validation error for an invalid format
	 */
	static invalidFormat(
		field: string,
		expectedFormat: string,
		value?: unknown,
		context?: Record<string, unknown>
	): ValidationError {
		return new ValidationError(
			`${field} must be in format: ${expectedFormat}`,
			field,
			value,
			context
		);
	}

	/**
	 * Create a validation error for a value that's too long
	 */
	static tooLong(
		field: string,
		maxLength: number,
		actualLength: number,
		context?: Record<string, unknown>
	): ValidationError {
		return new ValidationError(
			`${field} must be no more than ${maxLength} characters (got ${actualLength})`,
			field,
			undefined,
			context
		);
	}

	/**
	 * Create a validation error for a value that's too short
	 */
	static tooShort(
		field: string,
		minLength: number,
		actualLength: number,
		context?: Record<string, unknown>
	): ValidationError {
		return new ValidationError(
			`${field} must be at least ${minLength} characters (got ${actualLength})`,
			field,
			undefined,
			context
		);
	}
}
