import { AuthenticationError } from '../../../../../src/shared/domain/errors/AuthenticationError';

describe('AuthenticationError', () => {
	describe('constructor', () => {
		it('should create authentication error with basic properties', () => {
			const error = new AuthenticationError(
				'Invalid credentials',
				'INVALID_CREDENTIALS'
			);

			expect(error.message).toBe('Invalid credentials');
			expect(error.code).toBe('AUTHENTICATION_ERROR');
			expect(error.statusCode).toBe(401);
			expect(error.reason).toBe('INVALID_CREDENTIALS');
		});

		it('should set default reason', () => {
			const error = new AuthenticationError('Authentication failed');

			expect(error.reason).toBe('INVALID_CREDENTIALS');
		});

		it('should include reason in context', () => {
			const error = new AuthenticationError(
				'Invalid token',
				'INVALID_TOKEN'
			);

			expect(error.context?.reason).toBe('INVALID_TOKEN');
		});
	});

	describe('static methods', () => {
		describe('invalidCredentials', () => {
			it('should create invalid credentials error', () => {
				const error = AuthenticationError.invalidCredentials();

				expect(error.message).toBe('Invalid email or password');
				expect(error.reason).toBe('INVALID_CREDENTIALS');
			});

			it('should include context', () => {
				const context = { attemptCount: 3 };
				const error = AuthenticationError.invalidCredentials(context);

				expect(error.context?.attemptCount).toBe(3);
			});
		});

		describe('expiredToken', () => {
			it('should create expired token error', () => {
				const error = AuthenticationError.expiredToken();

				expect(error.message).toBe('Authentication token has expired');
				expect(error.reason).toBe('EXPIRED_TOKEN');
			});
		});

		describe('missingToken', () => {
			it('should create missing token error', () => {
				const error = AuthenticationError.missingToken();

				expect(error.message).toBe('Authentication token is required');
				expect(error.reason).toBe('MISSING_TOKEN');
			});
		});

		describe('invalidToken', () => {
			it('should create invalid token error', () => {
				const error = AuthenticationError.invalidToken();

				expect(error.message).toBe('Invalid authentication token');
				expect(error.reason).toBe('INVALID_TOKEN');
			});
		});

		describe('insufficientPermissions', () => {
			it('should create insufficient permissions error', () => {
				const error =
					AuthenticationError.insufficientPermissions('admin');

				expect(error.message).toBe(
					'Insufficient permissions: admin required'
				);
				expect(error.reason).toBe('INSUFFICIENT_PERMISSIONS');
				expect(error.context?.requiredPermission).toBe('admin');
			});
		});

		describe('accountLocked', () => {
			it('should create account locked error', () => {
				const error = AuthenticationError.accountLocked();

				expect(error.message).toBe(
					'Account is locked due to too many failed login attempts'
				);
				expect(error.reason).toBe('ACCOUNT_LOCKED');
			});
		});
	});

	describe('type checking methods', () => {
		it('should identify credentials errors', () => {
			const credentialsError = AuthenticationError.invalidCredentials();
			const tokenError = AuthenticationError.expiredToken();

			expect(credentialsError.isCredentialsError()).toBe(true);
			expect(tokenError.isCredentialsError()).toBe(false);
		});

		it('should identify token errors', () => {
			const expiredToken = AuthenticationError.expiredToken();
			const missingToken = AuthenticationError.missingToken();
			const invalidToken = AuthenticationError.invalidToken();
			const credentialsError = AuthenticationError.invalidCredentials();

			expect(expiredToken.isTokenError()).toBe(true);
			expect(missingToken.isTokenError()).toBe(true);
			expect(invalidToken.isTokenError()).toBe(true);
			expect(credentialsError.isTokenError()).toBe(false);
		});

		it('should identify permissions errors', () => {
			const permissionsError =
				AuthenticationError.insufficientPermissions('admin');
			const credentialsError = AuthenticationError.invalidCredentials();

			expect(permissionsError.isPermissionsError()).toBe(true);
			expect(credentialsError.isPermissionsError()).toBe(false);
		});
	});
});
