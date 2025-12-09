// migrated to V2 structure
import { Container } from '@/di/Container';

describe('Container', () => {
	let container: Container;

	beforeEach(() => {
		container = new Container();
	});

	afterEach(() => {
		container.dispose();
	});

	describe('Service Registration', () => {
		it('should register a singleton service', () => {
			const identifier = 'test-service';
			const factory = () => ({ value: 'test' });

			container.registerSingleton(identifier, factory);

			expect(container.isRegistered(identifier)).toBe(true);
		});

		it('should register a transient service', () => {
			const identifier = 'test-service';
			const factory = () => ({ value: 'test' });

			container.registerTransient(identifier, factory);

			expect(container.isRegistered(identifier)).toBe(true);
		});

		it('should register a scoped service', () => {
			const identifier = 'test-service';
			const factory = () => ({ value: 'test' });

			container.registerScoped(identifier, factory);

			expect(container.isRegistered(identifier)).toBe(true);
		});

		it('should throw error when registering duplicate service', () => {
			const identifier = 'test-service';
			const factory = () => ({ value: 'test' });

			container.registerSingleton(identifier, factory);

			expect(() => {
				container.registerSingleton(identifier, factory);
			}).toThrow('Service is already registered');
		});

		it('should throw error when registering on disposed container', () => {
			container.dispose();

			expect(() => {
				container.registerSingleton('test', () => ({}));
			}).toThrow('Cannot register services on a disposed container');
		});
	});

	describe('Service Resolution', () => {
		it('should resolve singleton service', () => {
			const identifier = 'test-service';
			const factory = () => ({ value: 'test', id: Math.random() });

			container.registerSingleton(identifier, factory);

			const instance1 = container.resolve(identifier) as {
				value: string;
			};
			const instance2 = container.resolve(identifier) as {
				value: string;
			};

			expect(instance1).toBe(instance2);
			expect(instance1.value).toBe('test');
		});

		it('should resolve transient service', () => {
			const identifier = 'test-service';
			const factory = () => ({ value: 'test', id: Math.random() });

			container.registerTransient(identifier, factory);

			const instance1 = container.resolve(identifier) as {
				value: string;
			};
			const instance2 = container.resolve(identifier) as {
				value: string;
			};

			expect(instance1).not.toBe(instance2);
			expect(instance1.value).toBe('test');
			expect(instance2.value).toBe('test');
		});

		it('should resolve scoped service', () => {
			const identifier = 'test-service';
			const factory = () => ({ value: 'test', id: Math.random() });

			container.registerScoped(identifier, factory);

			const instance1 = container.resolve(identifier) as {
				value: string;
			};
			const instance2 = container.resolve(identifier) as {
				value: string;
			};

			expect(instance1).toBe(instance2);
			expect(instance1.value).toBe('test');
		});

		it('should throw error when resolving unregistered service', () => {
			expect(() => {
				container.resolve('unregistered-service');
			}).toThrow('Service is not registered');
		});

		it('should throw error when resolving from disposed container', () => {
			container.registerSingleton('test', () => ({}));
			container.dispose();

			expect(() => {
				container.resolve('test');
			}).toThrow('Cannot resolve services from a disposed container');
		});
	});

	describe('Child Containers', () => {
		it('should create child container', () => {
			const child = container.createChild();

			expect(child).toBeInstanceOf(Container);
			expect(child).not.toBe(container);
		});

		it('should resolve services from parent container', () => {
			const identifier = 'parent-service';
			const factory = () => ({ value: 'parent' });

			container.registerSingleton(identifier, factory);
			const child = container.createChild();

			const instance = child.resolve(identifier) as { value: string };

			expect(instance.value).toBe('parent');
		});

		it('should not resolve child services from parent', () => {
			const child = container.createChild();
			const identifier = 'child-service';
			const factory = () => ({ value: 'child' });

			child.registerSingleton(identifier, factory);

			expect(container.isRegistered(identifier)).toBe(false);
			expect(() => container.resolve(identifier)).toThrow(
				'Service is not registered'
			);
		});

		it('should dispose child container independently', () => {
			const child = container.createChild();
			const identifier = 'child-service';
			const factory = () => ({ value: 'child' });

			child.registerSingleton(identifier, factory);
			child.dispose();

			expect(() => child.resolve(identifier)).toThrow(
				'Cannot resolve services from a disposed container'
			);

			// Parent should still work
			container.registerSingleton('parent', () => ({}));
			expect(container.resolve('parent')).toBeDefined();
		});

		it('should check isRegistered with parent container lookup', () => {
			const identifier = 'parent-service';
			const factory = () => ({ value: 'parent' });

			container.registerSingleton(identifier, factory);
			const child = container.createChild();

			// Child should find service registered in parent
			expect(child.isRegistered(identifier)).toBe(true);
		});
	});

	describe('Disposal', () => {
		it('should dispose container and all services', () => {
			const identifier = 'test-service';
			const factory = () => ({ value: 'test' });

			container.registerSingleton(identifier, factory);
			container.dispose();

			expect(() => container.resolve(identifier)).toThrow(
				'Cannot resolve services from a disposed container'
			);
		});

		it('should dispose disposable services', () => {
			const identifier = 'disposable-service';
			const disposeSpy = jest.fn();
			const factory = () => ({
				value: 'test',
				dispose: disposeSpy,
			});

			container.registerSingleton(identifier, factory);
			container.resolve(identifier);
			container.dispose();

			expect(disposeSpy).toHaveBeenCalled();
		});

		it('should handle disposal errors gracefully', () => {
			const identifier = 'error-service';
			const factory = () => ({
				value: 'test',
				dispose: () => {
					throw new Error('Disposal error');
				},
			});

			container.registerSingleton(identifier, factory);
			container.resolve(identifier);

			// Should not throw
			expect(() => container.dispose()).not.toThrow();
		});

		it('should be safe to dispose multiple times', () => {
			container.dispose();
			expect(() => container.dispose()).not.toThrow();
		});
	});

	describe('Service Dependencies', () => {
		it('should resolve services with dependencies', () => {
			const serviceA = 'service-a';
			const serviceB = 'service-b';

			container.registerSingleton(serviceA, () => ({ value: 'A' }));
			container.registerSingleton(serviceB, (c) => ({
				value: 'B',
				dependency: c.resolve(serviceA),
			}));

			const instanceB = container.resolve(serviceB) as {
				value: string;
				dependency: { value: string };
			};

			expect(instanceB.value).toBe('B');
			expect(instanceB.dependency.value).toBe('A');
		});

		it('should handle circular dependencies', () => {
			const serviceA = 'service-a';
			const serviceB = 'service-b';

			container.registerSingleton(serviceA, (c) => ({
				value: 'A',
				dependency: c.resolve(serviceB),
			}));
			container.registerSingleton(serviceB, (c) => ({
				value: 'B',
				dependency: c.resolve(serviceA),
			}));

			// This should throw due to circular dependency
			expect(() => container.resolve(serviceA)).toThrow();
		});
	});

	describe('error handling', () => {
		it('should throw error for unknown service scope', () => {
			const identifier = 'test-service';
			const factory = () => ({ value: 'test' });

			// Register with invalid scope by using the register method directly
			container.register({
				identifier,
				factory,
				scope: 'invalid-scope' as import('@/di/types').ServiceScope,
			});

			expect(() => container.resolve(identifier)).toThrow(
				'Unknown service scope'
			);
		});
	});
});
