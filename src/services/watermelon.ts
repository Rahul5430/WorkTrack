import { Database, Q } from '@nozbe/watermelondb';
import AsyncStorage from '@react-native-async-storage/async-storage';

import { TRACKER_TYPES, TrackerType } from '../constants/trackerTypes';
import { SharedTracker, Tracker, WorkTrack } from '../db/watermelon';
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
	private getDatabaseInstance(): Database | null {
		try {
			// Import database fresh each time to avoid context issues
			const { database: db } = require('../db/watermelon') as {
				database: Database;
			};
			return db;
		} catch (error) {
			console.error('Failed to get database instance:', error);
			return null;
		}
	}

	// Initialize database and ensure it's ready
	async ensureDatabaseReady(): Promise<void> {
		if (this.isDatabaseReady) return;

		const maxRetries = 3;
		const retryDelay = 1000; // 1 second

		for (let attempt = 1; attempt <= maxRetries; attempt++) {
			try {
				console.log(
					`Database initialization attempt ${attempt}/${maxRetries}`
				);

				const db = this.getDatabaseInstance();

				// Check if database object exists
				if (!db) {
					throw new Error('Database object is undefined');
				}

				// Check if database.write method exists
				if (typeof db.write !== 'function') {
					throw new Error('Database write method is not available');
				}

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
					// On final attempt, try to reset the database
					console.log(
						'Attempting database reset due to initialization failure...'
					);
					try {
						await this.forceDatabaseReset();
						this.isDatabaseReady = true;
						console.log('Database reset successful');
						return;
					} catch (resetError) {
						console.error('Database reset failed:', resetError);
						throw new Error(
							`Failed to initialize database after ${maxRetries} attempts and reset: ${error}`
						);
					}
				}

				// Wait before retrying
				await new Promise((resolve) => setTimeout(resolve, retryDelay));
			}
		}
	}

	// Force database reset (use with caution)
	async forceDatabaseReset(): Promise<void> {
		console.log('Force resetting database...');

		const db = this.getDatabaseInstance();
		if (!db) {
			throw new Error('Database not available for reset');
		}

		// Clear all data from all tables
		await db.write(async () => {
			// Clear work_tracks
			const workTracks = await db
				.get<WorkTrack>('work_tracks')
				.query()
				.fetch();
			for (const record of workTracks) {
				await record.destroyPermanently();
			}

			// Clear trackers
			const trackers = await db.get<Tracker>('trackers').query().fetch();
			for (const record of trackers) {
				await record.destroyPermanently();
			}

			// Clear shared_trackers
			const sharedTrackers = await db
				.get<SharedTracker>('shared_trackers')
				.query()
				.fetch();
			for (const record of sharedTrackers) {
				await record.destroyPermanently();
			}
		});

		console.log('Database reset completed');
	}

	// Tracker Management
	async createTracker(data: {
		name: string;
		color: string;
		trackerType: TrackerType;
		ownerId: string;
	}) {
		await this.ensureDatabaseReady();

		const db = this.getDatabaseInstance();
		if (!db) {
			throw new Error('Database not available');
		}

		const { name, color, trackerType, ownerId } = data;

		return await db.write(async () => {
			// Check if any trackers exist to determine if this should be default
			const existingTrackers = await db
				.get<Tracker>('trackers')
				.query()
				.fetch();
			const isDefault = existingTrackers.length === 0;

			// Create the new tracker
			const newTracker = await db
				.get<Tracker>('trackers')
				.create((tracker: Tracker) => {
					tracker.name = name;
					tracker.color = color;
					tracker.ownerId = ownerId;
					tracker.isDefault = isDefault;
					tracker.trackerType = trackerType;
				});

			return newTracker;
		});
	}

	async createOrUpdateTrackers(trackersData: TrackerData[]) {
		await this.ensureDatabaseReady();

		const db = this.getDatabaseInstance();
		if (!db) {
			throw new Error('Database not available');
		}

		return await db.write(async () => {
			const trackerCollection = db.get<Tracker>('trackers');

			for (const data of trackersData) {
				const existing = await trackerCollection
					.find(data.id)
					.catch(() => null);
				if (existing) {
					await existing.update((tracker: Tracker) => {
						tracker.name = data.name;
						tracker.color = data.color;
						tracker.isDefault = data.isDefault;
					});
				} else {
					await trackerCollection.create((tracker: Tracker) => {
						tracker._raw.id = data.id;
						tracker.name = data.name;
						tracker.color = data.color;
						tracker.ownerId = data.ownerId;
						tracker.isDefault = data.isDefault;
						tracker.trackerType = data.trackerType;
						// Don't set createdAt as it's readonly - WatermelonDB will set it automatically
					});
				}
			}
		});
	}

	// Entry Management
	async createOrUpdateRecord(data: {
		trackerId: string;
		date: string;
		status: string;
		isAdvisory: boolean;
	}) {
		await this.ensureDatabaseReady();

		const db = this.getDatabaseInstance();
		if (!db) {
			throw new Error('Database not available');
		}

		// Double-check database availability
		if (!db || typeof db.write !== 'function') {
			throw new Error('Database not properly initialized');
		}

		const { trackerId, date, status, isAdvisory } = data;

		// Add validation and logging
		if (!trackerId) {
			console.error(
				'createOrUpdateRecord: trackerId is missing or empty:',
				{ trackerId, date, status, isAdvisory }
			);
			throw new Error(
				'trackerId is required for creating/updating records'
			);
		}

		console.log(
			`createOrUpdateRecord: Creating/updating record with trackerId: ${trackerId}, date: ${date}`
		);

		return await db.write(async () => {
			const workTracks = db.get<WorkTrack>('work_tracks');
			const existingRecord = await workTracks
				.query(Q.where('date', date), Q.where('tracker_id', trackerId))
				.fetch();

			const now = Date.now();

			if (existingRecord.length > 0) {
				console.log(
					`createOrUpdateRecord: Updating existing record for trackerId: ${trackerId}, date: ${date}`
				);
				return await existingRecord[0].update((record: WorkTrack) => {
					record.status = status as MarkedDayStatus;
					record.isAdvisory = isAdvisory;
					record.needsSync = true;
					record.lastModified = now;
					record.syncError = undefined;
				});
			} else {
				console.log(
					`createOrUpdateRecord: Creating new record for trackerId: ${trackerId}, date: ${date}`
				);
				const newRecord = await workTracks.create(
					(record: WorkTrack) => {
						record.trackerId = trackerId;
						record.date = date;
						record.status = status as MarkedDayStatus;
						record.isAdvisory = isAdvisory;
						record.needsSync = true;
						record.lastModified = now;
						record.syncError = undefined;
					}
				);
				console.log(
					`createOrUpdateRecord: Successfully created record with ID: ${newRecord.id}, trackerId: ${newRecord.trackerId}`
				);
				return newRecord;
			}
		});
	}

	async createOrUpdateEntries(
		trackerId: string,
		entries: TrackerEntryData[]
	) {
		await this.ensureDatabaseReady();

		const db = this.getDatabaseInstance();
		if (!db) {
			throw new Error('Database not available');
		}

		// Add validation and logging
		if (!trackerId) {
			console.error(
				'createOrUpdateEntries: trackerId is missing or empty:',
				{ trackerId, entriesCount: entries.length }
			);
			throw new Error(
				'trackerId is required for creating/updating entries'
			);
		}

		console.log(
			`createOrUpdateEntries: Processing ${entries.length} entries for trackerId: ${trackerId}`
		);

		return await db.write(async () => {
			const workTracks = db.get<WorkTrack>('work_tracks');

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
						console.log(
							`createOrUpdateEntries: Updating existing record for trackerId: ${trackerId}, date: ${entry.date}`
						);
						await record.update((rec: WorkTrack) => {
							rec.status = entry.status;
							rec.isAdvisory = entry.isAdvisory;
							rec.needsSync = false; // Data is from server, already synced
							rec.lastModified = firebaseTimestamp;
							rec.syncError = undefined; // Clear any previous sync errors
						});
					}
				} else {
					console.log(
						`createOrUpdateEntries: Creating new record for trackerId: ${trackerId}, date: ${entry.date}`
					);
					const newRecord = await workTracks.create(
						(rec: WorkTrack) => {
							rec.trackerId = trackerId;
							rec.date = entry.date;
							rec.status = entry.status;
							rec.isAdvisory = entry.isAdvisory;
							rec.lastModified = firebaseTimestamp;
							rec.needsSync = false; // Data is from server, already synced
							rec.syncError = undefined;
						}
					);
					console.log(
						`createOrUpdateEntries: Successfully created record with ID: ${newRecord.id}, trackerId: ${newRecord.trackerId}`
					);
				}
			}
		});
	}

	// Sync Management
	async getUnsyncedRecords(): Promise<WorkTrack[]> {
		await this.ensureDatabaseReady();

		const db = this.getDatabaseInstance();
		if (!db) {
			throw new Error('Database not available');
		}

		return await db
			.get<WorkTrack>('work_tracks')
			.query(Q.where('needs_sync', true))
			.fetch();
	}

	async getFailedSyncRecords(): Promise<WorkTrack[]> {
		await this.ensureDatabaseReady();

		const db = this.getDatabaseInstance();
		if (!db) {
			throw new Error('Database not available');
		}

		return await db
			.get<WorkTrack>('work_tracks')
			.query(
				Q.where('needs_sync', true),
				Q.where('sync_error', Q.notEq(null))
			)
			.fetch();
	}

	async markRecordsAsSynced(records: WorkTrack[]) {
		await this.ensureDatabaseReady();

		const db = this.getDatabaseInstance();
		if (!db) {
			throw new Error('Database not available');
		}

		return await db.write(async () => {
			for (const record of records) {
				await record.update((rec: WorkTrack) => {
					rec.needsSync = false;
					rec.syncError = undefined;
					rec.retryCount = 0; // Reset retry count on successful sync
				});
			}
		});
	}

	async markRecordsWithSyncError(records: WorkTrack[], errorMessage: string) {
		await this.ensureDatabaseReady();

		const db = this.getDatabaseInstance();
		if (!db) {
			throw new Error('Database not available');
		}

		return await db.write(async () => {
			for (const record of records) {
				await record.update((rec: WorkTrack) => {
					rec.needsSync = true; // Keep it marked for retry
					rec.syncError = errorMessage;
					// Increment retry count for tracking
					rec.retryCount = (rec.retryCount ?? 0) + 1;
				});
			}
		});
	}

	// Get records that have exceeded retry limit
	async getRecordsExceedingRetryLimit(
		maxRetries: number = 3
	): Promise<WorkTrack[]> {
		await this.ensureDatabaseReady();

		const db = this.getDatabaseInstance();
		if (!db) {
			throw new Error('Database not available');
		}

		return await db
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
		await this.ensureDatabaseReady();

		const db = this.getDatabaseInstance();
		// Double-check database availability
		if (!db || typeof db.write !== 'function') {
			throw new Error('Database not properly initialized');
		}

		return await db
			.get<WorkTrack>('work_tracks')
			.query(Q.where('tracker_id', trackerId))
			.fetch();
	}

	// Reset retry count for successful syncs
	async resetRetryCount(records: WorkTrack[]) {
		await this.ensureDatabaseReady();

		const db = this.getDatabaseInstance();
		// Double-check database availability
		if (!db || typeof db.write !== 'function') {
			throw new Error('Database not properly initialized');
		}

		return await db.write(async () => {
			for (const record of records) {
				await record.update((rec: WorkTrack) => {
					rec.retryCount = 0;
				});
			}
		});
	}

	// Test method: Create a sync error for testing retry functionality
	async createTestSyncError(
		date: string,
		trackerId: string,
		errorMessage: string = 'Test sync error'
	) {
		await this.ensureDatabaseReady();

		const db = this.getDatabaseInstance();
		if (!db) {
			throw new Error('Database not available');
		}

		return await db.write(async () => {
			const workTracks = db.get<WorkTrack>('work_tracks');
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
		});
	}

	// Sharing Management
	async shareTracker(
		trackerId: string,
		sharedWithId: string,
		permission: 'read' | 'write'
	) {
		await this.ensureDatabaseReady();

		const db = this.getDatabaseInstance();
		if (!db) {
			throw new Error('Database not available');
		}

		return await db.write(async () => {
			return await db
				.get<SharedTracker>('shared_trackers')
				.create((share: SharedTracker) => {
					share.trackerId = trackerId;
					share.sharedWith = sharedWithId;
					share.permission = permission;
				});
		});
	}

	async removeShare(trackerId: string, sharedWithId: string) {
		await this.ensureDatabaseReady();

		const db = this.getDatabaseInstance();
		if (!db) {
			throw new Error('Database not available');
		}

		return await db.write(async () => {
			const shares = await db
				.get<SharedTracker>('shared_trackers')
				.query(
					Q.where('tracker_id', trackerId),
					Q.where('shared_with', sharedWithId)
				)
				.fetch();

			if (shares.length > 0) {
				await shares[0].destroyPermanently();
			}
		});
	}

	async updateSharePermission(
		trackerId: string,
		sharedWithId: string,
		permission: 'read' | 'write'
	) {
		await this.ensureDatabaseReady();

		const db = this.getDatabaseInstance();
		if (!db) {
			throw new Error('Database not available');
		}

		return await db.write(async () => {
			const shares = await db
				.get<SharedTracker>('shared_trackers')
				.query(
					Q.where('tracker_id', trackerId),
					Q.where('shared_with', sharedWithId)
				)
				.fetch();

			if (shares.length > 0) {
				await shares[0].update((share: SharedTracker) => {
					share.permission = permission;
				});
			}
		});
	}

	// Utility: Fetch all trackers for a user (owned and shared)
	async getAllTrackersForUser(userId: string): Promise<Tracker[]> {
		await this.ensureDatabaseReady();

		const db = this.getDatabaseInstance();
		if (!db) {
			throw new Error('Database not available');
		}

		// Owned trackers
		const owned = await db
			.get<Tracker>('trackers')
			.query(Q.where('owner_id', userId))
			.fetch();
		// Shared trackers
		const sharedLinks = await db
			.get<SharedTracker>('shared_trackers')
			.query(Q.where('shared_with', userId))
			.fetch();
		const shared: Tracker[] = [];
		for (const link of sharedLinks) {
			const tracker = await db
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
		await this.ensureDatabaseReady();

		const db = this.getDatabaseInstance();
		// Double-check database availability
		if (!db || typeof db.write !== 'function') {
			throw new Error('Database not properly initialized');
		}

		try {
			return await db.get<Tracker>('trackers').find(trackerId);
		} catch {
			return null;
		}
	}

	// Utility: Fetch a single tracker by owner ID
	async getTrackerByOwnerId(ownerId: string): Promise<Tracker | null> {
		await this.ensureDatabaseReady();

		const db = this.getDatabaseInstance();
		if (!db) {
			throw new Error('Database not available');
		}

		try {
			const trackers = await db
				.get<Tracker>('trackers')
				.query(Q.where('owner_id', ownerId))
				.fetch();

			// Return the first tracker (or default tracker if multiple exist)
			return trackers.length > 0 ? trackers[0] : null;
		} catch {
			return null;
		}
	}

	// Get trackers owned by the user
	async getMyTrackers(userId: string): Promise<Tracker[]> {
		await this.ensureDatabaseReady();

		const db = this.getDatabaseInstance();
		if (!db) {
			throw new Error('Database not available');
		}

		return await db
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

		const db = this.getDatabaseInstance();
		if (!db) {
			throw new Error('Database not available');
		}

		// Get all trackers owned by the user
		const myTrackers = await this.getMyTrackers(userId);

		// Get all shares for these trackers
		const shares = await db
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

		const db = this.getDatabaseInstance();
		if (!db) {
			throw new Error('Database not available');
		}

		// Get all shares where the user is the recipient
		const shares = await db
			.get<SharedTracker>('shared_trackers')
			.query(Q.where('shared_with', userId))
			.fetch();

		// Get the corresponding trackers
		const result: { tracker: Tracker; share: SharedTracker }[] = [];
		for (const share of shares) {
			try {
				const tracker = await db
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

	// Utility: Sync a newly created tracker to Firebase immediately
	async syncTrackerToFirebase(tracker: Tracker): Promise<void> {
		try {
			console.log(
				`Attempting to sync tracker ${tracker.id} to Firebase immediately...`
			);

			// Import Firebase service directly to create the tracker
			const FirebaseService = (await import('./firebase')).default;
			const firebaseService = FirebaseService.getInstance();

			// Create the tracker directly in Firebase
			await firebaseService.createTracker(tracker);
			console.log(
				`Successfully created tracker ${tracker.id} in Firebase`
			);
		} catch (error) {
			console.warn(
				`Failed to sync tracker ${tracker.id} to Firebase:`,
				error
			);
			// Don't throw - this is not critical for app functionality
		}
	}

	// Utility: Ensure user has at least one tracker
	async ensureUserHasTracker(userId: string): Promise<Tracker | null> {
		await this.ensureDatabaseReady();

		const db = this.getDatabaseInstance();
		if (!db) {
			throw new Error('Database not available');
		}

		try {
			// Check if user has any trackers
			const userTrackers = await db
				.get<Tracker>('trackers')
				.query(Q.where('owner_id', userId))
				.fetch();

			if (userTrackers.length === 0) {
				console.log(
					`User ${userId} has no trackers, creating default tracker`
				);

				// Create a default tracker for the user
				const defaultTracker = await this.createTracker({
					name: 'My WorkTrack',
					color: '#007AFF',
					trackerType: TRACKER_TYPES.WORK_TRACK,
					ownerId: userId,
				});

				console.log(`Created default tracker: ${defaultTracker.id}`);

				// Sync the new tracker to Firebase immediately to prevent it from being marked as orphaned
				await this.syncTrackerToFirebase(defaultTracker);

				return defaultTracker;
			}

			// Return the first tracker (or default tracker if multiple exist)
			const defaultTracker =
				userTrackers.find((t) => t.isDefault) || userTrackers[0];
			return defaultTracker;
		} catch (error) {
			console.error('Error ensuring user has tracker:', error);
			return null;
		}
	}

	// Utility: Clean up orphaned trackers that no longer exist in Firebase
	async cleanupOrphanedTrackers(firebaseTrackerIds: string[]): Promise<void> {
		await this.ensureDatabaseReady();

		const db = this.getDatabaseInstance();
		if (!db) {
			throw new Error('Database not available');
		}

		try {
			// Get all trackers in WatermelonDB
			const allLocalTrackers = await db
				.get<Tracker>('trackers')
				.query()
				.fetch();

			console.log(
				`Checking ${allLocalTrackers.length} local trackers against ${firebaseTrackerIds.length} Firebase trackers`
			);

			const trackersToDelete: string[] = [];

			for (const localTracker of allLocalTrackers) {
				// Check if this tracker exists in Firebase
				if (!firebaseTrackerIds.includes(localTracker.id)) {
					console.log(
						`Tracker ${localTracker.id} (${localTracker.name}) not found in Firebase, marking for deletion`
					);
					trackersToDelete.push(localTracker.id);
				}
			}

			if (trackersToDelete.length > 0) {
				console.log(
					`Deleting ${trackersToDelete.length} orphaned trackers from local database`
				);
				await db.write(async () => {
					for (const trackerId of trackersToDelete) {
						try {
							// Delete the tracker
							const tracker = await db
								.get<Tracker>('trackers')
								.find(trackerId);
							if (tracker) {
								await tracker.destroyPermanently();
								console.log(`Deleted tracker: ${trackerId}`);
							}

							// Delete associated work tracks
							const workTracks = await db
								.get<WorkTrack>('work_tracks')
								.query(Q.where('tracker_id', trackerId))
								.fetch();

							for (const workTrack of workTracks) {
								await workTrack.destroyPermanently();
							}
							console.log(
								`Deleted ${workTracks.length} work tracks for tracker: ${trackerId}`
							);

							// Delete associated shares
							const shares = await db
								.get<SharedTracker>('shared_trackers')
								.query(Q.where('tracker_id', trackerId))
								.fetch();

							for (const share of shares) {
								await share.destroyPermanently();
							}
							console.log(
								`Deleted ${shares.length} shares for tracker: ${trackerId}`
							);
						} catch (error) {
							console.warn(
								`Failed to clean up tracker ${trackerId}:`,
								error
							);
						}
					}
				});
				console.log('Orphaned tracker cleanup completed');
			} else {
				console.log('No orphaned trackers found');
			}
		} catch (error) {
			console.error('Error during orphaned tracker cleanup:', error);
			throw error;
		}
	}

	// Utility: Clean up stale tracker references
	async cleanupStaleTrackerReferences(userId: string): Promise<void> {
		await this.ensureDatabaseReady();

		const db = this.getDatabaseInstance();
		if (!db) {
			throw new Error('Database not available');
		}

		try {
			// Get all trackers in the local database
			const allTrackers = await db
				.get<Tracker>('trackers')
				.query()
				.fetch();
			console.log(
				`Checking ${allTrackers.length} local trackers for cleanup`
			);

			const trackersToDelete: string[] = [];

			for (const tracker of allTrackers) {
				// Keep trackers owned by the current user
				if (tracker.ownerId === userId) {
					continue;
				}

				// Check if there's a valid share for this tracker
				const shares = await db
					.get<SharedTracker>('shared_trackers')
					.query(
						Q.where('tracker_id', tracker.id),
						Q.where('shared_with', userId)
					)
					.fetch();

				// If no valid share exists, mark for deletion
				if (shares.length === 0) {
					console.log(
						`Tracker ${tracker.id} (${tracker.name}) has no valid share, marking for cleanup`
					);
					trackersToDelete.push(tracker.id);
				}
			}

			if (trackersToDelete.length > 0) {
				console.log(
					`Cleaning up ${trackersToDelete.length} stale tracker references`
				);
				await db.write(async () => {
					for (const trackerId of trackersToDelete) {
						try {
							// Delete the tracker
							const tracker = await db
								.get<Tracker>('trackers')
								.find(trackerId);
							if (tracker) {
								await tracker.destroyPermanently();
							}

							// Delete associated work tracks
							const workTracks = await db
								.get<WorkTrack>('work_tracks')
								.query(Q.where('tracker_id', trackerId))
								.fetch();

							for (const workTrack of workTracks) {
								await workTrack.destroyPermanently();
							}

							// Delete associated shares
							const shares = await db
								.get<SharedTracker>('shared_trackers')
								.query(Q.where('tracker_id', trackerId))
								.fetch();

							for (const share of shares) {
								await share.destroyPermanently();
							}
						} catch (error) {
							console.warn(
								`Failed to clean up tracker ${trackerId}:`,
								error
							);
						}
					}
				});
				console.log('Stale tracker references cleaned up');
			} else {
				console.log('No stale tracker references found');
			}
		} catch (error) {
			console.error('Error during tracker cleanup:', error);
		}
	}

	// Utility: Clear all work_tracks records (for testing)
	async clearAllWorkTracks(): Promise<void> {
		await this.ensureDatabaseReady();

		const db = this.getDatabaseInstance();
		if (!db) {
			throw new Error('Database not available');
		}

		return await db.write(async () => {
			const workTracks = db.get<WorkTrack>('work_tracks');
			const allRecords = await workTracks.query().fetch();

			console.log(`Clearing ${allRecords.length} work_track records`);

			for (const record of allRecords) {
				await record.destroyPermanently();
			}
		});
	}

	// Utility: Check and fix records without trackerId
	async checkAndFixRecordsWithoutTrackerId(): Promise<void> {
		await this.ensureDatabaseReady();

		const db = this.getDatabaseInstance();
		if (!db) {
			throw new Error('Database not available');
		}

		try {
			// Check if we've already cleaned up recently (within last 5 minutes)
			const lastCleanupKey = '@last_cleanup_time';
			const lastCleanupTime = await AsyncStorage.getItem(lastCleanupKey);
			const now = Date.now();
			const fiveMinutesAgo = now - 5 * 60 * 1000;

			if (lastCleanupTime && parseInt(lastCleanupTime) > fiveMinutesAgo) {
				console.log(
					'Database cleanup was performed recently, skipping...'
				);
				return;
			}

			// Use a more direct approach to avoid bridge issues
			const workTracks = db.get<WorkTrack>('work_tracks');
			const allRecords = await workTracks.query().fetch();
			console.log(
				`Checking ${allRecords.length} work_track records for trackerId`
			);

			const recordsToDelete: string[] = [];

			for (const record of allRecords) {
				try {
					// Try to access the trackerId field safely
					const trackerId = record.trackerId;
					// Check for null, undefined, or empty string
					if (!trackerId || trackerId.trim() === '') {
						console.log(
							`Record ${record.id} has no trackerId (value: "${trackerId}"), marking for deletion`
						);
						recordsToDelete.push(record.id);
					}
				} catch (error) {
					console.log(
						`Record ${record.id} is corrupted, marking for deletion:`,
						error
					);
					recordsToDelete.push(record.id);
				}
			}

			console.log(`Found ${recordsToDelete.length} records to delete`);

			if (recordsToDelete.length > 0) {
				console.log('Clearing corrupted records...');
				await db.write(async () => {
					for (const recordId of recordsToDelete) {
						try {
							const record = await workTracks.find(recordId);
							if (record) {
								await record.destroyPermanently();
							}
						} catch (error) {
							console.warn(
								`Failed to delete record ${recordId}:`,
								error
							);
						}
					}
				});
				console.log('Cleared corrupted records');
			}

			// Store the cleanup time
			await AsyncStorage.setItem(lastCleanupKey, now.toString());
		} catch (error) {
			console.error('Error checking records:', error);
			// If there's a serious issue, try to clear all work_tracks
			console.log(
				'Attempting to clear all work_tracks due to corruption...'
			);
			try {
				await this.clearAllWorkTracks();
				console.log('Successfully cleared all work_tracks');
			} catch (clearError) {
				console.error('Failed to clear work_tracks:', clearError);
			}
		}
	}

	// Utility: Check database state and track resets
	async checkDatabaseState(): Promise<void> {
		await this.ensureDatabaseReady();

		const db = this.getDatabaseInstance();
		if (!db) {
			throw new Error('Database not available');
		}

		try {
			// Get counts of all tables
			const workTracks = await db
				.get<WorkTrack>('work_tracks')
				.query()
				.fetch();
			const trackers = await db.get<Tracker>('trackers').query().fetch();
			const sharedTrackers = await db
				.get<SharedTracker>('shared_trackers')
				.query()
				.fetch();

			console.log('=== Database State Check ===');
			console.log(`Total work_tracks: ${workTracks.length}`);
			console.log(`Total trackers: ${trackers.length}`);
			console.log(`Total shared_trackers: ${sharedTrackers.length}`);

			// Check for records without trackerId
			const recordsWithoutTrackerId = workTracks.filter((record) => {
				try {
					const trackerId = record.trackerId;
					// Check for null, undefined, or empty string
					return !trackerId || trackerId.trim() === '';
				} catch {
					return true; // Consider corrupted records as missing trackerId
				}
			});

			console.log(
				`Records without trackerId: ${recordsWithoutTrackerId.length}`
			);

			// Show some sample record IDs and their trackerIds
			if (workTracks.length > 0) {
				console.log('Sample work_track records:');
				workTracks.slice(0, 5).forEach((record) => {
					try {
						console.log(
							`  ID: ${record.id}, trackerId: ${record.trackerId}, date: ${record.date}`
						);
					} catch (error) {
						console.log(`  ID: ${record.id}, CORRUPTED: ${error}`);
					}
				});
			}

			// Check if we have any trackers
			if (trackers.length > 0) {
				console.log('Available trackers:');
				trackers.forEach((tracker) => {
					console.log(
						`  ID: ${tracker.id}, name: ${tracker.name}, ownerId: ${tracker.ownerId}`
					);
				});
			}

			console.log('=== End Database State Check ===');
		} catch (error) {
			console.error('Error checking database state:', error);
		}
	}
}
