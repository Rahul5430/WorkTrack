import { getAuth } from '@react-native-firebase/auth';

import { SyncError } from '../errors';
import { logger } from '../logging';
import { SyncStatusDTO } from '../types';
import { SyncFromRemoteUseCase } from './syncFromRemoteUseCase';
import { SyncToRemoteUseCase } from './syncToRemoteUseCase';

export interface SyncUseCase {
	execute(): Promise<void>;
	getSyncStatus(): Promise<SyncStatusDTO>;
}

export class SyncUseCaseImpl implements SyncUseCase {
	private isSyncing = false;
	private lastSyncTime: number | null = null;

	constructor(
		private readonly syncToRemote: SyncToRemoteUseCase,
		private readonly syncFromRemote: SyncFromRemoteUseCase
	) {}

	async execute(): Promise<void> {
		if (this.isSyncing) {
			logger.warn('Sync already in progress, skipping');
			return;
		}

		const currentUser = getAuth().currentUser;
		if (!currentUser) {
			throw new SyncError('User not authenticated', {
				code: 'auth.unauthenticated',
			});
		}

		this.isSyncing = true;
		logger.info('Starting sync process...');

		try {
			// First sync to remote (upload local changes)
			logger.info('Starting sync to remote (upload local changes)...');
			await this.syncToRemote.execute();
			logger.info('Sync to remote completed');

			// Small delay to ensure remote changes are propagated
			logger.debug('Waiting 1 second before sync from remote...');
			await new Promise((resolve) => setTimeout(resolve, 1000));

			// Then sync from remote (download remote changes)
			logger.info(
				'Starting sync from remote (download remote changes)...'
			);
			logger.debug('Calling syncFromRemote.execute with params', {
				userId: currentUser.uid,
				lastSyncTime: this.lastSyncTime ?? undefined,
			});

			await this.syncFromRemote.execute(
				currentUser.uid,
				this.lastSyncTime ?? undefined
			);
			logger.info('Sync from remote completed');

			// Update last sync time
			logger.debug('Updating last sync time...');
			this.lastSyncTime = Date.now();

			logger.info('Sync process completed successfully');
		} catch (error) {
			logger.error('Sync process failed', { error });
			throw error;
		} finally {
			logger.debug('Setting isSyncing to false...');
			this.isSyncing = false;
		}
	}

	async getSyncStatus(): Promise<SyncStatusDTO> {
		return {
			isSyncing: this.isSyncing,
			isOnline: true,
			lastSyncTime: this.lastSyncTime ?? undefined,
			error: undefined,
		};
	}
}

export function createSyncUseCase(
	syncToRemote: SyncToRemoteUseCase,
	syncFromRemote: SyncFromRemoteUseCase
): SyncUseCase {
	return new SyncUseCaseImpl(syncToRemote, syncFromRemote);
}
