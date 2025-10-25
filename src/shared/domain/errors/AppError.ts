/**
 * Base error class for all application errors
 * Provides common error handling functionality
 */
export abstract class AppError extends Error {
	public readonly code: string;
	public readonly statusCode: number;
	public readonly timestamp: Date;
	public readonly context?: Record<string, unknown>;

	constructor(
		message: string,
		code: string,
		statusCode: number = 500,
		context?: Record<string, unknown>
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
	toJSON(): Record<string, unknown> {
		return {
			name: this.name,
			message: this.message,
			code: this.code,
			statusCode: this.statusCode,
			timestamp: this.timestamp.toISOString(),
			context: this.context,
			stack: this.stack,
		};
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
	withContext(additionalContext: Record<string, unknown>): this {
		const newContext = {
			...this.context,
			...additionalContext,
		};

		const constructor = this.constructor as new (
			message: string,
			code: string,
			statusCode: number,
			context?: Record<string, unknown>
		) => this;

		return new constructor(
			this.message,
			this.code,
			this.statusCode,
			newContext
		);
	}
}
