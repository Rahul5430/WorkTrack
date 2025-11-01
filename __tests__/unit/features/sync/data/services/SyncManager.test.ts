import { SyncManager } from '@/features/sync/data/services/SyncManager';
import { INetworkMonitor } from '@/features/sync/domain/ports/INetworkMonitor';
import { ProcessSyncQueueUseCase } from '@/features/sync/domain/use-cases/ProcessSyncQueueUseCase';
import { SyncFromRemoteUseCase } from '@/features/sync/domain/use-cases/SyncFromRemoteUseCase';

describe('SyncManager', () => {
	let network: jest.Mocked<INetworkMonitor>;
	let processUC: jest.Mocked<ProcessSyncQueueUseCase>;
	let pullUC: jest.Mocked<SyncFromRemoteUseCase>;

	beforeEach(() => {
		network = {
			isOnline: jest.fn().mockResolvedValue(true),
			listen: jest.fn().mockReturnValue(() => {}),
		} as unknown as jest.Mocked<INetworkMonitor>;
		processUC = {
			execute: jest.fn().mockResolvedValue(undefined),
		} as unknown as jest.Mocked<ProcessSyncQueueUseCase>;
		pullUC = {
			execute: jest.fn().mockResolvedValue(undefined),
		} as unknown as jest.Mocked<SyncFromRemoteUseCase>;
	});

	it('emits start and stop around a successful cycle', async () => {
		const manager = new SyncManager(processUC, pullUC, network, {
			initialIntervalMs: 60_000,
		});

		const onStart = jest.fn();
		const onStop = jest.fn();
		manager.onStart(onStart);
		manager.onStop(onStop);

		await manager.processNow();

		expect(onStart).toHaveBeenCalled();
		expect(onStop).toHaveBeenCalled();
		expect(processUC.execute).toHaveBeenCalled();
		expect(pullUC.execute).toHaveBeenCalled();
	});

	it('respects offline status and increases backoff', async () => {
		network.isOnline.mockResolvedValueOnce(false);
		const manager = new SyncManager(processUC, pullUC, network, {
			initialIntervalMs: 1000,
			backoffMultiplier: 2,
			maxIntervalMs: 4000,
		});

		await manager.processNow();

		expect(processUC.execute).not.toHaveBeenCalled();
		expect(pullUC.execute).not.toHaveBeenCalled();
	});

	it('emits error when cycle fails', async () => {
		processUC.execute.mockRejectedValueOnce(new Error('boom'));
		const manager = new SyncManager(processUC, pullUC, network);
		const onError = jest.fn();
		manager.onError(onError);

		await manager.processNow();

		expect(onError).toHaveBeenCalled();
	});
});
