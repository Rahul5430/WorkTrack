import { ValidationError } from '../../../src/errors';
import { ShareDTO } from '../../../src/types';
import { ShareValidationUtils } from '../../../src/utils/shareValidation';

describe('ShareValidationUtils', () => {
	describe('validateEmailFormat', () => {
		it('should accept valid email formats', () => {
			const validEmails = [
				'test@example.com',
				'user.name@domain.co.uk',
				'user+tag@example.org',
				'test123@test-domain.com',
			];

			validEmails.forEach((email) => {
				expect(() =>
					ShareValidationUtils.validateEmailFormat(email)
				).not.toThrow();
			});
		});

		it('should reject invalid email formats', () => {
			const invalidEmails = [
				'invalid-email',
				'@example.com',
				'user@',
				'user@.com',
				'user@example',
				'',
				'user name@example.com',
			];

			invalidEmails.forEach((email) => {
				expect(() =>
					ShareValidationUtils.validateEmailFormat(email)
				).toThrow(ValidationError);
			});
		});

		it('should throw ValidationError with correct details', () => {
			const invalidEmail = 'invalid-email';

			expect(() =>
				ShareValidationUtils.validateEmailFormat(invalidEmail)
			).toThrow(
				new ValidationError('Invalid email format', {
					code: 'validation.invalid_email',
					details: { email: invalidEmail },
				})
			);
		});
	});

	describe('validateNotSelfShare', () => {
		it('should allow sharing with different email', () => {
			expect(() =>
				ShareValidationUtils.validateNotSelfShare(
					'other@example.com',
					'user@example.com'
				)
			).not.toThrow();
		});

		it('should reject sharing with same email (case sensitive)', () => {
			expect(() =>
				ShareValidationUtils.validateNotSelfShare(
					'user@example.com',
					'user@example.com'
				)
			).toThrow(ValidationError);
		});

		it('should reject sharing with same email (case insensitive)', () => {
			expect(() =>
				ShareValidationUtils.validateNotSelfShare(
					'USER@EXAMPLE.COM',
					'user@example.com'
				)
			).toThrow(ValidationError);
		});

		it('should allow sharing when user email is undefined', () => {
			expect(() =>
				ShareValidationUtils.validateNotSelfShare(
					'other@example.com',
					undefined
				)
			).not.toThrow();
		});

		it('should throw ValidationError with correct details for self share', () => {
			const userEmail = 'user@example.com';
			const shareEmail = 'user@example.com';

			expect(() =>
				ShareValidationUtils.validateNotSelfShare(shareEmail, userEmail)
			).toThrow(
				new ValidationError('Cannot share with yourself', {
					code: 'validation.self_share',
					details: { shareEmail, userEmail },
				})
			);
		});
	});

	describe('validateNotAlreadyShared', () => {
		const existingShares: ShareDTO[] = [
			{
				sharedWithEmail: 'existing@example.com',
				sharedWithId: 'user1',
				permission: 'read',
				trackerId: 'tracker1',
			},
			{
				sharedWithEmail: 'another@example.com',
				sharedWithId: 'user2',
				permission: 'write',
				trackerId: 'tracker2',
			},
		];

		it('should allow sharing with new email', () => {
			expect(() =>
				ShareValidationUtils.validateNotAlreadyShared(
					'new@example.com',
					existingShares
				)
			).not.toThrow();
		});

		it('should reject sharing with existing email (case sensitive)', () => {
			expect(() =>
				ShareValidationUtils.validateNotAlreadyShared(
					'existing@example.com',
					existingShares
				)
			).toThrow(ValidationError);
		});

		it('should reject sharing with existing email (case insensitive)', () => {
			expect(() =>
				ShareValidationUtils.validateNotAlreadyShared(
					'EXISTING@EXAMPLE.COM',
					existingShares
				)
			).toThrow(ValidationError);
		});

		it('should allow sharing when existing shares is empty', () => {
			expect(() =>
				ShareValidationUtils.validateNotAlreadyShared(
					'any@example.com',
					[]
				)
			).not.toThrow();
		});

		it('should throw ValidationError with correct details for already shared', () => {
			const shareEmail = 'existing@example.com';

			expect(() =>
				ShareValidationUtils.validateNotAlreadyShared(
					shareEmail,
					existingShares
				)
			).toThrow(
				new ValidationError('Tracker already shared with this email', {
					code: 'validation.already_shared',
					details: { shareEmail, existingShare: existingShares[0] },
				})
			);
		});
	});

	describe('validateShareRequest', () => {
		const existingShares: ShareDTO[] = [
			{
				sharedWithEmail: 'existing@example.com',
				sharedWithId: 'user1',
				permission: 'read',
				trackerId: 'tracker1',
			},
		];

		it('should pass all validations for valid share request', () => {
			expect(() =>
				ShareValidationUtils.validateShareRequest(
					'new@example.com',
					'user@example.com',
					existingShares
				)
			).not.toThrow();
		});

		it('should fail on invalid email format', () => {
			expect(() =>
				ShareValidationUtils.validateShareRequest(
					'invalid-email',
					'user@example.com',
					existingShares
				)
			).toThrow(ValidationError);
		});

		it('should fail on self share', () => {
			expect(() =>
				ShareValidationUtils.validateShareRequest(
					'user@example.com',
					'user@example.com',
					existingShares
				)
			).toThrow(ValidationError);
		});

		it('should fail on already shared email', () => {
			expect(() =>
				ShareValidationUtils.validateShareRequest(
					'existing@example.com',
					'user@example.com',
					existingShares
				)
			).toThrow(ValidationError);
		});

		it('should work with default parameters', () => {
			expect(() =>
				ShareValidationUtils.validateShareRequest('new@example.com')
			).not.toThrow();
		});
	});
});
