import type { SerializableRecord } from '@/shared/types/serialization';

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
		context?: SerializableRecord
	) {
		const errorContext: SerializableRecord = {
			...(context || {}),
		};

		if (field) {
			errorContext.field = field;
		}

		if (value !== undefined) {
			errorContext.value = ValidationError.serializeValue(value);
		}

		super(message, 'VALIDATION_ERROR', 400, errorContext);

		this.field = field;
		this.value = value;
	}

	private static serializeValue(
		value: unknown
	): string | number | boolean | null {
		if (value === null) return null;
		if (typeof value === 'string') return value;
		if (typeof value === 'number') return value;
		if (typeof value === 'boolean') return value;
		if (typeof value === 'object') {
			try {
				return JSON.stringify(value);
			} catch {
				return String(value);
			}
		}
		return String(value);
	}

	/**
	 * Create a validation error for a specific field
	 */
	static forField(
		field: string,
		message: string,
		value?: unknown,
		context?: SerializableRecord
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
		context?: SerializableRecord
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
		context?: SerializableRecord
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
		context?: SerializableRecord
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
		context?: SerializableRecord
	): ValidationError {
		return new ValidationError(
			`${field} must be at least ${minLength} characters (got ${actualLength})`,
			field,
			undefined,
			context
		);
	}
}
