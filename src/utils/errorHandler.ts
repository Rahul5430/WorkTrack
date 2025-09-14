import { SyncError, ValidationError } from '../errors';
import { logger } from '../logging';

/**
 * Common error handling utility for use cases
 */
export class ErrorHandler {
	/**
	 * Wraps async operations with consistent error handling
	 */
	static async wrapAsync<T>(
		operation: () => Promise<T>,
		errorMessage: string,
		errorCode: string,
		ErrorClass: typeof SyncError = SyncError
	): Promise<T> {
		try {
			return await operation();
		} catch (error) {
			logger.error(errorMessage, { error });
			throw new ErrorClass(errorMessage, {
				code: errorCode,
				originalError: error,
			});
		}
	}

	/**
	 * Validates required fields
	 */
	static validateRequired(
		value: unknown,
		fieldName: string,
		context?: Record<string, unknown>
	): void {
		if (!value || (typeof value === 'string' && value.trim() === '')) {
			throw new ValidationError(`Missing required field: ${fieldName}`, {
				code: 'validation.required',
				details: context,
			});
		}
	}

	/**
	 * Validates email format
	 */
	static validateEmail(email: string): void {
		const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
		if (!emailRegex.test(email)) {
			throw new ValidationError('Invalid email format', {
				code: 'validation.invalid_email',
				details: { email },
			});
		}
	}

	/**
	 * Validates user authentication
	 */
	static validateUser(
		user: unknown
	): asserts user is { id: string; email?: string } {
		if (!user || typeof user !== 'object' || !('id' in user)) {
			throw new ValidationError('User not authenticated', {
				code: 'auth.unauthenticated',
			});
		}
	}
}
