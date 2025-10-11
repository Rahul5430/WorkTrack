import { ValidationError } from '../../../src/errors';
import { ErrorHandler } from '../../../src/utils/errorHandler';

describe('ErrorHandler - email validation', () => {
	describe('validateEmail', () => {
		it('should throw ValidationError for invalid email format', () => {
			const invalidEmails = [
				'invalid-email',
				'@example.com',
				'user@',
				'user@.com',
				'user.example.com',
				'',
				'user@example',
				'user space@example.com',
			];

			invalidEmails.forEach((email) => {
				expect(() => {
					ErrorHandler.validateEmail(email);
				}).toThrow(ValidationError);
			});
		});

		it('should not throw for valid email format', () => {
			const validEmails = [
				'user@example.com',
				'test.email@domain.co.uk',
				'user+tag@example.org',
				'user123@test-domain.com',
			];

			validEmails.forEach((email) => {
				expect(() => {
					ErrorHandler.validateEmail(email);
				}).not.toThrow();
			});
		});
	});
});
