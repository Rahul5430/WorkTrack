import {
	ServiceRegistrationError,
	ServiceResolutionError,
	ServiceScope,
} from '@/di/types';

describe('DI Types', () => {
	describe('ServiceScope enum', () => {
		it('should have SINGLETON value', () => {
			expect(ServiceScope.SINGLETON).toBe('singleton');
		});

		it('should have TRANSIENT value', () => {
			expect(ServiceScope.TRANSIENT).toBe('transient');
		});

		it('should have SCOPED value', () => {
			expect(ServiceScope.SCOPED).toBe('scoped');
		});
	});

	describe('ServiceRegistrationError', () => {
		it('should create error with identifier and message', () => {
			const identifier = Symbol('test-service');
			const error = new ServiceRegistrationError(
				identifier,
				'Test error message'
			);

			expect(error).toBeInstanceOf(Error);
			expect(error.name).toBe('ServiceRegistrationError');
			expect(error.message).toContain('test-service');
			expect(error.message).toContain('Test error message');
		});

		it('should handle string identifier', () => {
			const error = new ServiceRegistrationError(
				'test-service',
				'Test error'
			);

			expect(error.message).toContain('test-service');
		});

		it('should handle class constructor identifier', () => {
			class TestService {}
			const error = new ServiceRegistrationError(
				TestService,
				'Test error'
			);

			expect(error.message).toContain('TestService');
		});
	});

	describe('ServiceResolutionError', () => {
		it('should create error with identifier and message', () => {
			const identifier = Symbol('test-service');
			const error = new ServiceResolutionError(
				identifier,
				'Test error message'
			);

			expect(error).toBeInstanceOf(Error);
			expect(error.name).toBe('ServiceResolutionError');
			expect(error.message).toContain('test-service');
			expect(error.message).toContain('Test error message');
		});

		it('should handle string identifier', () => {
			const error = new ServiceResolutionError(
				'test-service',
				'Test error'
			);

			expect(error.message).toContain('test-service');
		});

		it('should handle class constructor identifier', () => {
			class TestService {}
			const error = new ServiceResolutionError(TestService, 'Test error');

			expect(error.message).toContain('TestService');
		});
	});
});
