import { ValidationError } from '../../../../../src/shared/domain/errors/ValidationError';

describe('ValidationError', () => {
	describe('constructor', () => {
		it('should create validation error with basic properties', () => {
			const error = new ValidationError(
				'Invalid value',
				'fieldName',
				'invalidValue'
			);

			expect(error.message).toBe('Invalid value');
			expect(error.code).toBe('VALIDATION_ERROR');
			expect(error.statusCode).toBe(400);
			expect(error.field).toBe('fieldName');
			expect(error.value).toBe('invalidValue');
		});

		it('should create validation error without field and value', () => {
			const error = new ValidationError('General validation error');

			expect(error.message).toBe('General validation error');
			expect(error.field).toBeUndefined();
			expect(error.value).toBeUndefined();
		});

		it('should include field and value in context', () => {
			const error = new ValidationError(
				'Invalid value',
				'fieldName',
				'invalidValue'
			);

			expect(error.context?.field).toBe('fieldName');
			expect(error.context?.value).toBe('invalidValue');
		});
	});

	describe('static methods', () => {
		describe('forField', () => {
			it('should create field-specific validation error', () => {
				const error = ValidationError.forField(
					'email',
					'Must be a valid email',
					'invalid-email'
				);

				expect(error.message).toBe('email: Must be a valid email');
				expect(error.field).toBe('email');
				expect(error.value).toBe('invalid-email');
			});

			it('should work without value', () => {
				const error = ValidationError.forField(
					'name',
					'Must not be empty'
				);

				expect(error.message).toBe('name: Must not be empty');
				expect(error.field).toBe('name');
				expect(error.value).toBeUndefined();
			});
		});

		describe('required', () => {
			it('should create required field error', () => {
				const error = ValidationError.required('email');

				expect(error.message).toBe('email is required');
				expect(error.field).toBe('email');
				expect(error.value).toBeUndefined();
			});

			it('should include context', () => {
				const context = { form: 'login' };
				const error = ValidationError.required('email', context);

				expect(error.context?.form).toBe('login');
			});
		});

		describe('invalidFormat', () => {
			it('should create format validation error', () => {
				const error = ValidationError.invalidFormat(
					'email',
					'user@domain.com',
					'invalid-email'
				);

				expect(error.message).toBe(
					'email must be in format: user@domain.com'
				);
				expect(error.field).toBe('email');
				expect(error.value).toBe('invalid-email');
			});
		});

		describe('tooLong', () => {
			it('should create length validation error for too long', () => {
				const error = ValidationError.tooLong('name', 50, 75);

				expect(error.message).toBe(
					'name must be no more than 50 characters (got 75)'
				);
				expect(error.field).toBe('name');
			});
		});

		describe('tooShort', () => {
			it('should create length validation error for too short', () => {
				const error = ValidationError.tooShort('password', 8, 5);

				expect(error.message).toBe(
					'password must be at least 8 characters (got 5)'
				);
				expect(error.field).toBe('password');
			});
		});
	});
});
