import { Database } from '@nozbe/watermelondb';

import { ContainerBuilder } from '@/di/ContainerBuilder';
import { ServiceIdentifiers } from '@/di/registry';
import { FirebaseSyncRepository } from '@/features/sync/data/repositories/FirebaseSyncRepository';
import { WatermelonSyncQueueRepository } from '@/features/sync/data/repositories/WatermelonSyncQueueRepository';
import { SyncManager } from '@/features/sync/data/services/SyncManager';
import {
	registerSyncServices,
	SyncServiceIdentifiers,
} from '@/features/sync/di';
import { EnqueueSyncOperationUseCase } from '@/features/sync/domain/use-cases/EnqueueSyncOperationUseCase';
import { ProcessSyncQueueUseCase } from '@/features/sync/domain/use-cases/ProcessSyncQueueUseCase';
import { ResolveConflictUseCase } from '@/features/sync/domain/use-cases/ResolveConflictUseCase';
import { SyncFromRemoteUseCase } from '@/features/sync/domain/use-cases/SyncFromRemoteUseCase';
import { SyncToRemoteUseCase } from '@/features/sync/domain/use-cases/SyncToRemoteUseCase';
import { NetworkMonitorService } from '@/shared/data/network';

jest.mock('@/shared/utils/logging', () => ({
	logger: {
		info: jest.fn(),
		debug: jest.fn(),
		warn: jest.fn(),
		error: jest.fn(),
	},
}));

describe('registerSyncServices', () => {
	let builder: ContainerBuilder;
	let mockDatabase: jest.Mocked<Database>;

	beforeEach(() => {
		builder = new ContainerBuilder();
		mockDatabase = {} as jest.Mocked<Database>;

		builder.registerSingleton(
			ServiceIdentifiers.WATERMELON_DB,
			() => mockDatabase
		);
	});

	it('registers WatermelonSyncQueueRepository', () => {
		registerSyncServices(builder);
		const container = builder.build();
		const queueRepo = container.resolve(
			SyncServiceIdentifiers.SYNC_QUEUE_REPOSITORY
		);

		expect(queueRepo).toBeInstanceOf(WatermelonSyncQueueRepository);
	});

	it('registers FirebaseSyncRepository', () => {
		registerSyncServices(builder);
		const container = builder.build();
		const syncRepo = container.resolve(
			SyncServiceIdentifiers.SYNC_REPOSITORY
		);

		expect(syncRepo).toBeInstanceOf(FirebaseSyncRepository);
	});

	it('registers NetworkMonitorService', () => {
		registerSyncServices(builder);
		const container = builder.build();
		const networkMonitor = container.resolve(
			SyncServiceIdentifiers.NETWORK_MONITOR
		);

		expect(networkMonitor).toBeInstanceOf(NetworkMonitorService);
	});

	it('registers EnqueueSyncOperationUseCase', () => {
		registerSyncServices(builder);
		const container = builder.build();
		const useCase = container.resolve(
			SyncServiceIdentifiers.ENQUEUE_SYNC_OPERATION_USE_CASE
		);

		expect(useCase).toBeInstanceOf(EnqueueSyncOperationUseCase);
	});

	it('registers ProcessSyncQueueUseCase with dependencies', () => {
		registerSyncServices(builder);
		const container = builder.build();
		const useCase = container.resolve(
			SyncServiceIdentifiers.PROCESS_SYNC_QUEUE_USE_CASE
		);

		expect(useCase).toBeInstanceOf(ProcessSyncQueueUseCase);
	});

	it('registers SyncToRemoteUseCase', () => {
		registerSyncServices(builder);
		const container = builder.build();
		const useCase = container.resolve(
			SyncServiceIdentifiers.SYNC_TO_REMOTE_USE_CASE
		);

		expect(useCase).toBeInstanceOf(SyncToRemoteUseCase);
	});

	it('registers SyncFromRemoteUseCase', () => {
		registerSyncServices(builder);
		const container = builder.build();
		const useCase = container.resolve(
			SyncServiceIdentifiers.SYNC_FROM_REMOTE_USE_CASE
		);

		expect(useCase).toBeInstanceOf(SyncFromRemoteUseCase);
	});

	it('registers ResolveConflictUseCase with LastWriteWinsStrategy', () => {
		registerSyncServices(builder);
		const container = builder.build();
		const useCase = container.resolve(
			SyncServiceIdentifiers.RESOLVE_CONFLICT_USE_CASE
		);

		expect(useCase).toBeInstanceOf(ResolveConflictUseCase);
	});

	it('registers SyncManager with dependencies', () => {
		registerSyncServices(builder);
		const container = builder.build();
		const syncManager = container.resolve(
			SyncServiceIdentifiers.SYNC_MANAGER
		);

		expect(syncManager).toBeInstanceOf(SyncManager);
	});

	it('returns the builder for chaining', () => {
		const result = registerSyncServices(builder);

		expect(result).toBe(builder);
	});
});
