// migrated to V2 structure
import { registerAttendanceServices } from '@/features/attendance/di';
import { registerAuthServices } from '@/features/auth/di';
import { registerSharingServices } from '@/features/sharing/di';
import { registerSyncServices } from '@/features/sync/di';
import { firestoreClient } from '@/shared/data/database/firebase';
// Database services
import { database as watermelonDB } from '@/shared/data/database/watermelon';
import { logger } from '@/shared/utils/logging';

import { Container } from './Container';
import { ContainerBuilder } from './ContainerBuilder';

// Feature modules will be imported here as they are implemented
// import { AttendanceModule } from '@/features/attendance/di/AttendanceModule';
// import { SharingModule } from '@/features/sharing/di/SharingModule';
// import { SyncModule } from '@/features/sync/di/SyncModule';

/**
 * Service identifiers for dependency injection
 */
export const ServiceIdentifiers = {
	// Database services
	WATERMELON_DB: Symbol('WatermelonDB'),
	FIRESTORE_CLIENT: Symbol('FirestoreClient'),

	// Feature services will be added here
	// ATTENDANCE_REPOSITORY: Symbol('AttendanceRepository'),
	// AUTH_SERVICE: Symbol('AuthService'),
	// SHARING_SERVICE: Symbol('SharingService'),
	// SYNC_SERVICE: Symbol('SyncService'),
} as const;

/**
 * Register all core services in the container
 */
export function registerCoreServices(
	builder: ContainerBuilder
): ContainerBuilder {
	logger.debug('Registering core services...');

	// Register database services
	builder
		.registerSingleton(ServiceIdentifiers.WATERMELON_DB, () => watermelonDB)
		.registerSingleton(
			ServiceIdentifiers.FIRESTORE_CLIENT,
			() => firestoreClient
		);

	logger.debug('Core services registered');
	return builder;
}

/**
 * Register all feature services in the container
 * This will be expanded as feature modules are implemented
 */
export function registerFeatureServices(
	builder: ContainerBuilder
): ContainerBuilder {
	logger.debug('Registering feature services...');

	// Register auth services
	registerAuthServices(builder);

	// Register attendance services
	registerAttendanceServices(builder);

	// Register sharing services
	registerSharingServices(builder);

	// Register sync services
	registerSyncServices(builder);

	// Additional feature services can be registered here when introduced
	// builder
	// 	.registerSingleton(ServiceIdentifiers.ATTENDANCE_REPOSITORY, (container) => {
	// 		const watermelonDB = container.resolve(ServiceIdentifiers.WATERMELON_DB);
	// 		return new AttendanceRepository(watermelonDB);
	// 	})
	// 	.registerSingleton(ServiceIdentifiers.SHARING_SERVICE, (container) => {
	// 		const firestoreClient = container.resolve(ServiceIdentifiers.FIRESTORE_CLIENT);
	// 		return new SharingService(firestoreClient);
	// 	})
	// 	.registerSingleton(ServiceIdentifiers.SYNC_SERVICE, (container) => {
	// 		const watermelonDB = container.resolve(ServiceIdentifiers.WATERMELON_DB);
	// 		const firestoreClient = container.resolve(ServiceIdentifiers.FIRESTORE_CLIENT);
	// 		return new SyncService(watermelonDB, firestoreClient);
	// 	});

	logger.debug('Feature services registered');
	return builder;
}

/**
 * Register all services in the container
 */
export function registerAllServices(
	builder: ContainerBuilder
): ContainerBuilder {
	return builder.pipe(registerCoreServices).pipe(registerFeatureServices);
}

/**
 * Create a fully configured container with all services
 */
export function createContainer(): Container {
	const builder = new ContainerBuilder();
	return registerAllServices(builder).build();
}

/**
 * Create a container with only core services
 */
export function createCoreContainer(): Container {
	const builder = new ContainerBuilder();
	return registerCoreServices(builder).build();
}

// Extend ContainerBuilder with pipe method for fluent API
declare module './ContainerBuilder' {
	interface ContainerBuilder {
		pipe<T>(fn: (builder: ContainerBuilder) => T): T;
	}
}

ContainerBuilder.prototype.pipe = function <T>(
	this: ContainerBuilder,
	fn: (builder: ContainerBuilder) => T
): T {
	return fn(this);
};
