export type AppErrorKind = 'unknown' | 'validation' | 'firebase' | 'sync';

export interface AppErrorMetadata {
	code?: string;
	cause?: unknown;
	details?: Record<string, unknown>;
	retryable?: boolean;
	originalError?: unknown;
}

export class AppError extends Error {
	public readonly kind: AppErrorKind;
	public readonly code?: string;
	public readonly cause?: unknown;
	public readonly details?: Record<string, unknown>;
	public readonly retryable: boolean;

	constructor(
		kind: AppErrorKind,
		message: string,
		metadata: AppErrorMetadata = {}
	) {
		super(message);
		this.name = 'AppError';
		this.kind = kind;
		this.code = metadata.code;
		this.cause = metadata.cause;
		this.details = metadata.details;
		this.retryable = metadata.retryable ?? false;
	}
}

export class ValidationError extends AppError {
	constructor(message: string, metadata: AppErrorMetadata = {}) {
		super('validation', message, {
			...metadata,
			retryable: metadata.retryable ?? false,
		});
		this.name = 'ValidationError';
	}
}

export class FirebaseAppError extends AppError {
	constructor(message: string, metadata: AppErrorMetadata = {}) {
		super('firebase', message, {
			...metadata,
			retryable: metadata.retryable ?? true,
		});
		this.name = 'FirebaseAppError';
	}
}

export class SyncError extends AppError {
	constructor(message: string, metadata: AppErrorMetadata = {}) {
		super('sync', message, {
			...metadata,
			retryable: metadata.retryable ?? true,
		});
		this.name = 'SyncError';
	}
}

export function isAppError(error: unknown): error is AppError {
	return error instanceof AppError;
}

export function wrapUnknownError(
	error: unknown,
	fallbackMessage = 'Unknown error occurred'
): AppError {
	if (error instanceof AppError) {
		return error;
	}
	if (error instanceof Error) {
		return new AppError('unknown', error.message, { cause: error });
	}
	return new AppError('unknown', fallbackMessage, {
		details: { value: String(error) },
	});
}

export type { AppErrorMetadata as ErrorMetadata };
