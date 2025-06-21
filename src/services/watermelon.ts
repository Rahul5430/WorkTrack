import { Q } from '@nozbe/watermelondb';
import { writer } from '@nozbe/watermelondb/decorators';

import { TrackerType } from '../constants/trackerTypes';
import { database, SharedTracker, Tracker, WorkTrack } from '../db/watermelon';
import { MarkedDayStatus } from '../types/calendar';
import { TrackerData, TrackerEntryData } from './firebase';

export default class WatermelonService {
	private static instance: WatermelonService;
	private isDatabaseReady: boolean = false;

	private constructor() {}

	static getInstance(): WatermelonService {
		if (!WatermelonService.instance) {
			WatermelonService.instance = new WatermelonService();
		}
		return WatermelonService.instance;
	}

	// Get fresh database instance to avoid context issues
	private getDatabaseInstance() {
		try {
			// Import database fresh each time to avoid context issues
			const { database: db } = require('../db/watermelon') as {
				database: any;
			};
			return db;
		} catch (error) {
			console.error('Failed to get database instance:', error);
			return null;
		}
	}

	// Initialize database and ensure it's ready
	async ensureDatabaseReady(): Promise<void> {
		console.log(
			'ensureDatabaseReady called, isDatabaseReady:',
			this.isDatabaseReady
		);
		if (this.isDatabaseReady) return;

		const maxRetries = 3;
		const retryDelay = 1000; // 1 second

		for (let attempt = 1; attempt <= maxRetries; attempt++) {
			try {
				console.log(
					`Database initialization attempt ${attempt}/${maxRetries}`
				);

				const db = this.getDatabaseInstance();
				console.log('ensureDatabaseReady - database object:', db);
				console.log('ensureDatabaseReady - database type:', typeof db);
				console.log(
					'ensureDatabaseReady - database.write type:',
					typeof db?.write
				);

				// Check if database object exists
				if (!db) {
					throw new Error('Database object is undefined');
				}

				// Check if database.write method exists
				if (typeof db.write !== 'function') {
					throw new Error('Database write method is not available');
				}

				console.log('About to call db.write...');
				// Test database access by performing a simple write operation
				await db.write(async () => {
					// This will trigger database initialization if not already done
					console.log('Database is ready');
				});

				this.isDatabaseReady = true;
				console.log('Database initialization successful');
				return;
			} catch (error) {
				console.error(
					`Database initialization attempt ${attempt} failed:`,
					error
				);
				const db = this.getDatabaseInstance();
				console.error('Database object:', db);
				console.error('Database type:', typeof db);
				if (db) {
					console.error(
						'Database methods:',
						Object.getOwnPropertyNames(db)
					);
				}

				if (attempt === maxRetries) {
					throw new Error(
						`Failed to initialize database after ${maxRetries} attempts: ${error}`
					);
				}

				// Wait before retrying
				await new Promise((resolve) => setTimeout(resolve, retryDelay));
			}
		}
	}

	// Tracker Management
	@writer
	async createTracker(data: {
		name: string;
		color: string;
		trackerType: TrackerType;
		ownerId: string;
	}) {
		console.log('createTracker called with data:', data);

		await this.ensureDatabaseReady();

		const { name, color, trackerType, ownerId } = data;

		// Check if any trackers exist to determine if this should be default
		const existingTrackers = await database
			.get<Tracker>('trackers')
			.query()
			.fetch();
		const isDefault = existingTrackers.length === 0;

		console.log(
			'createTracker - Creating tracker with isDefault:',
			isDefault
		);

		// Create the new tracker
		const newTracker = await database
			.get<Tracker>('trackers')
			.create((tracker) => {
				tracker.name = name;
				tracker.color = color;
				tracker.ownerId = ownerId;
				tracker.isDefault = isDefault;
				tracker.trackerType = trackerType;
			});

		console.log(
			'createTracker - Successfully created tracker:',
			newTracker
		);
		return newTracker;
	}

	@writer
	async createOrUpdateTrackers(trackersData: TrackerData[]) {
		await this.ensureDatabaseReady();

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
		await this.ensureDatabaseReady();

		// Double-check database availability
		if (!database || typeof database.write !== 'function') {
			throw new Error('Database not properly initialized');
		}

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
		await this.ensureDatabaseReady();

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
		await this.ensureDatabaseReady();

		return await database
			.get<WorkTrack>('work_tracks')
			.query(Q.where('needs_sync', true))
			.fetch();
	}

