import { Q } from '@nozbe/watermelondb';
import { writer } from '@nozbe/watermelondb/decorators';

import { TrackerType } from '../constants/trackerTypes';
import { database, SharedTracker, Tracker, WorkTrack } from '../db/watermelon';
import { MarkedDayStatus } from '../types/calendar';
import { TrackerData, TrackerEntryData } from './firebase';

export default class WatermelonService {
	private static instance: WatermelonService;
	private constructor() {}

	static getInstance(): WatermelonService {
		if (!WatermelonService.instance) {
			WatermelonService.instance = new WatermelonService();
		}
		return WatermelonService.instance;
	}

	// Tracker Management
	@writer
	async createTracker(data: {
		name: string;
		color: string;
		trackerType: TrackerType;
		ownerId: string;
	}) {
		const { name, color, trackerType, ownerId } = data;
		const existingTrackers = await database
			.get<Tracker>('trackers')
			.query()
			.fetch();
		const isDefault = existingTrackers.length === 0;

		const newTracker = await database
			.get<Tracker>('trackers')
			.create((tracker) => {
				tracker.name = name;
				tracker.color = color;
				tracker.ownerId = ownerId;
				tracker.isDefault = isDefault;
				tracker.trackerType = trackerType;
			});
		return newTracker;
	}

	@writer
	async createOrUpdateTrackers(trackersData: TrackerData[]) {
		const trackerCollection = database.get<Tracker>('trackers');

		for (const data of trackersData) {
			const existing = await trackerCollection
				.find(data.id)
				.catch(() => null);
			if (existing) {
				await existing.update((tracker) => {
					tracker.name = data.name;
					tracker.color = data.color;
					tracker.isDefault = data.isDefault;
				});
			} else {
				await trackerCollection.create((tracker) => {
					tracker._raw.id = data.id;
					tracker.name = data.name;
					tracker.color = data.color;
					tracker.ownerId = data.ownerId;
					tracker.isDefault = data.isDefault;
					tracker.trackerType = data.trackerType;
					tracker.createdAt = data.createdAt.toDate();
				});
			}
		}
	}

	// Entry Management
	@writer
	async createOrUpdateRecord(data: {
		trackerId: string;
		date: string;
		status: string;
		isAdvisory: boolean;
	}) {
		const { trackerId, date, status, isAdvisory } = data;
		const workTracks = database.get<WorkTrack>('work_tracks');
		const existingRecord = await workTracks
			.query(Q.where('date', date), Q.where('tracker_id', trackerId))
			.fetch();

		const now = Date.now();

		if (existingRecord.length > 0) {
			return await existingRecord[0].update((record: WorkTrack) => {
				record.status = status as MarkedDayStatus;
				record.isAdvisory = isAdvisory;
				record.needsSync = true;
				record.lastModified = now;
				record.syncError = undefined;
			});
		} else {
			return await workTracks.create((record: WorkTrack) => {
				record.trackerId = trackerId;
				record.date = date;
				record.status = status as MarkedDayStatus;
				record.isAdvisory = isAdvisory;
				record.needsSync = true;
				record.lastModified = now;
				record.syncError = undefined;
			});
		}
	}

	@writer
	async createOrUpdateEntries(
		trackerId: string,
		entries: TrackerEntryData[]
	) {
		const workTracks = database.get<WorkTrack>('work_tracks');

		for (const entry of entries) {
			const existing = await workTracks
				.query(
					Q.where('date', entry.date),
					Q.where('tracker_id', trackerId)
				)
				.fetch();

			const firebaseTimestamp = entry.lastModified.toMillis();

			if (existing.length > 0) {
				const record = existing[0];
				// Only update if Firebase version is newer (conflict resolution)
				if (record.lastModified < firebaseTimestamp) {
					await record.update((rec: WorkTrack) => {
						rec.status = entry.status;
						rec.isAdvisory = entry.isAdvisory;
						rec.needsSync = false; // Data is from server, already synced
						rec.lastModified = firebaseTimestamp;
						rec.syncError = undefined; // Clear any previous sync errors
					});
				}
			} else {
				await workTracks.create((rec: WorkTrack) => {
					rec.trackerId = trackerId;
					rec.date = entry.date;
					rec.status = entry.status;
					rec.isAdvisory = entry.isAdvisory;
					rec.createdAt = entry.createdAt.toDate();
					rec.lastModified = firebaseTimestamp;
					rec.needsSync = false; // Data is from server, already synced
					rec.syncError = undefined;
				});
			}
		}
	}

	// Sync Management
	async getUnsyncedRecords(): Promise<WorkTrack[]> {
		return await database
			.get<WorkTrack>('work_tracks')
			.query(Q.where('needs_sync', true))
			.fetch();
	}

