import { getApp } from '@react-native-firebase/app';
import { getAuth } from '@react-native-firebase/auth';
import {
	collection,
	collectionGroup,
	deleteDoc,
	doc,
	getDoc,
	getDocs,
	getFirestore,
	query,
	setDoc,
	Timestamp,
	where,
	writeBatch,
} from '@react-native-firebase/firestore';

import {
	DEFAULT_TRACKER_TYPE,
	FIREBASE_COLLECTIONS,
	TrackerType,
} from '../constants';
import { Tracker, WorkTrack } from '../db/watermelon';
import { colors } from '../themes/colors';
import { MarkedDayStatus } from '../types/calendar';

export interface TrackerData {
	id: string;
	name: string;
	color: string;
	ownerId: string;
	createdAt: Timestamp;
	isDefault: boolean;
	trackerType: TrackerType;
}

export interface TrackerEntryData {
	date: string;
	status: MarkedDayStatus;
	isAdvisory: boolean;
	createdAt: Timestamp;
	lastModified: Timestamp;
}

export interface TrackerShareData {
	sharedWithId: string;
	permission: 'read' | 'write';
	sharedWithEmail: string;
	createdAt: Timestamp;
}

export interface SharePermission {
	ownerId: string;
	sharedWithId: string;
	sharedWithEmail: string;
	permission: 'read' | 'write';
	ownerName?: string;
	ownerPhoto?: string;
	trackerType?: TrackerType;
}

export type SharedWorkTrackData = {
	ownerId: string;
	ownerName?: string;
	ownerEmail: string;
	ownerPhoto?: string;
	permission: 'read' | 'write';
	trackerType?: TrackerType;
};

export default class FirebaseService {
	private static instance: FirebaseService;

	private constructor() {}

	static getInstance(): FirebaseService {
		if (!FirebaseService.instance) {
			FirebaseService.instance = new FirebaseService();
		}
		return FirebaseService.instance;
	}

	private getTrackersCollection() {
		return collection(
			getFirestore(getApp()),
			FIREBASE_COLLECTIONS.TRACKERS
		);
	}

	private getEntriesCollection(trackerId: string) {
		return collection(
			doc(
				getFirestore(getApp()),
				FIREBASE_COLLECTIONS.TRACKERS,
				trackerId
			),
			FIREBASE_COLLECTIONS.ENTRIES
		);
	}

	private getSharesCollection(trackerId: string) {
		return collection(
			doc(
				getFirestore(getApp()),
				FIREBASE_COLLECTIONS.TRACKERS,
				trackerId
			),
			FIREBASE_COLLECTIONS.SHARES
		);
	}

	// New Tracker Methods
	async createTracker(tracker: Tracker): Promise<void> {
		const trackerRef = doc(this.getTrackersCollection(), tracker.id);

		// Create the tracker document
		await setDoc(trackerRef, {
			name: tracker.name,
			color: tracker.color,
			ownerId: tracker.ownerId,
			createdAt: Timestamp.fromDate(tracker.createdAt),
			isDefault: tracker.isDefault,
			trackerType: tracker.trackerType,
		});

		console.log(`Successfully created tracker ${tracker.id} in Firebase`);
	}

	async updateTracker(tracker: Tracker): Promise<void> {
		const trackerRef = doc(this.getTrackersCollection(), tracker.id);
		await setDoc(
			trackerRef,
			{
				name: tracker.name,
				color: tracker.color,
				isDefault: tracker.isDefault,
			},
			{ merge: true }
		);
	}

