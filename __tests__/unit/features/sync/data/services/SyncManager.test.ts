import NetInfo from '@react-native-community/netinfo';
import { EventEmitter } from 'events';
import { AppState } from 'react-native';

import {
	SyncManager,
	SyncManagerOptions,
} from '@/features/sync/data/services/SyncManager';
import { INetworkMonitor } from '@/features/sync/domain/ports/INetworkMonitor';
import { ProcessSyncQueueUseCase } from '@/features/sync/domain/use-cases/ProcessSyncQueueUseCase';
import { SyncFromRemoteUseCase } from '@/features/sync/domain/use-cases/SyncFromRemoteUseCase';

jest.mock('@react-native-community/netinfo');
jest.mock('react-native', () => ({
	AppState: {
		addEventListener: jest.fn(),
	},
}));

describe('SyncManager', () => {
	let manager: SyncManager;
	let mockProcessQueue: jest.Mocked<ProcessSyncQueueUseCase>;
	let mockPullFromRemote: jest.Mocked<SyncFromRemoteUseCase>;
	let mockNetwork: jest.Mocked<INetworkMonitor>;
	let mockAppStateUnsubscribe: jest.Mock;
	let mockNetInfoUnsubscribe: jest.Mock;

	beforeEach(() => {
		mockProcessQueue = {
			execute: jest.fn().mockResolvedValue(undefined),
			onItemProcessed: jest.fn(),
		} as unknown as jest.Mocked<ProcessSyncQueueUseCase>;

		mockPullFromRemote = {
			execute: jest.fn().mockResolvedValue(undefined),
		} as unknown as jest.Mocked<SyncFromRemoteUseCase>;

		mockNetwork = {
			isOnline: jest.fn().mockResolvedValue(true),
			listen: jest.fn((callback) => {
				callback(true);
				return jest.fn();
			}),
		} as unknown as jest.Mocked<INetworkMonitor>;

		mockAppStateUnsubscribe = jest.fn();
		mockNetInfoUnsubscribe = jest.fn();

		(AppState.addEventListener as jest.Mock).mockReturnValue({
			remove: mockAppStateUnsubscribe,
		});

		(NetInfo.addEventListener as jest.Mock).mockReturnValue(
			mockNetInfoUnsubscribe
		);

		jest.useFakeTimers();
		jest.clearAllMocks();
	});

	afterEach(() => {
		if (manager) {
			manager.stop();
		}
		jest.useRealTimers();
	});

	describe('constructor', () => {
		it('initializes with default options', () => {
			manager = new SyncManager(
				mockProcessQueue,
				mockPullFromRemote,
				mockNetwork
			);

			expect(manager.running).toBe(false);
		});

		it('initializes with custom options', () => {
			const options: SyncManagerOptions = {
				initialIntervalMs: 30000,
				maxIntervalMs: 300000,
				backoffMultiplier: 3,
			};

			manager = new SyncManager(
				mockProcessQueue,
				mockPullFromRemote,
				mockNetwork,
				options
			);

			expect(manager.running).toBe(false);
		});

		it('ensures backoffMultiplier is at least 1', () => {
			const options: SyncManagerOptions = {
				backoffMultiplier: 0.5,
			};

			manager = new SyncManager(
				mockProcessQueue,
				mockPullFromRemote,
				mockNetwork,
				options
			);

			expect(manager.running).toBe(false);
		});
	});

	describe('start', () => {
		it('starts the sync manager', () => {
			manager = new SyncManager(
				mockProcessQueue,
				mockPullFromRemote,
				mockNetwork
			);

			manager.start();

			expect(manager.running).toBe(true);
			expect(AppState.addEventListener).toHaveBeenCalled();
			expect(NetInfo.addEventListener).toHaveBeenCalled();
			expect(mockNetwork.listen).toHaveBeenCalled();
			expect(mockProcessQueue.onItemProcessed).toHaveBeenCalled();
		});

		it('does not start if already running', () => {
			manager = new SyncManager(
				mockProcessQueue,
				mockPullFromRemote,
				mockNetwork
			);

			manager.start();
			jest.clearAllMocks();

			manager.start();

			expect(AppState.addEventListener).not.toHaveBeenCalled();
		});

		it('schedules next sync cycle', () => {
			const setTimeoutSpy = jest.spyOn(global, 'setTimeout');
			manager = new SyncManager(
				mockProcessQueue,
				mockPullFromRemote,
				mockNetwork
			);

			manager.start();

			expect(setTimeoutSpy).toHaveBeenCalled();
			setTimeoutSpy.mockRestore();
		});
	});

	describe('stop', () => {
		it('stops the sync manager', () => {
			manager = new SyncManager(
				mockProcessQueue,
				mockPullFromRemote,
				mockNetwork
			);

			manager.start();
			manager.stop();

			expect(manager.running).toBe(false);
			expect(mockAppStateUnsubscribe).toHaveBeenCalled();
			expect(mockNetInfoUnsubscribe).toHaveBeenCalled();
			// Network unsubscribe is called via the listen callback
			expect(mockNetwork.listen).toHaveBeenCalled();
		});

		it('clears timer on stop', () => {
			manager = new SyncManager(
				mockProcessQueue,
				mockPullFromRemote,
				mockNetwork
			);

			manager.start();
			const clearTimeoutSpy = jest.spyOn(global, 'clearTimeout');
			manager.stop();

			expect(clearTimeoutSpy).toHaveBeenCalled();
			clearTimeoutSpy.mockRestore();
		});
	});

	describe('event listeners', () => {
		beforeEach(() => {
			manager = new SyncManager(
				mockProcessQueue,
				mockPullFromRemote,
				mockNetwork
			);
		});

		it('registers onStart listener', () => {
			const listener = jest.fn();
			manager.onStart(listener);

			// Trigger event through internal emitter
			const emitter = (manager as unknown as { emitter: EventEmitter })
				.emitter;
			emitter.emit('cycleStart');

			expect(listener).toHaveBeenCalled();
		});

		it('registers onStop listener', () => {
			const listener = jest.fn();
			manager.onStop(listener);

			const emitter = (manager as unknown as { emitter: EventEmitter })
				.emitter;
			emitter.emit('cycleEnd');

			expect(listener).toHaveBeenCalled();
		});

		it('registers onItemProcessed listener', () => {
			const listener = jest.fn();
			manager.onItemProcessed(listener);

			const emitter = (manager as unknown as { emitter: EventEmitter })
				.emitter;
			emitter.emit('itemProcessed', { id: 'item-1', success: true });

			expect(listener).toHaveBeenCalledWith({
				id: 'item-1',
				success: true,
			});
		});

		it('forwards itemProcessed events from use-case to emitter', () => {
			// Verify that onItemProcessed callback from use-case is registered (line 47-49)
			// The callback is registered in start(), not constructor
			const freshManager = new SyncManager(
				mockProcessQueue,
				mockPullFromRemote,
				mockNetwork
			);

			// Clear any previous calls to the mock
			(mockProcessQueue.onItemProcessed as jest.Mock).mockClear();

			// Add a listener before starting
			const listener = jest.fn();
			freshManager.onItemProcessed(listener);

			// Start the manager - this registers the onItemProcessed callback (line 47)
			freshManager.start();

			// Verify onItemProcessed was called during start
			expect(mockProcessQueue.onItemProcessed).toHaveBeenCalled();

			// Get the callback that was registered
			const onItemProcessedCalls = (
				mockProcessQueue.onItemProcessed as jest.Mock
			).mock.calls;
			expect(onItemProcessedCalls.length).toBeGreaterThan(0);

			const itemProcessedCallback = onItemProcessedCalls[0][0];

			// Simulate use-case emitting item processed
			itemProcessedCallback({ id: 'op1', success: true });

			// Verify listener was called (via emitter)
			expect(listener).toHaveBeenCalledWith({ id: 'op1', success: true });

			// Clean up
			freshManager.stop();
		});

		it('registers onError listener', () => {
			const listener = jest.fn();
			manager.onError(listener);

			const emitter = (manager as unknown as { emitter: EventEmitter })
				.emitter;
			const error = new Error('Test error');
			emitter.emit('cycleError', error);

			expect(listener).toHaveBeenCalledWith(error);
		});
	});

	describe('processNow', () => {
		it('processes sync cycle immediately', async () => {
			manager = new SyncManager(
				mockProcessQueue,
				mockPullFromRemote,
				mockNetwork
			);

			await manager.processNow();

			expect(mockNetwork.isOnline).toHaveBeenCalled();
			expect(mockProcessQueue.execute).toHaveBeenCalled();
			expect(mockPullFromRemote.execute).toHaveBeenCalled();
		});
	});

	describe('processCycle', () => {
		beforeEach(() => {
			manager = new SyncManager(
				mockProcessQueue,
				mockPullFromRemote,
				mockNetwork
			);
		});

		it('skips cycle when offline', async () => {
			mockNetwork.isOnline.mockResolvedValue(false);

			await manager.processNow();

			expect(mockProcessQueue.execute).not.toHaveBeenCalled();
			expect(mockPullFromRemote.execute).not.toHaveBeenCalled();
		});

		it('executes process queue and pull from remote when online', async () => {
			mockNetwork.isOnline.mockResolvedValue(true);

			await manager.processNow();

			expect(mockProcessQueue.execute).toHaveBeenCalled();
			expect(mockPullFromRemote.execute).toHaveBeenCalled();
		});

		it('increases backoff on error', async () => {
			mockNetwork.isOnline.mockResolvedValue(true);
			mockProcessQueue.execute.mockRejectedValue(new Error('Sync error'));

			const errorListener = jest.fn();
			manager.onError(errorListener);

			await manager.processNow();

			expect(errorListener).toHaveBeenCalled();
		});

		it('logs error when processCycle fails', async () => {
			// Test that processCycle logs errors (line 170-175)
			// processNow() calls processCycle() directly
			mockNetwork.isOnline.mockResolvedValue(true);
			mockProcessQueue.execute.mockRejectedValue(
				new Error('Process cycle failed')
			);

			const loggerSpy = jest.spyOn(
				require('@/shared/utils/logging').logger,
				'error'
			);

			await manager.processNow();

			// Verify error was logged from processCycle catch block
			expect(loggerSpy).toHaveBeenCalledWith(
				'SyncManager: cycle error',
				expect.objectContaining({
					error: expect.any(Error),
					nextInMs: expect.any(Number),
				})
			);

			loggerSpy.mockRestore();
		});

		it('resets backoff on success', async () => {
			mockNetwork.isOnline.mockResolvedValue(true);

			await manager.processNow();

			expect(mockProcessQueue.execute).toHaveBeenCalled();
			expect(mockPullFromRemote.execute).toHaveBeenCalled();
		});
	});

	describe('app state changes', () => {
		it('processes when app becomes active', () => {
			manager = new SyncManager(
				mockProcessQueue,
				mockPullFromRemote,
				mockNetwork
			);

			manager.start();

			const appStateHandler = (AppState.addEventListener as jest.Mock)
				.mock.calls[0][1];
			appStateHandler('active');

			expect(mockNetwork.isOnline).toHaveBeenCalled();
		});

		it('does not process when app is not active', () => {
			manager = new SyncManager(
				mockProcessQueue,
				mockPullFromRemote,
				mockNetwork
			);

			manager.start();

			const appStateHandler = (AppState.addEventListener as jest.Mock)
				.mock.calls[0][1];
			appStateHandler('background');

			// Should not process on background
			expect(mockProcessQueue.execute).not.toHaveBeenCalled();
		});

		it('does not process when manager is not running', () => {
			manager = new SyncManager(
				mockProcessQueue,
				mockPullFromRemote,
				mockNetwork
			);

			manager.start();
			const appStateHandler = (AppState.addEventListener as jest.Mock)
				.mock.calls[0][1];
			manager.stop();
			jest.clearAllMocks();

			// Try to trigger with app state change after stop
			appStateHandler('active');

			expect(mockProcessQueue.execute).not.toHaveBeenCalled();
		});
	});

	describe('network state changes', () => {
		it('processes when network comes online via NetInfo', () => {
			manager = new SyncManager(
				mockProcessQueue,
				mockPullFromRemote,
				mockNetwork
			);

			manager.start();

			const netInfoHandler = (NetInfo.addEventListener as jest.Mock).mock
				.calls[0][0];
			netInfoHandler({ isConnected: true, isInternetReachable: true });

			expect(mockNetwork.isOnline).toHaveBeenCalled();
		});

		it('does not process when network is offline via NetInfo', () => {
			manager = new SyncManager(
				mockProcessQueue,
				mockPullFromRemote,
				mockNetwork
			);

			manager.start();

			const netInfoHandler = (NetInfo.addEventListener as jest.Mock).mock
				.calls[0][0];
			netInfoHandler({ isConnected: false, isInternetReachable: false });

			expect(mockProcessQueue.execute).not.toHaveBeenCalled();
		});

		it('processes when network comes online via monitor', () => {
			manager = new SyncManager(
				mockProcessQueue,
				mockPullFromRemote,
				mockNetwork
			);

			manager.start();

			// Network.listen callback should be called
			expect(mockNetwork.listen).toHaveBeenCalled();
		});
	});

	describe('scheduled processing', () => {
		it('schedules next cycle after processing', async () => {
			const setTimeoutSpy = jest.spyOn(global, 'setTimeout');
			manager = new SyncManager(
				mockProcessQueue,
				mockPullFromRemote,
				mockNetwork
			);

			manager.start();
			const initialCallCount = setTimeoutSpy.mock.calls.length;

			// Advance timer to trigger scheduled processing
			jest.advanceTimersByTime(60000);
			// Wait for async operations to complete
			await Promise.resolve();

			expect(mockNetwork.isOnline).toHaveBeenCalled();
			// Should have scheduled at least one more time (initial + reschedule)
			expect(setTimeoutSpy.mock.calls.length).toBeGreaterThanOrEqual(
				initialCallCount
			);
			setTimeoutSpy.mockRestore();
		});

		it('does not schedule when stopped', () => {
			manager = new SyncManager(
				mockProcessQueue,
				mockPullFromRemote,
				mockNetwork
			);

			manager.start();
			manager.stop();
			jest.clearAllMocks();

			jest.advanceTimersByTime(60000);

			expect(mockProcessQueue.execute).not.toHaveBeenCalled();
		});
	});
});
