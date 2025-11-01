// migrated to V2 structure
import { Container } from '@/di/Container';
import { ServiceIdentifiers } from '@/di/registry';

// Mock the database modules
jest.mock('@/shared/data/database/watermelon', () => ({
	database: { mock: 'watermelon-db' },
}));

jest.mock('@/shared/data/database/firebase', () => ({
	firestoreClient: { mock: 'firestore-client' },
}));

describe('Mock Injection', () => {
	let container: Container;

	beforeEach(() => {
		container = new Container();
	});

	afterEach(() => {
		container.dispose();
	});

	describe('Service Mocking', () => {
		it('should allow injection of mock services', () => {
			const mockService = { mock: 'test-service' };
			const identifier = 'test-service';

			container.registerSingleton(identifier, () => mockService);

			const resolved = container.resolve(identifier);
			expect(resolved).toBe(mockService);
		});

		it('should allow overriding of registered services', () => {
			const originalService = { value: 'original' };
			const mockService = { value: 'mock' };
			const identifier = 'test-service';

			// Register original service
			container.registerSingleton(identifier, () => originalService);
			expect(container.resolve(identifier)).toBe(originalService);

			// Create child container with mock
			const childContainer = container.createChild();
			childContainer.registerSingleton(identifier, () => mockService);

			// Child should resolve mock
			expect(childContainer.resolve(identifier)).toBe(mockService);

			// Parent should still resolve original
			expect(container.resolve(identifier)).toBe(originalService);
		});

		it('should support partial mocking', () => {
			const identifier = 'test-service';
			const originalFactory = jest.fn(() => ({ value: 'original' }));
			const mockFactory = jest.fn(() => ({ value: 'mock' }));

			container.registerSingleton(identifier, originalFactory);

			// Resolve original
			const original = container.resolve(identifier) as { value: string };
			expect(original.value).toBe('original');
			expect(originalFactory).toHaveBeenCalledTimes(2);

			// Create child with mock
			const childContainer = container.createChild();
			childContainer.registerSingleton(identifier, mockFactory);

			// Resolve mock
			const mock = childContainer.resolve(identifier) as {
				value: string;
			};
			expect(mock.value).toBe('mock');
			expect(mockFactory).toHaveBeenCalledTimes(2);

			// Original factory should not be called again
			expect(originalFactory).toHaveBeenCalledTimes(2);
		});
	});

	describe('Database Service Mocking', () => {
		it('should mock WatermelonDB service', () => {
			const mockDB = { mock: 'watermelon-db' };
			const identifier = ServiceIdentifiers.WATERMELON_DB;

			container.registerSingleton(identifier, () => mockDB);

			const resolved = container.resolve(identifier);
			expect(resolved).toBe(mockDB);
		});

		it('should mock FirestoreClient service', () => {
			const mockClient = { mock: 'firestore-client' };
			const identifier = ServiceIdentifiers.FIRESTORE_CLIENT;

			container.registerSingleton(identifier, () => mockClient);

			const resolved = container.resolve(identifier);
			expect(resolved).toBe(mockClient);
		});

		it('should allow mocking both database services', () => {
			const mockWatermelonDB = { mock: 'watermelon-db' };
			const mockFirestoreClient = { mock: 'firestore-client' };

			container.registerSingleton(
				ServiceIdentifiers.WATERMELON_DB,
				() => mockWatermelonDB
			);
			container.registerSingleton(
				ServiceIdentifiers.FIRESTORE_CLIENT,
				() => mockFirestoreClient
			);

			const watermelonDB = container.resolve(
				ServiceIdentifiers.WATERMELON_DB
			);
			const firestoreClient = container.resolve(
				ServiceIdentifiers.FIRESTORE_CLIENT
			);

			expect(watermelonDB).toBe(mockWatermelonDB);
			expect(firestoreClient).toBe(mockFirestoreClient);
		});
	});

	describe('Service Dependencies with Mocks', () => {
		it('should inject mocks into dependent services', () => {
			const mockDB = { mock: 'watermelon-db' };
			const mockClient = { mock: 'firestore-client' };

			container.registerSingleton(
				ServiceIdentifiers.WATERMELON_DB,
				() => mockDB
			);
			container.registerSingleton(
				ServiceIdentifiers.FIRESTORE_CLIENT,
				() => mockClient
			);
			container.registerSingleton('dependent-service', (c) => ({
				db: c.resolve(ServiceIdentifiers.WATERMELON_DB),
				client: c.resolve(ServiceIdentifiers.FIRESTORE_CLIENT),
			}));

			const dependent = container.resolve('dependent-service') as {
				db: unknown;
				client: unknown;
			};

			expect(dependent.db).toBe(mockDB);
			expect(dependent.client).toBe(mockClient);
		});

		it('should support nested mock dependencies', () => {
			const mockDB = { mock: 'watermelon-db' };
			const mockClient = { mock: 'firestore-client' };

			container.registerSingleton(
				ServiceIdentifiers.WATERMELON_DB,
				() => mockDB
			);
			container.registerSingleton(
				ServiceIdentifiers.FIRESTORE_CLIENT,
				() => mockClient
			);
			container.registerSingleton('level1-service', (c) => ({
				db: c.resolve(ServiceIdentifiers.WATERMELON_DB),
			}));
			container.registerSingleton('level2-service', (c) => ({
				level1: c.resolve('level1-service'),
				client: c.resolve(ServiceIdentifiers.FIRESTORE_CLIENT),
			}));

			const level2 = container.resolve('level2-service') as {
				level1: { db: unknown };
				client: unknown;
			};

			expect(level2.level1.db).toBe(mockDB);
			expect(level2.client).toBe(mockClient);
		});
	});

	describe('Mock Lifecycle Management', () => {
		it('should dispose mock services when container is disposed', () => {
			const disposeSpy = jest.fn();
			const mockService = {
				value: 'mock',
				dispose: disposeSpy,
			};

			container.registerSingleton('disposable-mock', () => mockService);
			container.resolve('disposable-mock');
			container.dispose();

			expect(disposeSpy).toHaveBeenCalled();
		});

		it('should handle mock disposal errors gracefully', () => {
			const mockService = {
				value: 'mock',
				dispose: () => {
					throw new Error('Mock disposal error');
				},
			};

			container.registerSingleton('error-mock', () => mockService);
			container.resolve('error-mock');

			// Should not throw
			expect(() => container.dispose()).not.toThrow();
		});
	});

	describe('Mock Service Scopes', () => {
		it('should support transient mock services', () => {
			const identifier = 'transient-mock';
			const factory = jest.fn(() => ({ id: Math.random() }));

			container.registerTransient(identifier, factory);

			const instance1 = container.resolve(identifier);
			const instance2 = container.resolve(identifier);

			expect(instance1).not.toBe(instance2);
			expect(factory).toHaveBeenCalledTimes(3);
		});

		it('should support scoped mock services', () => {
			const identifier = 'scoped-mock';
			const factory = jest.fn(() => ({ id: Math.random() }));

			container.registerScoped(identifier, factory);

			const instance1 = container.resolve(identifier);
			const instance2 = container.resolve(identifier);

			expect(instance1).toBe(instance2);
			expect(factory).toHaveBeenCalledTimes(2);
		});
	});
});