	// Ensure tracker exists before writing entries
	async ensureTrackerExists(
		trackerId: string,
		ownerId: string
	): Promise<void> {
		const trackerRef = doc(this.getTrackersCollection(), trackerId);

		try {
			// Try to create the tracker directly with merge option
			// This will create if it doesn't exist, or update if it does
			await setDoc(
				trackerRef,
				{
					name: 'Default Tracker',
					color: colors.ui.black,
					ownerId: ownerId,
					createdAt: Timestamp.now(),
					isDefault: false,
					trackerType: DEFAULT_TRACKER_TYPE,
				},
				{ merge: true }
			);

			console.log(
				`Ensured tracker ${trackerId} exists for user ${ownerId}`
			);

			// Verify the tracker was created properly by reading it back
			const trackerDoc = await getDoc(trackerRef);
			if (!trackerDoc.exists()) {
				throw new Error(`Failed to create tracker ${trackerId}`);
			}

			const trackerData = trackerDoc.data();
			console.log(`Tracker ${trackerId} data:`, {
				ownerId: trackerData?.ownerId,
				name: trackerData?.name,
				exists: trackerDoc.exists(),
			});
		} catch (error: unknown) {
			console.error(`Error ensuring tracker ${trackerId} exists:`, error);
			throw error;
		}
	}

	// Entry Sync Methods
	async syncToFirebase(records: WorkTrack[]): Promise<void> {
		if (records.length === 0) return;

		const currentUser = getAuth().currentUser;
		if (!currentUser) {
			throw new Error('User not authenticated');
		}

		console.log(
			`syncToFirebase: Syncing ${records.length} records for user ${currentUser.uid}`
		);

		const BATCH_SIZE = 500; // Firestore batch limit
		const db = getFirestore();

		// Ensure tracker structure for each trackerId before writing entries
		const trackerIds = Array.from(new Set(records.map((r) => r.trackerId)));
		for (const trackerId of trackerIds) {
			await this.ensureTrackerStructure(trackerId, {
				uid: currentUser.uid,
				email: currentUser.email ?? '',
			});
		}

		for (let i = 0; i < records.length; i += BATCH_SIZE) {
			const batch = writeBatch(db);
			const batchRecords = records.slice(i, i + BATCH_SIZE);

			console.log(
				`Processing batch ${i / BATCH_SIZE + 1} with ${batchRecords.length} records`
			);

			for (const record of batchRecords) {
				const { trackerId, date } = record;
				if (!trackerId) {
					console.warn('Record without trackerId:', record);
					continue; // Should not happen
				}

				console.log(
					`Processing record: trackerId=${trackerId}, date=${date}`
				);

				const entryRef = doc(
					this.getEntriesCollection(trackerId),
					date
				);

				console.log(`Writing entry to: ${entryRef.path}`);

				batch.set(entryRef, {
					date: record.date,
					status: record.status,
					isAdvisory: record.isAdvisory,
					lastModified: Timestamp.fromMillis(record.lastModified),
					createdAt: Timestamp.fromDate(record.createdAt),
				});
			}

			console.log('Committing batch...');
			try {
				await batch.commit();
				console.log('Batch committed successfully');
			} catch (error: unknown) {
				console.error('Batch commit failed:', error);
				if (error && typeof error === 'object' && 'code' in error) {
					console.error(
						'Error code:',
						(error as { code: string }).code
					);
				}
				if (error instanceof Error) {
					console.error('Error message:', error.message);
				}
				throw error;
			}
		}
	}

	// New Sharing Methods
	async shareTracker(
		trackerId: string,
		shareData: Omit<TrackerShareData, 'createdAt'>
	): Promise<void> {
		const shareRef = doc(
			this.getSharesCollection(trackerId),
			shareData.sharedWithId
		);
		await setDoc(shareRef, {
			...shareData,
			createdAt: Timestamp.now(),
		});
	}

	async unshareTracker(
		trackerId: string,
		sharedWithId: string
	): Promise<void> {
		const shareRef = doc(this.getSharesCollection(trackerId), sharedWithId);
		await deleteDoc(shareRef);
	}