	async getFailedSyncRecords(): Promise<WorkTrack[]> {
		return await database
			.get<WorkTrack>('work_tracks')
			.query(
				Q.where('needs_sync', true),
				Q.where('sync_error', Q.notEq(null))
			)
			.fetch();
	}

	@writer
	async markRecordsAsSynced(records: WorkTrack[]) {
		for (const record of records) {
			await record.update((rec: WorkTrack) => {
				rec.needsSync = false;
				rec.syncError = undefined;
				rec.retryCount = 0; // Reset retry count on successful sync
			});
		}
	}

	@writer
	async markRecordsWithSyncError(records: WorkTrack[], errorMessage: string) {
		for (const record of records) {
			await record.update((rec: WorkTrack) => {
				rec.needsSync = true; // Keep it marked for retry
				rec.syncError = errorMessage;
				// Increment retry count for tracking
				rec.retryCount = (rec.retryCount ?? 0) + 1;
			});
		}
	}

	// Get records that have exceeded retry limit
	async getRecordsExceedingRetryLimit(
		maxRetries: number = 3
	): Promise<WorkTrack[]> {
		return await database
			.get<WorkTrack>('work_tracks')
			.query(
				Q.where('needs_sync', true),
				Q.where('retry_count', Q.gte(maxRetries))
			)
			.fetch();
	}

	// Reset retry count for successful syncs
	@writer
	async resetRetryCount(records: WorkTrack[]) {
		for (const record of records) {
			await record.update((rec: WorkTrack) => {
				rec.retryCount = 0;
			});
		}
	}

	// Test method: Create a sync error for testing retry functionality
	@writer
	async createTestSyncError(
		date: string,
		trackerId: string,
		errorMessage: string = 'Test sync error'
	) {
		const workTracks = database.get<WorkTrack>('work_tracks');
		const existing = await workTracks
			.query(Q.where('date', date), Q.where('tracker_id', trackerId))
			.fetch();

		if (existing.length > 0) {
			await existing[0].update((rec: WorkTrack) => {
				rec.needsSync = true;
				rec.syncError = errorMessage;
			});
		} else {
			await workTracks.create((rec: WorkTrack) => {
				rec.trackerId = trackerId;
				rec.date = date;
				rec.status = 'wfh';
				rec.isAdvisory = false;
				rec.needsSync = true;
				rec.syncError = errorMessage;
				rec.lastModified = Date.now();
			});
		}
	}

	// Sharing Management
	@writer
	async shareTracker(
		trackerId: string,
		sharedWithId: string,
		permission: 'read' | 'write'
	) {
		return await database
			.get<SharedTracker>('shared_trackers')
			.create((share) => {
				share.trackerId = trackerId;
				share.sharedWith = sharedWithId;
				share.permission = permission;
			});
	}

	@writer
	async removeShare(trackerId: string, sharedWithId: string) {
		const shares = await database
			.get<SharedTracker>('shared_trackers')
			.query(
				Q.where('tracker_id', trackerId),
				Q.where('shared_with', sharedWithId)
			)
			.fetch();

		if (shares.length > 0) {
			await shares[0].destroyPermanently();
		}
	}

	async updateSharePermission(
		trackerId: string,
		sharedWithId: string,
		permission: 'read' | 'write'
	) {
		const shares = await database
			.get<SharedTracker>('shared_trackers')
			.query(
				Q.where('tracker_id', trackerId),
				Q.where('shared_with', sharedWithId)
			)
			.fetch();

		if (shares.length > 0) {
			await shares[0].update((share) => {
				share.permission = permission;
			});
		}
	}

	// Utility: Fetch all trackers for a user (owned and shared)
	async getAllTrackersForUser(userId: string): Promise<Tracker[]> {
		// Owned trackers
		const owned = await database
			.get<Tracker>('trackers')
			.query(Q.where('owner_id', userId))
			.fetch();
		// Shared trackers
		const sharedLinks = await database
			.get<SharedTracker>('shared_trackers')
			.query(Q.where('shared_with', userId))
			.fetch();
		const shared: Tracker[] = [];
		for (const link of sharedLinks) {
			const tracker = await database
				.get<Tracker>('trackers')
				.find(link.trackerId)
				.catch(() => null);
			if (tracker) shared.push(tracker);
		}
		// Deduplicate by id
		const all = [...owned, ...shared];
		const seen = new Set<string>();
		return all.filter((t) => {
			if (seen.has(t.id)) return false;
			seen.add(t.id);
			return true;
		});
	}

	// Utility: Fetch a single tracker by ID
	async getTrackerById(trackerId: string): Promise<Tracker | null> {
		try {
			return await database.get<Tracker>('trackers').find(trackerId);
		} catch {
			return null;
		}
	}
}
