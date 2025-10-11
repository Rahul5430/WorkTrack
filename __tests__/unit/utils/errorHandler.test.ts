import { SyncError, ValidationError } from '../../../src/errors';
import { ErrorHandler } from '../../../src/utils/errorHandler';

describe('ErrorHandler', () => {
	it('wrapAsync returns result on success', async () => {
		const result = await ErrorHandler.wrapAsync(
			async () => 'ok',
			'Failed',
			'code.x'
		);
		expect(result).toBe('ok');
	});

	it('wrapAsync throws SyncError by default on failure', async () => {
		await expect(
			ErrorHandler.wrapAsync(
				async () => {
					throw new Error('boom');
				},
				'Failed op',
				'code.y'
			)
		).rejects.toBeInstanceOf(SyncError);
	});

	it('wrapAsync can throw custom ErrorClass', async () => {
		class CustomError extends SyncError {}
		await expect(
			ErrorHandler.wrapAsync(
				async () => {
					throw new Error('boom');
				},
				'Failed custom',
				'code.z',
				CustomError
			)
		).rejects.toBeInstanceOf(CustomError);
	});

	it('validateRequired throws ValidationError for missing', () => {
		expect(() => ErrorHandler.validateRequired('', 'field')).toThrow(
			ValidationError
		);
	});

	it('validateEmail throws on invalid format', () => {
		expect(() => ErrorHandler.validateEmail('bad@')).toThrow(
			ValidationError
		);
	});

	it('validateUser asserts user shape or throws', () => {
		expect(() => ErrorHandler.validateUser({ id: 'u1' })).not.toThrow();
		expect(() => ErrorHandler.validateUser(null)).toThrow(ValidationError);
	});
});