	async getTrackersSharedWithUser(
		userId: string
	): Promise<{ tracker: TrackerData; share: TrackerShareData }[]> {
		const db = getFirestore(getApp());
		const sharesQuery = query(
			collectionGroup(db, FIREBASE_COLLECTIONS.SHARES),
			where('sharedWithId', '==', userId)
		);

		let sharesSnapshot;
		try {
			sharesSnapshot = await getDocs(sharesQuery);
		} catch (err: unknown) {
			if (
				err &&
				typeof err === 'object' &&
				'code' in err &&
				(err as { code: string }).code === 'permission-denied'
			) {
				console.warn(
					'Permission denied on shares query. Returning empty list.'
				);
				return [];
			}
			throw err;
		}

		if (sharesSnapshot.empty) {
			return [];
		}

		const trackerPromises = sharesSnapshot.docs.map(async (shareDoc) => {
			// The parent of a share doc is the tracker doc
			const trackerRef = shareDoc.ref.parent.parent;
			if (!trackerRef) return null;

			const trackerSnapshot = await getDoc(trackerRef);
			if (!trackerSnapshot.exists()) return null;

			return {
				tracker: {
					id: trackerSnapshot.id,
					...trackerSnapshot.data(),
				} as TrackerData,
				share: shareDoc.data() as TrackerShareData,
			};
		});

		const results = (await Promise.all(trackerPromises)).filter(
			(r): r is { tracker: TrackerData; share: TrackerShareData } =>
				r !== null
		);

		return results;
	}

	async syncFromFirebase(
		userId: string,
		lastSyncedAt: number | null
	): Promise<{
		trackers: TrackerData[];
		entries: { trackerId: string; data: TrackerEntryData[] }[];
	}> {
		try {
			// 1. Fetch trackers owned by the user
			const ownedTrackersQuery = query(
				this.getTrackersCollection(),
				where('ownerId', '==', userId)
			);
			const ownedTrackersSnapshot = await getDocs(ownedTrackersQuery);
			const ownedTrackers = ownedTrackersSnapshot.docs.map(
				(doc) => ({ id: doc.id, ...doc.data() }) as TrackerData
			);

			// 2. Fetch trackers shared with the user
			const sharedTrackers = await this.getTrackersSharedWithUser(userId);

			// 3. Combine and deduplicate
			const allTrackersMap = new Map<string, TrackerData>();
			[...ownedTrackers, ...sharedTrackers.map((s) => s.tracker)].forEach(
				(t) => allTrackersMap.set(t.id, t)
			);
			const allTrackers = Array.from(allTrackersMap.values());

			console.log(
				`Found ${allTrackers.length} trackers to sync (${ownedTrackers.length} owned, ${sharedTrackers.length} shared)`
			);

			// 4. Fetch entries for each tracker
			const entriesPromises = allTrackers.map(async (tracker) => {
				try {
					const entriesQuery = lastSyncedAt
						? query(
								this.getEntriesCollection(tracker.id),
								where(
									'lastModified',
									'>',
									Timestamp.fromMillis(lastSyncedAt)
								)
							)
						: this.getEntriesCollection(tracker.id);

					console.log('entriesQuery', entriesQuery, tracker);
					const entriesSnapshot = await getDocs(entriesQuery);
					const entriesData = entriesSnapshot.docs.map(
						(doc) => doc.data() as TrackerEntryData
					);
					return { trackerId: tracker.id, data: entriesData };
				} catch (error: unknown) {
					// Handle permission errors specifically
					if (
						error &&
						typeof error === 'object' &&
						'code' in error &&
						(error as { code: string }).code === 'permission-denied'
					) {
						console.log(
							`Permission denied for tracker ${tracker.id} (${tracker.name}). This tracker may no longer be shared with you.`
						);
					} else {
						const errorMessage =
							error instanceof Error ? error.message : error;
						console.warn(
							`Failed to fetch entries for tracker ${tracker.id} (${tracker.name}):`,
							errorMessage
						);
					}
					return { trackerId: tracker.id, data: [] };
				}
			});

			const entries = await Promise.all(entriesPromises);
			console.log('entries', entries);

			return { trackers: allTrackers, entries };
		} catch (error: unknown) {
			// Handle top-level permission errors
			if (
				error &&
				typeof error === 'object' &&
				'code' in error &&
				(error as { code: string }).code === 'permission-denied'
			) {
				console.log(
					'Permission denied for Firebase sync. This may be due to security rules or authentication issues.'
				);
			} else {
				const errorMessage =
					error instanceof Error ? error.message : error;
				console.warn(
					'Firebase sync failed, returning empty data:',
					errorMessage
				);
			}
			return { trackers: [], entries: [] };
		}
	}

