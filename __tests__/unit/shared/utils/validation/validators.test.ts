import { validators } from '@/shared/utils/validation/validators';

describe('validators', () => {
	describe('required', () => {
		it('returns true for non-empty string', () => {
			expect(validators.required('test')).toBe(true);
			expect(validators.required('  test  ')).toBe(true);
		});

		it('returns false for null', () => {
			expect(validators.required(null)).toBe(false);
		});

		it('returns false for undefined', () => {
			expect(validators.required(undefined)).toBe(false);
		});

		it('returns false for empty string', () => {
			expect(validators.required('')).toBe(false);
		});

		it('returns false for whitespace-only string', () => {
			expect(validators.required('   ')).toBe(false);
		});

		it('returns true for number', () => {
			expect(validators.required(0)).toBe(true);
			expect(validators.required(123)).toBe(true);
		});

		it('returns true for boolean', () => {
			expect(validators.required(true)).toBe(true);
			expect(validators.required(false)).toBe(true);
		});
	});

	describe('isEmail', () => {
		it('validates correct email addresses', () => {
			expect(validators.isEmail('test@example.com')).toBe(true);
			expect(validators.isEmail('user.name@domain.co.uk')).toBe(true);
			expect(validators.isEmail('user+tag@example.com')).toBe(true);
		});

		it('rejects invalid email addresses', () => {
			expect(validators.isEmail('invalid')).toBe(false);
			expect(validators.isEmail('invalid@')).toBe(false);
			expect(validators.isEmail('@example.com')).toBe(false);
			expect(validators.isEmail('test@')).toBe(false);
			expect(validators.isEmail('test@.com')).toBe(false);
		});
	});
});
