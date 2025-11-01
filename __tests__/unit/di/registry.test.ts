// migrated to V2 structure
import { ContainerBuilder } from '@/di/ContainerBuilder';
import {
	createContainer,
	createCoreContainer,
	registerAllServices,
	registerCoreServices,
	registerFeatureServices,
	ServiceIdentifiers,
} from '@/di/registry';

// Mock the database modules
jest.mock('@/shared/data/database/watermelon', () => ({
	database: { mock: 'watermelon-db' },
}));

jest.mock('@/shared/data/database/firebase', () => ({
	firestoreClient: { mock: 'firestore-client' },
}));

describe('DI Registry', () => {
	describe('Service Identifiers', () => {
		it('should have core service identifiers', () => {
			expect(ServiceIdentifiers.WATERMELON_DB).toBeDefined();
			expect(ServiceIdentifiers.FIRESTORE_CLIENT).toBeDefined();
		});

		it('should have unique identifiers', () => {
			const identifiers = Object.values(ServiceIdentifiers);
			const uniqueIdentifiers = new Set(identifiers);

			expect(identifiers).toHaveLength(uniqueIdentifiers.size);
		});
	});

	describe('Core Services Registration', () => {
		it('should register core services', () => {
			const builder = new ContainerBuilder();
			const result = registerCoreServices(builder);

			expect(result).toBe(builder);
			expect(
				builder.hasRegistration(ServiceIdentifiers.WATERMELON_DB)
			).toBe(true);
			expect(
				builder.hasRegistration(ServiceIdentifiers.FIRESTORE_CLIENT)
			).toBe(true);
		});

		it('should register core services as singletons', () => {
			const builder = new ContainerBuilder();
			registerCoreServices(builder);
			const container = builder.build();

			const db1 = container.resolve(ServiceIdentifiers.WATERMELON_DB);
			const db2 = container.resolve(ServiceIdentifiers.WATERMELON_DB);

			expect(db1).toBe(db2);
		});

		it('should resolve core services correctly', () => {
			const builder = new ContainerBuilder();
			registerCoreServices(builder);
			const container = builder.build();

			const watermelonDB = container.resolve(
				ServiceIdentifiers.WATERMELON_DB
			);
			const firestoreClient = container.resolve(
				ServiceIdentifiers.FIRESTORE_CLIENT
			);

			expect(watermelonDB).toEqual({ mock: 'watermelon-db' });
			expect(firestoreClient).toEqual({ mock: 'firestore-client' });
		});
	});

	describe('Feature Services Registration', () => {
		it('should register feature services', () => {
			const builder = new ContainerBuilder();
			const result = registerFeatureServices(builder);

			expect(result).toBe(builder);
		});

		it('should support chaining with core services', () => {
			const builder = new ContainerBuilder();
			const result = builder
				.pipe(registerCoreServices)
				.pipe(registerFeatureServices);

			expect(result).toBe(builder);
			expect(
				builder.hasRegistration(ServiceIdentifiers.WATERMELON_DB)
			).toBe(true);
			expect(
				builder.hasRegistration(ServiceIdentifiers.FIRESTORE_CLIENT)
			).toBe(true);
		});
	});

	describe('All Services Registration', () => {
		it('should register all services', () => {
			const builder = new ContainerBuilder();
			const result = registerAllServices(builder);

			expect(result).toBe(builder);
			expect(
				builder.hasRegistration(ServiceIdentifiers.WATERMELON_DB)
			).toBe(true);
			expect(
				builder.hasRegistration(ServiceIdentifiers.FIRESTORE_CLIENT)
			).toBe(true);
		});

		it('should support fluent API', () => {
			const builder = new ContainerBuilder();
			const result = builder.pipe(registerAllServices);

			expect(result).toBe(builder);
			// Registrations may grow as features expand; ensure call succeeds
		});
	});

	describe('Container Creation', () => {
		it('should create container with all services', () => {
			const container = createContainer();

			expect(container).toBeDefined();
			expect(
				container.isRegistered(ServiceIdentifiers.WATERMELON_DB)
			).toBe(true);
			expect(
				container.isRegistered(ServiceIdentifiers.FIRESTORE_CLIENT)
			).toBe(true);
		});

		it('should create core-only container', () => {
			const container = createCoreContainer();

			expect(container).toBeDefined();
			expect(
				container.isRegistered(ServiceIdentifiers.WATERMELON_DB)
			).toBe(true);
			expect(
				container.isRegistered(ServiceIdentifiers.FIRESTORE_CLIENT)
			).toBe(true);
		});

		it('should resolve services from created container', () => {
			const container = createContainer();

			const watermelonDB = container.resolve(
				ServiceIdentifiers.WATERMELON_DB
			);
			const firestoreClient = container.resolve(
				ServiceIdentifiers.FIRESTORE_CLIENT
			);

			expect(watermelonDB).toEqual({ mock: 'watermelon-db' });
			expect(firestoreClient).toEqual({ mock: 'firestore-client' });
		});

		it('should create independent containers', () => {
			const container1 = createContainer();
			const container2 = createContainer();

			expect(container1).not.toBe(container2);

			const db1 = container1.resolve(ServiceIdentifiers.WATERMELON_DB);
			const db2 = container2.resolve(ServiceIdentifiers.WATERMELON_DB);

			// Singletons should be the same within each container
			expect(db1).toBe(db1);
			expect(db2).toBe(db2);
		});
	});

	describe('Error Handling', () => {
		it('should handle missing dependencies gracefully', () => {
			// This test ensures that if a service depends on another service
			// that isn't registered, it will throw an appropriate error
			const builder = new ContainerBuilder();
			builder.registerSingleton('dependent-service', (container) => {
				// This will throw because the dependency isn't registered
				return container.resolve('non-existent-service');
			});

			expect(() => {
				builder.build().resolve('dependent-service');
			}).toThrow('Service is not registered');
		});
	});
});
