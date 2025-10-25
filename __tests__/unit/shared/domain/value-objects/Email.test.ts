import { Email } from '../../../../../src/shared/domain/value-objects/Email';

describe('Email', () => {
	describe('constructor', () => {
		it('should create email with valid address', () => {
			const email = new Email('user@example.com');

			expect(email.value).toBe('user@example.com');
			expect(email.localPart).toBe('user');
			expect(email.domain).toBe('example.com');
		});

		it('should normalize email to lowercase', () => {
			const email = new Email('USER@EXAMPLE.COM');

			expect(email.value).toBe('user@example.com');
		});

		it('should trim whitespace', () => {
			const email = new Email('  user@example.com  ');

			expect(email.value).toBe('user@example.com');
		});

		it('should throw error for empty string', () => {
			expect(() => new Email('')).toThrow(
				'Email must be a non-empty string'
			);
		});

		it('should throw error for whitespace-only string', () => {
			expect(() => new Email('   ')).toThrow(
				'Email must be a non-empty string'
			);
		});

		it('should throw error for email that is too long', () => {
			const longEmail = 'a'.repeat(250) + '@example.com';
			expect(() => new Email(longEmail)).toThrow(
				'Email local part is too long (max 64 characters)'
			);
		});

		it('should throw error for invalid format', () => {
			expect(() => new Email('invalid-email')).toThrow(
				'Invalid email format'
			);
			expect(() => new Email('user@')).toThrow('Invalid email format');
			expect(() => new Email('@example.com')).toThrow(
				'Invalid email format'
			);
			expect(() => new Email('user..name@example.com')).toThrow(
				'Email local part cannot contain consecutive dots'
			);
		});

		it('should throw error for local part that is too long', () => {
			const longLocalPart = 'a'.repeat(65) + '@example.com';
			expect(() => new Email(longLocalPart)).toThrow(
				'Email local part is too long (max 64 characters)'
			);
		});

		it('should throw error for domain that is too long', () => {
			const longDomain = 'user@' + 'a'.repeat(254) + '.com';
			expect(() => new Email(longDomain)).toThrow('Invalid email format');
		});

		it('should throw error for local part starting with dot', () => {
			expect(() => new Email('.user@example.com')).toThrow(
				'Email local part cannot start or end with a dot'
			);
		});

		it('should throw error for local part ending with dot', () => {
			expect(() => new Email('user.@example.com')).toThrow(
				'Email local part cannot start or end with a dot'
			);
		});

		it('should throw error for non-string input', () => {
			expect(() => new Email(null as unknown as string)).toThrow(
				'Email must be a non-empty string'
			);
			expect(() => new Email(undefined as unknown as string)).toThrow(
				'Email must be a non-empty string'
			);
			expect(() => new Email(123 as unknown as string)).toThrow(
				'Email must be a non-empty string'
			);
		});
	});

	describe('static methods', () => {
		describe('fromString', () => {
			it('should create email from valid string', () => {
				const email = Email.fromString('user@example.com');

				expect(email.value).toBe('user@example.com');
			});

			it('should throw error for invalid string', () => {
				expect(() => Email.fromString('invalid-email')).toThrow(
					'Invalid email format'
				);
			});
		});

		describe('isValid', () => {
			it('should return true for valid email', () => {
				expect(Email.isValid('user@example.com')).toBe(true);
				expect(Email.isValid('test.email+tag@example.co.uk')).toBe(
					true
				);
			});

			it('should return false for invalid email', () => {
				expect(Email.isValid('invalid-email')).toBe(false);
				expect(Email.isValid('user@')).toBe(false);
				expect(Email.isValid('@example.com')).toBe(false);
				expect(Email.isValid('')).toBe(false);
			});
		});
	});

	describe('equality', () => {
		it('should be equal to itself', () => {
			const email = new Email('user@example.com');
			expect(email.equals(email)).toBe(true);
		});

		it('should be equal to email with same value', () => {
			const email1 = new Email('user@example.com');
			const email2 = new Email('user@example.com');

			expect(email1.equals(email2)).toBe(true);
		});

		it('should be equal to email with same value (case insensitive)', () => {
			const email1 = new Email('user@example.com');
			const email2 = new Email('USER@EXAMPLE.COM');

			expect(email1.equals(email2)).toBe(true);
		});

		it('should not be equal to email with different value', () => {
			const email1 = new Email('user@example.com');
			const email2 = new Email('user@different.com');

			expect(email1.equals(email2)).toBe(false);
		});

		it('should not be equal to null or undefined', () => {
			const email = new Email('user@example.com');

			expect(email.equals(null)).toBe(false);
			expect(email.equals(undefined)).toBe(false);
		});
	});

	describe('utility methods', () => {
		it('should return hash code', () => {
			const email = new Email('user@example.com');

			expect(email.hashCode()).toBe('user@example.com');
		});

		it('should convert to string', () => {
			const email = new Email('user@example.com');

			expect(email.toString()).toBe('user@example.com');
		});

		it('should convert to JSON', () => {
			const email = new Email('user@example.com');

			expect(email.toJSON()).toBe('user@example.com');
		});

		it('should return masked email', () => {
			const email1 = new Email('user@example.com');
			const email2 = new Email('ab@example.com');
			const email3 = new Email('a@example.com');

			expect(email1.masked()).toBe('u**r@example.com');
			expect(email2.masked()).toBe('a***@example.com');
			expect(email3.masked()).toBe('a***@example.com');
		});

		it('should check if Gmail', () => {
			const gmail = new Email('user@gmail.com');
			const nonGmail = new Email('user@example.com');

			expect(gmail.isGmail()).toBe(true);
			expect(nonGmail.isGmail()).toBe(false);
		});

		it('should check if corporate email', () => {
			const corporate = new Email('user@company.com');
			const gmail = new Email('user@gmail.com');
			const yahoo = new Email('user@yahoo.com');

			expect(corporate.isCorporate()).toBe(true);
			expect(gmail.isCorporate()).toBe(false);
			expect(yahoo.isCorporate()).toBe(false);
		});

		it('should return display name', () => {
			const email = new Email('user@example.com');

			expect(email.getDisplayName()).toBe('user');
		});
	});
});