	async getSharedWorkTracks(): Promise<SharedWorkTrackData[]> {
		const user = getAuth().currentUser;
		if (!user) throw new Error('No user logged in');

		const db = getFirestore(getApp());
		const sharedTracks = await this.getTrackersSharedWithUser(user.uid);
		const sharedWorkTracks: SharedWorkTrackData[] = [];

		for (const { tracker, share } of sharedTracks) {
			let ownerEmail = share.sharedWithEmail;
			let ownerPhoto = undefined;
			try {
				const ownerDoc = await getDoc(
					doc(db, 'users', tracker.ownerId)
				);
				if (ownerDoc.exists()) {
					const ownerData = ownerDoc.data();
					ownerEmail = ownerData?.email ?? ownerEmail;
					ownerPhoto = ownerData?.photoURL;
				}
			} catch {}
			sharedWorkTracks.push({
				ownerId: tracker.ownerId,
				ownerName: tracker.name,
				ownerEmail,
				ownerPhoto,
				permission: share.permission,
				trackerType: tracker.trackerType ?? DEFAULT_TRACKER_TYPE,
			});
		}

		// Add current user's worktrack
		const currentUserDoc = await getDoc(doc(db, 'users', user.uid));
		if (currentUserDoc.exists()) {
			const userData = currentUserDoc.data();
			sharedWorkTracks.unshift({
				ownerId: user.uid,
				ownerName: userData?.displayName,
				ownerEmail: userData?.email,
				ownerPhoto: userData?.photoURL,
				permission: 'write',
				trackerType: DEFAULT_TRACKER_TYPE,
			});
		}

		return sharedWorkTracks;
	}

	// Ensures both tracker doc and share doc exist for a tracker and user
	async ensureTrackerStructure(
		trackerId: string,
		user: { uid: string; email: string }
	): Promise<void> {
		const trackerRef = doc(this.getTrackersCollection(), trackerId);
		const shareRef = doc(this.getSharesCollection(trackerId), user.uid);

		try {
			// 1. Ensure tracker doc exists (set createdAt only if missing, always set updatedAt)
			const trackerSnap = await getDoc(trackerRef);
			let createdAt = Timestamp.now();
			if (trackerSnap.exists()) {
				const data = trackerSnap.data();
				createdAt = data?.createdAt ?? Timestamp.now();
				console.log(
					`[ensureTrackerStructure] Existing tracker doc for ${trackerId}, preserving createdAt:`,
					createdAt
				);
			} else {
				console.log(
					`[ensureTrackerStructure] Creating tracker doc for ${trackerId} with createdAt:`,
					createdAt
				);
			}
			await setDoc(
				trackerRef,
				{
					ownerId: user.uid,
					name: 'Default Tracker', // If you have a name, pass it in
					isDefault: false, // If you have this info, pass it in
					trackerType: 'work_track', // If you have this info, pass it in
					createdAt,
					updatedAt: Timestamp.now(),
				},
				{ merge: true }
			);
			console.log(
				`[ensureTrackerStructure] Ensured tracker doc for ${trackerId}`
			);
		} catch (error) {
			console.error(
				`[ensureTrackerStructure] Failed to ensure tracker doc for ${trackerId}:`,
				error
			);
			throw error;
		}

		try {
			// 2. Ensure share doc exists (merge: true)
			await setDoc(
				shareRef,
				{
					sharedWithId: user.uid,
					permission: 'write',
					sharedWithEmail: user.email,
					createdAt: Timestamp.now(),
				},
				{ merge: true }
			);
			console.log(
				`[ensureTrackerStructure] Ensured share doc for tracker ${trackerId} and user ${user.uid}`
			);
		} catch (error) {
			console.error(
				`[ensureTrackerStructure] Failed to ensure share doc for tracker ${trackerId} and user ${user.uid}:`,
				error
			);
			throw error;
		}
	}
}
