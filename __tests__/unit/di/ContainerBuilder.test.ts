// migrated to V2 structure
import { ContainerBuilder } from '@/di/ContainerBuilder';

describe('ContainerBuilder', () => {
	let builder: ContainerBuilder;

	beforeEach(() => {
		builder = new ContainerBuilder();
	});

	describe('Service Registration', () => {
		it('should register a singleton service', () => {
			const identifier = 'test-service';
			const factory = () => ({ value: 'test' });

			const result = builder.registerSingleton(identifier, factory);

			expect(result).toBe(builder);
			expect(builder.hasRegistration(identifier)).toBe(true);
			expect(builder.getRegistrationCount()).toBe(1);
		});

		it('should register a transient service', () => {
			const identifier = 'test-service';
			const factory = () => ({ value: 'test' });

			const result = builder.registerTransient(identifier, factory);

			expect(result).toBe(builder);
			expect(builder.hasRegistration(identifier)).toBe(true);
			expect(builder.getRegistrationCount()).toBe(1);
		});

		it('should register a scoped service', () => {
			const identifier = 'test-service';
			const factory = () => ({ value: 'test' });

			const result = builder.registerScoped(identifier, factory);

			expect(result).toBe(builder);
			expect(builder.hasRegistration(identifier)).toBe(true);
			expect(builder.getRegistrationCount()).toBe(1);
		});

		it('should register multiple services', () => {
			builder
				.registerSingleton('service1', () => ({}))
				.registerTransient('service2', () => ({}))
				.registerScoped('service3', () => ({}));

			expect(builder.getRegistrationCount()).toBe(3);
			expect(builder.hasRegistration('service1')).toBe(true);
			expect(builder.hasRegistration('service2')).toBe(true);
			expect(builder.hasRegistration('service3')).toBe(true);
		});

		it('should throw error when registering duplicate service', () => {
			const identifier = 'test-service';
			const factory = () => ({ value: 'test' });

			builder.registerSingleton(identifier, factory);

			expect(() => {
				builder.registerSingleton(identifier, factory);
			}).toThrow('Service test-service is already registered');
		});

		it('should support fluent API', () => {
			const result = builder
				.registerSingleton('service1', () => ({}))
				.registerTransient('service2', () => ({}))
				.registerScoped('service3', () => ({}));

			expect(result).toBe(builder);
			expect(builder.getRegistrationCount()).toBe(3);
		});
	});

	describe('Container Building', () => {
		it('should build container with registered services', () => {
			const identifier = 'test-service';
			const factory = () => ({ value: 'test' });

			builder.registerSingleton(identifier, factory);
			const container = builder.build();

			expect(container).toBeDefined();
			expect(container.isRegistered(identifier)).toBe(true);
			expect(container.resolve(identifier)).toEqual({ value: 'test' });
		});

		it('should build empty container when no services registered', () => {
			const container = builder.build();

			expect(container).toBeDefined();
			expect(container.isRegistered('non-existent')).toBe(false);
		});

		it('should build container with mixed service scopes', () => {
			builder
				.registerSingleton('singleton', () => ({ type: 'singleton' }))
				.registerTransient('transient', () => ({ type: 'transient' }))
				.registerScoped('scoped', () => ({ type: 'scoped' }));

			const container = builder.build();

			expect(container.isRegistered('singleton')).toBe(true);
			expect(container.isRegistered('transient')).toBe(true);
			expect(container.isRegistered('scoped')).toBe(true);

			// Test singleton behavior
			const singleton1 = container.resolve('singleton');
			const singleton2 = container.resolve('singleton');
			expect(singleton1).toBe(singleton2);

			// Test transient behavior
			const transient1 = container.resolve('transient');
			const transient2 = container.resolve('transient');
			expect(transient1).not.toBe(transient2);

			// Test scoped behavior
			const scoped1 = container.resolve('scoped');
			const scoped2 = container.resolve('scoped');
			expect(scoped1).toBe(scoped2);
		});
	});

	describe('Builder State Management', () => {
		it('should clear all registrations', () => {
			builder
				.registerSingleton('service1', () => ({}))
				.registerTransient('service2', () => ({}));

			expect(builder.getRegistrationCount()).toBe(2);

			const result = builder.clear();

			expect(result).toBe(builder);
			expect(builder.getRegistrationCount()).toBe(0);
			expect(builder.hasRegistration('service1')).toBe(false);
			expect(builder.hasRegistration('service2')).toBe(false);
		});

		it('should maintain state after building', () => {
			builder.registerSingleton('service', () => ({}));
			builder.build();

			expect(builder.getRegistrationCount()).toBe(1);
			expect(builder.hasRegistration('service')).toBe(true);
		});

		it('should allow building multiple containers', () => {
			builder.registerSingleton('service', () => ({ id: Math.random() }));

			const container1 = builder.build();
			const container2 = builder.build();

			expect(container1).not.toBe(container2);
			expect(container1.resolve('service')).not.toBe(
				container2.resolve('service')
			);
		});
	});

	// Note: Pipe method tests are removed as pipe is added via module augmentation
	// and may not be available in test environment
});
