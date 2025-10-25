import { AppError } from '../../../../../src/shared/domain/errors/AppError';

// Test error class that extends AppError
class TestError extends AppError {
	constructor(
		message: string,
		code: string,
		statusCode: number = 500,
		context?: Record<string, unknown>
	) {
		super(message, code, statusCode, context);
	}
}

describe('AppError', () => {
	describe('constructor', () => {
		it('should create error with basic properties', () => {
			const error = new TestError('Test message', 'TEST_ERROR', 400);

			expect(error.message).toBe('Test message');
			expect(error.code).toBe('TEST_ERROR');
			expect(error.statusCode).toBe(400);
			expect(error.timestamp).toBeInstanceOf(Date);
			expect(error.name).toBe('TestError');
		});

		it('should create error with context', () => {
			const context = { userId: '123', action: 'test' };
			const error = new TestError(
				'Test message',
				'TEST_ERROR',
				400,
				context
			);

			expect(error.context).toEqual(context);
		});

		it('should set default status code to 500', () => {
			const error = new TestError('Test message', 'TEST_ERROR');
			expect(error.statusCode).toBe(500);
		});

		it('should set proper prototype chain', () => {
			const error = new TestError('Test message', 'TEST_ERROR');
			expect(error instanceof TestError).toBe(true);
			expect(error instanceof AppError).toBe(true);
			expect(error instanceof Error).toBe(true);
		});
	});

	describe('toJSON', () => {
		it('should serialize error to JSON', () => {
			const context = { userId: '123' };
			const error = new TestError(
				'Test message',
				'TEST_ERROR',
				400,
				context
			);
			const json = error.toJSON();

			expect(json).toEqual({
				name: 'TestError',
				message: 'Test message',
				code: 'TEST_ERROR',
				statusCode: 400,
				timestamp: error.timestamp.toISOString(),
				context: { userId: '123' },
				stack: error.stack,
			});
		});

		it('should handle missing context', () => {
			const error = new TestError('Test message', 'TEST_ERROR', 400);
			const json = error.toJSON();

			expect(json.context).toBeUndefined();
		});
	});

	describe('getUserMessage', () => {
		it('should return the error message', () => {
			const error = new TestError('Test message', 'TEST_ERROR');
			expect(error.getUserMessage()).toBe('Test message');
		});
	});

	describe('isType', () => {
		it('should return true for correct type', () => {
			const error = new TestError('Test message', 'TEST_ERROR');
			expect(error.isType(TestError)).toBe(true);
			expect(error.isType(AppError)).toBe(true);
		});

		it('should return false for incorrect type', () => {
			class DifferentError extends AppError {
				constructor(message: string) {
					super(message, 'DIFFERENT_ERROR');
				}
			}

			const error = new TestError('Test message', 'TEST_ERROR');
			expect(error.isType(DifferentError)).toBe(false);
		});
	});

	describe('withContext', () => {
		it('should add additional context', () => {
			const originalContext = { userId: '123' };
			const error = new TestError(
				'Test message',
				'TEST_ERROR',
				400,
				originalContext
			);

			const newError = error.withContext({
				action: 'test',
				timestamp: Date.now(),
			});

			expect(newError.context).toEqual({
				userId: '123',
				action: 'test',
				timestamp: expect.any(Number),
			});
		});

		it('should override existing context values', () => {
			const originalContext = { userId: '123', action: 'old' };
			const error = new TestError(
				'Test message',
				'TEST_ERROR',
				400,
				originalContext
			);

			const newError = error.withContext({ action: 'new' });

			expect(newError.context).toEqual({
				userId: '123',
				action: 'new',
			});
		});

		it('should work with no original context', () => {
			const error = new TestError('Test message', 'TEST_ERROR', 400);

			const newError = error.withContext({ userId: '123' });

			expect(newError.context).toEqual({ userId: '123' });
		});
	});
});
