import { Q } from '@nozbe/watermelondb';

import { database } from '../db/watermelon';
import Sharing from '../db/watermelon/sharing/model';
import WorkTrack from '../db/watermelon/worktrack/model';
import { MarkedDayStatus } from '../types/calendar';

export interface SharePermission {
	ownerId: string;
	sharedWithId: string;
	sharedWithEmail: string;
	permission: 'read' | 'write';
}

export default class WatermelonService {
	private static instance: WatermelonService;

	private constructor() {}

	static getInstance(): WatermelonService {
		if (!WatermelonService.instance) {
			WatermelonService.instance = new WatermelonService();
		}
		return WatermelonService.instance;
	}

	async createShare(shareData: SharePermission): Promise<void> {
		await database.write(async () => {
			await database.collections.get<Sharing>('sharing').create((s) => {
				s.ownerId = shareData.ownerId;
				s.sharedWithId = shareData.sharedWithId;
				s.sharedWithEmail = shareData.sharedWithEmail;
				s.permission = shareData.permission;
				s.createdAt = new Date();
				s.updatedAt = new Date();
			});
		});
	}

	async removeShare(ownerId: string, sharedWithId: string): Promise<void> {
		const localShares = await database.collections
			.get<Sharing>('sharing')
			.query(
				Q.where('owner_id', ownerId),
				Q.where('shared_with_id', sharedWithId)
			)
			.fetch();

		await database.write(async () => {
			for (const share of localShares) {
				await share.destroyPermanently();
			}
		});
	}

	async updateSharePermission(
		ownerId: string,
		sharedWithId: string,
		newPermission: 'read' | 'write'
	): Promise<void> {
		const localShares = await database.collections
			.get<Sharing>('sharing')
			.query(
				Q.where('owner_id', ownerId),
				Q.where('shared_with_id', sharedWithId)
			)
			.fetch();

		await database.write(async () => {
			for (const share of localShares) {
				await share.update((s) => {
					s.permission = newPermission;
					s.updatedAt = new Date();
				});
			}
		});
	}

	async getUnsyncedRecords(): Promise<WorkTrack[]> {
		return database.collections
			.get<WorkTrack>('work_tracks')
			.query(Q.where('synced', false))
			.fetch();
	}

	async updateRecordSyncStatus(
		record: WorkTrack,
		synced: boolean,
		error?: string
	): Promise<void> {
		await database.write(async () => {
			await record.update((r) => {
				r.synced = synced;
				r.syncError = error;
			});
		});
	}

	async createOrUpdateRecord(data: {
		date: string;
		status: MarkedDayStatus;
		lastModified: number;
	}): Promise<void> {
		const existingRecord = await database.collections
			.get<WorkTrack>('work_tracks')
			.query(Q.where('date', data.date))
			.fetch();

		await database.write(async () => {
			if (existingRecord.length > 0) {
				const localRecord = existingRecord[0];
				if (data.lastModified > localRecord.lastModified) {
					await localRecord.update((r) => {
						r.status = data.status;
						r.lastModified = data.lastModified;
						r.synced = true;
						r.syncError = undefined;
					});
				}
			} else {
				await database.collections
					.get<WorkTrack>('work_tracks')
					.create((r) => {
						r.date = data.date;
						r.status = data.status;
						r.lastModified = data.lastModified;
						r.synced = true;
					});
			}
		});
	}

	async resetDatabase(): Promise<void> {
		await database.write(async () => {
			await database.unsafeResetDatabase();
		});
	}
}
