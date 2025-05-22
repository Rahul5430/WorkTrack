import { Q } from '@nozbe/watermelondb';

import { database } from '../db/watermelon';
import WorkTrack from '../db/watermelon/worktrack/model';

export class SyncService {
	private static instance: SyncService;
	private isSyncing: boolean = false;
	private syncInterval: NodeJS.Timeout | null = null;

	private constructor() {}

	static getInstance(): SyncService {
		if (!SyncService.instance) {
			SyncService.instance = new SyncService();
		}
		return SyncService.instance;
	}

	async startPeriodicSync(intervalMs: number = 5 * 60 * 1000) {
		if (this.syncInterval) {
			clearInterval(this.syncInterval);
		}
		this.syncInterval = setInterval(() => {
			this.syncToFirebase();
		}, intervalMs);
	}

	stopPeriodicSync() {
		if (this.syncInterval) {
			clearInterval(this.syncInterval);
			this.syncInterval = null;
		}
	}

	async syncToFirebase() {
		if (this.isSyncing) return;

		try {
			this.isSyncing = true;
			const unsynced = await database.collections
				.get<WorkTrack>('work_tracks')
				.query(Q.where('synced', false))
				.fetch();

			for (const record of unsynced) {
				try {
					// TODO: Replace with actual Firebase sync when backend is ready
					// await firebase.firestore()
					//   .collection('work_tracks')
					//   .doc(record.id)
					//   .set({
					//     date: record.date,
					//     status: record.status,
					//     userId: auth.currentUser?.uid,
					//     lastModified: record.lastModified
					//   });

					await record.update((r) => {
						r.synced = true;
						r.syncError = undefined;
					});
				} catch (error) {
					console.error('Sync error for record:', record.id, error);
					await record.update((r) => {
						r.syncError =
							error instanceof Error
								? error.message
								: 'Unknown error';
					});
				}
			}
		} catch (error) {
			console.error('Sync service error:', error);
		} finally {
			this.isSyncing = false;
		}
	}

	async queueSync(date: string) {
		try {
			const record = await database.collections
				.get<WorkTrack>('work_tracks')
				.query(Q.where('date', date))
				.fetch();

			if (record.length > 0) {
				await record[0].update((r) => {
					r.synced = false;
					r.lastModified = Date.now();
				});
			}
		} catch (error) {
			console.error('Error queueing sync:', error);
		}
	}
}
