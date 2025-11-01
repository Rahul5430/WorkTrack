// Feature DI registration
import { Database } from '@nozbe/watermelondb';

import { ContainerBuilder } from '@/di/ContainerBuilder';
import { ServiceIdentifiers } from '@/di/registry';
import { logger } from '@/shared/utils/logging';

import {
	FirebaseSyncRepository,
	WatermelonSyncQueueRepository,
} from './data/repositories';
import { NetworkMonitorService, SyncManager } from './data/services';
import type {
	IConflictResolver,
	INetworkMonitor,
	ISyncQueueRepository,
	ISyncRepository,
} from './domain/ports';
import { LastWriteWinsStrategy } from './domain/strategies/LastWriteWinsStrategy';
import {
	EnqueueSyncOperationUseCase,
	ProcessSyncQueueUseCase,
	ResolveConflictUseCase,
	SyncFromRemoteUseCase,
	SyncToRemoteUseCase,
} from './domain/use-cases';

export const SyncServiceIdentifiers = {
	SYNC_QUEUE_REPOSITORY: Symbol('SyncQueueRepository'),
	SYNC_REPOSITORY: Symbol('SyncRepository'),
	NETWORK_MONITOR: Symbol('NetworkMonitor'),
	ENQUEUE_SYNC_OPERATION_USE_CASE: Symbol('EnqueueSyncOperationUseCase'),
	PROCESS_SYNC_QUEUE_USE_CASE: Symbol('ProcessSyncQueueUseCase'),
	SYNC_TO_REMOTE_USE_CASE: Symbol('SyncToRemoteUseCase'),
	SYNC_FROM_REMOTE_USE_CASE: Symbol('SyncFromRemoteUseCase'),
	RESOLVE_CONFLICT_USE_CASE: Symbol('ResolveConflictUseCase'),
	SYNC_MANAGER: Symbol('SyncManager'),
} as const;

export function registerSyncServices(
	builder: ContainerBuilder
): ContainerBuilder {
	logger.info('Registering sync services...');

	// Register repositories
	builder.registerSingleton(
		SyncServiceIdentifiers.SYNC_QUEUE_REPOSITORY,
		(container) => {
			const db = container.resolve(
				ServiceIdentifiers.WATERMELON_DB
			) as Database;
			return new WatermelonSyncQueueRepository(db);
		}
	);

	builder.registerSingleton(
		SyncServiceIdentifiers.SYNC_REPOSITORY,
		() => new FirebaseSyncRepository()
	);

	// Register services
	builder.registerSingleton(
		SyncServiceIdentifiers.NETWORK_MONITOR,
		() => new NetworkMonitorService()
	);

	// Register use cases
	builder.registerSingleton(
		SyncServiceIdentifiers.ENQUEUE_SYNC_OPERATION_USE_CASE,
		(container) =>
			new EnqueueSyncOperationUseCase(
				container.resolve(
					SyncServiceIdentifiers.SYNC_QUEUE_REPOSITORY
				) as ISyncQueueRepository
			)
	);

	// Register SyncManager orchestrator
	builder.registerSingleton(
		SyncServiceIdentifiers.SYNC_MANAGER,
		(container) =>
			new SyncManager(
				container.resolve(
					SyncServiceIdentifiers.PROCESS_SYNC_QUEUE_USE_CASE
				) as ProcessSyncQueueUseCase,
				container.resolve(
					SyncServiceIdentifiers.SYNC_FROM_REMOTE_USE_CASE
				) as SyncFromRemoteUseCase,
				container.resolve(
					SyncServiceIdentifiers.NETWORK_MONITOR
				) as INetworkMonitor
			)
	);

	builder.registerSingleton(
		SyncServiceIdentifiers.PROCESS_SYNC_QUEUE_USE_CASE,
		(container) =>
			new ProcessSyncQueueUseCase(
				container.resolve(
					SyncServiceIdentifiers.SYNC_QUEUE_REPOSITORY
				) as ISyncQueueRepository,
				container.resolve(
					SyncServiceIdentifiers.SYNC_REPOSITORY
				) as ISyncRepository,
				container.resolve(
					SyncServiceIdentifiers.NETWORK_MONITOR
				) as INetworkMonitor
			)
	);

	builder.registerSingleton(
		SyncServiceIdentifiers.SYNC_TO_REMOTE_USE_CASE,
		(container) =>
			new SyncToRemoteUseCase(
				container.resolve(
					SyncServiceIdentifiers.SYNC_QUEUE_REPOSITORY
				) as ISyncQueueRepository,
				container.resolve(
					SyncServiceIdentifiers.SYNC_REPOSITORY
				) as ISyncRepository
			)
	);

	builder.registerSingleton(
		SyncServiceIdentifiers.SYNC_FROM_REMOTE_USE_CASE,
		(container) =>
			new SyncFromRemoteUseCase(
				container.resolve(
					SyncServiceIdentifiers.SYNC_REPOSITORY
				) as ISyncRepository
			)
	);

	builder.registerSingleton(
		SyncServiceIdentifiers.RESOLVE_CONFLICT_USE_CASE,
		(_container) => {
			const resolver = new LastWriteWinsStrategy() as IConflictResolver;
			return new ResolveConflictUseCase(resolver);
		}
	);

	logger.info('Sync services registered');
	return builder;
}
