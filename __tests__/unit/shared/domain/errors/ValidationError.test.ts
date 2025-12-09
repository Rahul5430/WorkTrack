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

		it('should serialize number value', () => {
			const error = new ValidationError('Invalid number', 'age', 123);

			expect(error.value).toBe(123);
			expect(error.context?.value).toBe(123);
		});

		it('should serialize boolean value', () => {
			const error = new ValidationError(
				'Invalid boolean',
				'active',
				true
			);

			expect(error.value).toBe(true);
			expect(error.context?.value).toBe(true);
		});

		it('should serialize object value as JSON string', () => {
			const objValue = { name: 'test', count: 5 };
			const error = new ValidationError(
				'Invalid object',
				'data',
				objValue
			);

			expect(error.value).toEqual(objValue);
			expect(error.context?.value).toBe(JSON.stringify(objValue));
		});

		it('should handle circular object by converting to string', () => {
			const circularObj: Record<string, unknown> = { name: 'test' };
			circularObj.self = circularObj; // Create circular reference

			const error = new ValidationError(
				'Invalid circular object',
				'data',
				circularObj
			);

			expect(error.value).toEqual(circularObj);
			// Should fallback to String(value) when JSON.stringify fails
			expect(error.context?.value).toBe(String(circularObj));
		});

		it('should serialize null value', () => {
			const error = new ValidationError('Invalid null', 'value', null);

			expect(error.value).toBe(null);
			expect(error.context?.value).toBe(null);
		});

		it('should serialize undefined value as string', () => {
			// Note: undefined values are not serialized (handled by the if check)
			const error = new ValidationError(
				'Invalid undefined',
				'value',
				undefined
			);

			expect(error.value).toBeUndefined();
			expect(error.context?.value).toBeUndefined();
		});

		it('should serialize function value as string', () => {
			const fnValue = () => 'test';
			const error = new ValidationError(
				'Invalid function',
				'callback',
				fnValue
			);

			expect(error.value).toBe(fnValue);
			// Functions are not objects, so should fallback to String(value)
			expect(typeof error.context?.value).toBe('string');
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
