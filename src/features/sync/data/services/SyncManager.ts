import NetInfo from '@react-native-community/netinfo';
import { EventEmitter } from 'events';
import { AppState, AppStateStatus } from 'react-native';

import { logger } from '@/shared/utils/logging';

import { INetworkMonitor } from '../../domain/ports/INetworkMonitor';
import { ProcessSyncQueueUseCase } from '../../domain/use-cases/ProcessSyncQueueUseCase';
import { SyncFromRemoteUseCase } from '../../domain/use-cases/SyncFromRemoteUseCase';

export interface SyncManagerOptions {
	initialIntervalMs?: number;
	maxIntervalMs?: number;
	backoffMultiplier?: number;
	batchSize?: number;
}

export class SyncManager {
	private timer: ReturnType<typeof setTimeout> | null = null;
	running = false;
	private currentIntervalMs: number;
	private readonly maxIntervalMs: number;
	private readonly backoffMultiplier: number;
	// Reserved for tuning batch size; currently managed in use-case
	private readonly emitter = new EventEmitter();
	private appStateSubscription: { remove: () => void } | null = null;
	private netInfoUnsubscribe: (() => void) | null = null;

	constructor(
		private readonly processQueue: ProcessSyncQueueUseCase,
		private readonly pullFromRemote: SyncFromRemoteUseCase,
		private readonly network: INetworkMonitor,
		options: SyncManagerOptions = {}
	) {
		this.currentIntervalMs = options.initialIntervalMs ?? 60_000;
		this.maxIntervalMs = options.maxIntervalMs ?? 5 * 60_000;
		this.backoffMultiplier = Math.max(1, options.backoffMultiplier ?? 2);
		// Batch size is currently managed inside the ProcessSyncQueueUseCase
	}

	start(): void {
		if (this.running) return;
		this.running = true;
		logger.info('SyncManager: starting');

		// Forward per-item events from use-case
		this.processQueue.onItemProcessed(({ id, success }) => {
			this.emitter.emit('itemProcessed', { id, success });
		});

		// Trigger on AppState foreground
		this.appStateSubscription = AppState.addEventListener(
			'change',
			(state: AppStateStatus) => {
				if (!this.running) return;
				if (state === 'active') {
					logger.info(
						'SyncManager: app foregrounded, processing now'
					);
					this.processNowSafe().catch(() => {});
				}
			}
		);

		// Trigger on network changes via NetInfo
		this.netInfoUnsubscribe = NetInfo.addEventListener((state) => {
			if (!this.running) return;
			const online = Boolean(
				state.isConnected && state.isInternetReachable !== false
			);
			if (online) {
				logger.info('SyncManager: network online, processing now');
				this.processNowSafe().catch(() => {});
			}
		});

		// Also use abstraction if provided
		this.network.listen(async (online) => {
			if (!this.running) return;
			if (online) {
				logger.info(
					'SyncManager: network online (monitor), processing now'
				);
				await this.processNowSafe();
			}
		});
		this.scheduleNext();
	}

	stop(): void {
		this.running = false;
		if (this.timer) clearTimeout(this.timer);
		this.timer = null;
		if (this.appStateSubscription) {
			this.appStateSubscription.remove();
			this.appStateSubscription = null;
		}
		if (this.netInfoUnsubscribe) {
			this.netInfoUnsubscribe();
			this.netInfoUnsubscribe = null;
		}
		logger.info('SyncManager: stopped');
	}

	onStart(listener: () => void): void {
		this.emitter.on('cycleStart', listener);
	}

	onStop(listener: () => void): void {
		this.emitter.on('cycleEnd', listener);
	}

	onItemProcessed(listener: (payload: unknown) => void): void {
		this.emitter.on('itemProcessed', listener);
	}

	onError(listener: (error: unknown) => void): void {
		this.emitter.on('cycleError', listener);
	}

	async processNow(): Promise<void> {
		await this.processCycle();
	}

	private async processNowSafe(): Promise<void> {
		try {
			await this.processCycle();
		} catch (error) {
			logger.error('SyncManager: process failed', { error });
		}
	}

	private scheduleNext(): void {
		if (!this.running) return;
		this.timer = setTimeout(async () => {
			await this.processNowSafe();
			this.scheduleNext();
		}, this.currentIntervalMs);
	}

	private increaseBackoff(): void {
		this.currentIntervalMs = Math.min(
			Math.floor(this.currentIntervalMs * this.backoffMultiplier),
			this.maxIntervalMs
		);
	}

	private resetBackoff(): void {
		// Keep initial interval modest for responsiveness
		this.currentIntervalMs = 15_000;
	}

	private async processCycle(): Promise<void> {
		const online = await this.network.isOnline();
		if (!online) {
			logger.info('SyncManager: offline, skipping cycle');
			this.increaseBackoff();
			return;
		}

		try {
			// Push pending local operations
			this.emitter.emit('cycleStart');
			await this.processQueue.execute();
			// Pull remote changes
			await this.pullFromRemote.execute();
			this.resetBackoff();
			logger.info('SyncManager: cycle completed');
			this.emitter.emit('cycleEnd');
		} catch (error) {
			this.increaseBackoff();
			logger.error('SyncManager: cycle error', {
				error,
				nextInMs: this.currentIntervalMs,
			});
			this.emitter.emit('cycleError', error);
		}
	}
}
