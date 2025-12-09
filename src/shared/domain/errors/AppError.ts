import type { SerializableRecord } from '@/shared/types/serialization';

/**
 * Base error class for all application errors
 * Provides common error handling functionality
 */
export abstract class AppError extends Error {
	public readonly code: string;
	public readonly statusCode: number;
	public readonly timestamp: Date;
	public readonly context?: SerializableRecord;

	constructor(
		message: string,
		code: string,
		statusCode: number = 500,
		context?: SerializableRecord
	) {
		super(message);

		this.name = this.constructor.name;
		this.code = code;
		this.statusCode = statusCode;
		this.timestamp = new Date();
		this.context = context;

		// Ensure proper prototype chain for instanceof checks
		Object.setPrototypeOf(this, new.target.prototype);
	}

	/**
	 * Convert the error to a plain object for serialization
	 */
	toJSON(): SerializableRecord {
		const result: SerializableRecord = {
			name: this.name,
			message: this.message,
			code: this.code,
			statusCode: this.statusCode,
			timestamp: this.timestamp.toISOString(),
		};

		if (this.stack) {
			result.stack = this.stack;
		}

		if (this.context) {
			Object.assign(result, this.context);
		}

		return result;
	}

	/**
	 * Get a user-friendly error message
	 */
	getUserMessage(): string {
		return this.message;
	}

	/**
	 * Check if this error is of a specific type
	 */
	isType<T extends AppError>(
		errorType: new (...args: unknown[]) => T
	): this is T {
		return this instanceof errorType;
	}

	/**
	 * Create a copy of this error with additional context
	 */
	withContext(additionalContext: SerializableRecord): this {
		const newContext = {
			...this.context,
			...additionalContext,
		};

		const constructor = this.constructor as new (
			message: string,
			code: string,
			statusCode: number,
			context?: SerializableRecord
		) => this;

		return new constructor(
			this.message,
			this.code,
			this.statusCode,
			newContext
		);
	}
}
