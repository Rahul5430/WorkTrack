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

import { FIREBASE_COLLECTIONS } from '../constants/firebase';
import { DEFAULT_TRACKER_TYPE, TrackerType } from '../constants/trackerTypes';
import { Tracker, WorkTrack } from '../db/watermelon';
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
			this.getTrackersCollection(),
			trackerId,
			FIREBASE_COLLECTIONS.ENTRIES
		);
	}

	private getSharesCollection(trackerId: string) {
		return collection(
			this.getTrackersCollection(),
			trackerId,
			FIREBASE_COLLECTIONS.SHARES
		);
	}

	// New Tracker Methods
	async createTracker(tracker: Tracker): Promise<void> {
		const trackerRef = doc(this.getTrackersCollection(), tracker.id);
		await setDoc(trackerRef, {
			name: tracker.name,
			color: tracker.color,
			ownerId: tracker.ownerId,
			createdAt: Timestamp.fromDate(tracker.createdAt),
			isDefault: tracker.isDefault,
			trackerType: tracker.trackerType,
		});
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

	// Entry Sync Methods
	async syncToFirebase(records: WorkTrack[]): Promise<void> {
		if (records.length === 0) return;

		const BATCH_SIZE = 500; // Firestore batch limit
		const db = getFirestore();

		for (let i = 0; i < records.length; i += BATCH_SIZE) {
			const batch = writeBatch(db);
			const batchRecords = records.slice(i, i + BATCH_SIZE);

			for (const record of batchRecords) {
				const { trackerId, date } = record;
				if (!trackerId) continue; // Should not happen

				const entryRef = doc(
					this.getEntriesCollection(trackerId),
					date
				);
				batch.set(entryRef, {
					date: record.date,
					status: record.status,
					isAdvisory: record.isAdvisory,
					lastModified: Timestamp.fromMillis(record.lastModified),
					createdAt: Timestamp.fromDate(record.createdAt),
				});
			}

			await batch.commit();
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
		} catch (err: any) {
			if (err.code === 'permission-denied') {
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

		// 4. Fetch entries for each tracker
		const entriesPromises = allTrackers.map(async (tracker) => {
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

			const entriesSnapshot = await getDocs(entriesQuery);
			const entriesData = entriesSnapshot.docs.map(
				(doc) => doc.data() as TrackerEntryData
			);
			return { trackerId: tracker.id, data: entriesData };
		});

		const entries = await Promise.all(entriesPromises);

		return { trackers: allTrackers, entries };
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
}
