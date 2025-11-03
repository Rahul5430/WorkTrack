import { Share } from '@/features/sharing/domain/entities/Share';
import { ShareValidator } from '@/features/sharing/domain/validators/ShareValidator';

describe('ShareValidator', () => {
	describe('basic validation', () => {
		it('validates share with required fields', () => {
			const share = new Share('s1', 't1', 'user@example.com', 'read');
			expect(() => ShareValidator.validate(share)).not.toThrow();
		});

		it('throws error when trackerId is missing', () => {
			// Share constructor validates trackerId and throws during construction
			// The validator also checks this, but constructor validation happens first
			// We can test the validator logic by creating a mock share object
			const mockShare = {
				trackerId: '',
				sharedWithUserId: 'user@example.com',
			} as Share;
			expect(() => ShareValidator.validate(mockShare)).toThrow(
				'trackerId required'
			);
		});

		it('throws error when sharedWithUserId is missing', () => {
			// Share constructor validates sharedWithUserId and throws during construction
			// The validator also checks this, but constructor validation happens first
			// We can test the validator logic by creating a mock share object
			const mockShare = {
				trackerId: 't1',
				sharedWithUserId: '',
			} as Share;
			expect(() => ShareValidator.validate(mockShare)).toThrow(
				'sharedWithUserId required'
			);
		});
	});

	describe('email format validation', () => {
		it('validates correct email format', () => {
			const share = new Share('s1', 't1', 'test@example.com', 'read');
			expect(() =>
				ShareValidator.validate(share, {
					userEmail: 'owner@example.com',
				})
			).not.toThrow();
		});

		it('throws error for invalid email format', () => {
			const share = new Share('s1', 't1', 'invalid-email', 'read');
			expect(() =>
				ShareValidator.validate(share, {
					userEmail: 'owner@example.com',
				})
			).toThrow('Invalid email format');
		});

		it('throws error for email without @', () => {
			const share = new Share('s1', 't1', 'noatsymbol.com', 'read');
			expect(() =>
				ShareValidator.validate(share, {
					userEmail: 'owner@example.com',
				})
			).toThrow('Invalid email format');
		});

		it('throws error for email without domain', () => {
			const share = new Share('s1', 't1', 'nodomain@', 'read');
			expect(() =>
				ShareValidator.validate(share, {
					userEmail: 'owner@example.com',
				})
			).toThrow('Invalid email format');
		});
	});

	describe('self-share validation', () => {
		it('throws error when sharing with own email', () => {
			const share = new Share('s1', 't1', 'user@example.com', 'read');
			expect(() =>
				ShareValidator.validate(share, {
					userEmail: 'user@example.com',
				})
			).toThrow('You cannot share with yourself');
		});

		it('validates self-share check is case-insensitive', () => {
			const share = new Share('s1', 't1', 'USER@EXAMPLE.COM', 'read');
			expect(() =>
				ShareValidator.validate(share, {
					userEmail: 'user@example.com',
				})
			).toThrow('You cannot share with yourself');
		});

		it('allows sharing with different email', () => {
			const share = new Share('s1', 't1', 'other@example.com', 'read');
			expect(() =>
				ShareValidator.validate(share, {
					userEmail: 'user@example.com',
				})
			).not.toThrow();
		});
	});

	describe('duplicate share validation', () => {
		it('throws error when sharing with existing user', () => {
			const share = new Share('s1', 't1', 'existing@example.com', 'read');
			expect(() =>
				ShareValidator.validate(share, {
					existingShareEmails: ['existing@example.com'],
				})
			).toThrow('You have already shared with this user');
		});

		it('validates duplicate check is case-insensitive', () => {
			const share = new Share('s1', 't1', 'EXISTING@EXAMPLE.COM', 'read');
			expect(() =>
				ShareValidator.validate(share, {
					existingShareEmails: ['existing@example.com'],
				})
			).toThrow('You have already shared with this user');
		});

		it('allows sharing with non-existing user', () => {
			const share = new Share('s1', 't1', 'new@example.com', 'read');
			expect(() =>
				ShareValidator.validate(share, {
					existingShareEmails: ['other@example.com'],
				})
			).not.toThrow();
		});
	});

	describe('combined validation', () => {
		it('validates share with all checks passing', () => {
			const share = new Share('s1', 't1', 'newuser@example.com', 'read');
			expect(() =>
				ShareValidator.validate(share, {
					userEmail: 'owner@example.com',
					existingShareEmails: [
						'other@example.com',
						'another@example.com',
					],
				})
			).not.toThrow();
		});

		it('throws error when both self-share and duplicate share', () => {
			const share = new Share('s1', 't1', 'existing@example.com', 'read');
			expect(() =>
				ShareValidator.validate(share, {
					userEmail: 'existing@example.com',
					existingShareEmails: ['existing@example.com'],
				})
			).toThrow('You cannot share with yourself');
		});

		it('works without optional parameters', () => {
			const share = new Share('s1', 't1', 'user@example.com', 'read');
			expect(() => ShareValidator.validate(share)).not.toThrow();
		});

		it('works with partial optional parameters', () => {
			const share = new Share('s1', 't1', 'user@example.com', 'read');
			expect(() =>
				ShareValidator.validate(share, {
					userEmail: 'owner@example.com',
				})
			).not.toThrow();
		});
	});
});
