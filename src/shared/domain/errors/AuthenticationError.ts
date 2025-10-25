import { AppError } from './AppError';

/**
 * Error thrown when authentication fails
 */
export class AuthenticationError extends AppError {
	public readonly reason: string;

	constructor(
		message: string,
		reason: string = 'INVALID_CREDENTIALS',
		context?: Record<string, unknown>
	) {
		super(message, 'AUTHENTICATION_ERROR', 401, {
			reason,
			...context,
		});

		this.reason = reason;
	}

	/**
	 * Create an authentication error for invalid credentials
	 */
	static invalidCredentials(
		context?: Record<string, unknown>
	): AuthenticationError {
		return new AuthenticationError(
			'Invalid email or password',
			'INVALID_CREDENTIALS',
			context
		);
	}

	/**
	 * Create an authentication error for expired token
	 */
	static expiredToken(
		context?: Record<string, unknown>
	): AuthenticationError {
		return new AuthenticationError(
			'Authentication token has expired',
			'EXPIRED_TOKEN',
			context
		);
	}

	/**
	 * Create an authentication error for missing token
	 */
	static missingToken(
		context?: Record<string, unknown>
	): AuthenticationError {
		return new AuthenticationError(
			'Authentication token is required',
			'MISSING_TOKEN',
			context
		);
	}

	/**
	 * Create an authentication error for invalid token
	 */
	static invalidToken(
		context?: Record<string, unknown>
	): AuthenticationError {
		return new AuthenticationError(
			'Invalid authentication token',
			'INVALID_TOKEN',
			context
		);
	}

	/**
	 * Create an authentication error for insufficient permissions
	 */
	static insufficientPermissions(
		requiredPermission: string,
		context?: Record<string, unknown>
	): AuthenticationError {
		return new AuthenticationError(
			`Insufficient permissions: ${requiredPermission} required`,
			'INSUFFICIENT_PERMISSIONS',
			{
				requiredPermission,
				...context,
			}
		);
	}

	/**
	 * Create an authentication error for account locked
	 */
	static accountLocked(
		context?: Record<string, unknown>
	): AuthenticationError {
		return new AuthenticationError(
			'Account is locked due to too many failed login attempts',
			'ACCOUNT_LOCKED',
			context
		);
	}

	/**
	 * Check if this is a credentials error
	 */
	isCredentialsError(): boolean {
		return this.reason === 'INVALID_CREDENTIALS';
	}

	/**
	 * Check if this is a token error
	 */
	isTokenError(): boolean {
		return ['EXPIRED_TOKEN', 'MISSING_TOKEN', 'INVALID_TOKEN'].includes(
			this.reason
		);
	}

	/**
	 * Check if this is a permissions error
	 */
	isPermissionsError(): boolean {
		return this.reason === 'INSUFFICIENT_PERMISSIONS';
	}
}