	async getFailedSyncRecords(): Promise<WorkTrack[]> {
		await this.ensureDatabaseReady();

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
		await this.ensureDatabaseReady();

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
		await this.ensureDatabaseReady();

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
		await this.ensureDatabaseReady();

		return await database
			.get<WorkTrack>('work_tracks')
			.query(
				Q.where('needs_sync', true),
				Q.where('sync_error', Q.notEq(null)),
				Q.where('retry_count', Q.gte(maxRetries))
			)
			.fetch();
	}

	// Get entries for a specific tracker
	async getEntriesForTracker(trackerId: string): Promise<WorkTrack[]> {
		console.log('getEntriesForTracker called with trackerId:', trackerId);

		await this.ensureDatabaseReady();

		const db = this.getDatabaseInstance();
		console.log('getEntriesForTracker - database object:', db);
		console.log('getEntriesForTracker - database type:', typeof db);

		// Double-check database availability
		if (!db || typeof db.write !== 'function') {
			console.error(
				'getEntriesForTracker - Database not properly initialized'
			);
			console.error('getEntriesForTracker - database object:', db);
			console.error('getEntriesForTracker - database type:', typeof db);
			throw new Error('Database not properly initialized');
		}

		return await database
			.get<WorkTrack>('work_tracks')
			.query(Q.where('tracker_id', trackerId))
			.fetch();
	}

	// Reset retry count for successful syncs
	@writer
	async resetRetryCount(records: WorkTrack[]) {
		await this.ensureDatabaseReady();

		const db = this.getDatabaseInstance();
		// Double-check database availability
		if (!db || typeof db.write !== 'function') {
			throw new Error('Database not properly initialized');
		}

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
		console.log('getTrackerById called with trackerId:', trackerId);

		await this.ensureDatabaseReady();

		const db = this.getDatabaseInstance();
		console.log('getTrackerById - database object:', db);
		console.log('getTrackerById - database type:', typeof db);

		// Double-check database availability
		if (!db || typeof db.write !== 'function') {
			console.error('getTrackerById - Database not properly initialized');
			console.error('getTrackerById - database object:', db);
			console.error('getTrackerById - database type:', typeof db);
			throw new Error('Database not properly initialized');
		}

		try {
			return await database.get<Tracker>('trackers').find(trackerId);
		} catch {
			return null;
		}
	}

	// Get trackers owned by the user
	async getMyTrackers(userId: string): Promise<Tracker[]> {
		await this.ensureDatabaseReady();
		return await database
			.get<Tracker>('trackers')
			.query(Q.where('owner_id', userId))
			.fetch();
	}

	// Get trackers shared by the user (with sharing info)
	async getTrackersSharedByMe(userId: string): Promise<
		{
			tracker: Tracker;
			share: SharedTracker;
		}[]
	> {
		await this.ensureDatabaseReady();

		// Get all trackers owned by the user
		const myTrackers = await this.getMyTrackers(userId);

		// Get all shares for these trackers
		const shares = await database
			.get<SharedTracker>('shared_trackers')
			.query(Q.where('tracker_id', Q.oneOf(myTrackers.map((t) => t.id))))
			.fetch();

		// Group shares by tracker
		const sharesByTracker = new Map<string, SharedTracker[]>();
		shares.forEach((share) => {
			if (!sharesByTracker.has(share.trackerId)) {
				sharesByTracker.set(share.trackerId, []);
			}
			sharesByTracker.get(share.trackerId)!.push(share);
		});

		// Combine trackers with their shares
		const result: { tracker: Tracker; share: SharedTracker }[] = [];
		myTrackers.forEach((tracker) => {
			const trackerShares = sharesByTracker.get(tracker.id) || [];
			trackerShares.forEach((share) => {
				result.push({ tracker, share });
			});
		});

		return result;
	}

	// Get trackers shared with the user (with sharing info)
	async getTrackersSharedWithMe(userId: string): Promise<
		{
			tracker: Tracker;
			share: SharedTracker;
		}[]
	> {
		await this.ensureDatabaseReady();

		// Get all shares where the user is the recipient
		const shares = await database
			.get<SharedTracker>('shared_trackers')
			.query(Q.where('shared_with', userId))
			.fetch();

		// Get the corresponding trackers
		const result: { tracker: Tracker; share: SharedTracker }[] = [];
		for (const share of shares) {
			try {
				const tracker = await database
					.get<Tracker>('trackers')
					.find(share.trackerId);
				if (tracker) {
					result.push({ tracker, share });
				}
			} catch {
				// Tracker not found, skip this share
				console.warn(
					`Tracker ${share.trackerId} not found for share ${share.id}`
				);
			}
		}

		return result;
	}
}
