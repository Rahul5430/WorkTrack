import {
	collection,
	collectionGroup,
	doc,
	getDoc,
	getDocs,
	query,
	setDoc,
	Timestamp,
	where,
} from '@react-native-firebase/firestore';

import { SyncError } from '../errors';
import { logger } from '../logging';
import {
	trackerDTOToFirestore,
	trackerFirestoreToDTO,
} from '../mappers/trackerMapper';
import { getFirestoreInstance } from '../services';
import { ITrackerRepository, TrackerDTO } from '../types';

// Type for Firestore document data
interface FirestoreTrackerData {
	id: string;
	ownerId: string;
	name: string;
	color: string;
	isDefault: boolean;
	trackerType: string;
	createdAt: Timestamp;
}

export class FirebaseTrackerRepository implements ITrackerRepository {
	async create(tracker: TrackerDTO, userId: string): Promise<void> {
		if (tracker.ownerId !== userId) {
			throw new Error('Tracker owner ID must match current user ID');
		}

		const firestoreData = trackerDTOToFirestore(tracker);
		const db = getFirestoreInstance();
		const trackerRef = doc(db, 'trackers', tracker.id);
		await setDoc(trackerRef, firestoreData);
	}

	async update(
		tracker: Partial<TrackerDTO> & { id: string },
		userId: string
	): Promise<void> {
		const db = getFirestoreInstance();
		const trackerRef = doc(db, 'trackers', tracker.id);

		// Get existing tracker to validate ownership
		const existingTrackers = await this.listOwned(userId);
		const existingTracker = existingTrackers.find(
			(t) => t.id === tracker.id
		);

		if (!existingTracker) {
			throw new Error('Tracker not found or not owned by user');
		}

		const firestoreData = trackerDTOToFirestore({
			...existingTracker,
			...tracker,
		} as TrackerDTO);
		await setDoc(trackerRef, firestoreData, { merge: true });
	}

	async listOwned(userId: string): Promise<TrackerDTO[]> {
		try {
			const db = getFirestoreInstance();
			const trackersRef = collection(db, 'trackers');
			const q = query(trackersRef, where('ownerId', '==', userId));
			const querySnapshot = await getDocs(q);

			const trackers: TrackerDTO[] = [];
			querySnapshot.forEach((doc) => {
				const trackerData: FirestoreTrackerData = {
					id: doc.id,
					...doc.data(),
				} as FirestoreTrackerData;
				trackers.push(trackerFirestoreToDTO(trackerData));
			});

			logger.debug('Fetched owned trackers from Firestore', {
				userId,
				count: trackers.length,
			});
			return trackers;
		} catch (error) {
			logger.error('Failed to fetch owned trackers from Firestore', {
				error,
				userId,
			});

			// Handle permission denied errors gracefully
			if (error.code === 'firestore/permission-denied') {
				logger.warn(
					'Permission denied for owned trackers, returning empty array',
					{
						userId,
					}
				);
				return [];
			}

			throw new SyncError('Failed to fetch owned trackers', {
				code: 'firestore.fetch_failed',
				originalError: error,
			});
		}
	}

	async listSharedWith(userId: string): Promise<TrackerDTO[]> {
		try {
			const db = getFirestoreInstance();

			// Use collectionGroup query to find all shares where user is sharedWithId
			const sharesQuery = query(
				collectionGroup(db, 'shares'),
				where('sharedWithId', '==', userId)
			);
			const querySnapshot = await getDocs(sharesQuery);

			const trackers: TrackerDTO[] = [];
			for (const shareDoc of querySnapshot.docs) {
				const pathParts = shareDoc.ref.path.split('/');
				const trackerId = pathParts[1];

				// Fetch the actual tracker data
				const trackerRef = doc(db, 'trackers', trackerId);
				const trackerSnapshot = await getDoc(trackerRef);

				if (trackerSnapshot.exists()) {
					const data = trackerSnapshot.data();
					logger.debug('Tracker data', {
						trackerId,
						userId,
						data,
					});
					if (data) {
						try {
							const trackerData: FirestoreTrackerData = {
								id: trackerSnapshot.id,
								...data,
							} as FirestoreTrackerData;
							trackers.push(trackerFirestoreToDTO(trackerData));
						} catch (conversionError) {
							logger.warn('Failed to convert tracker data', {
								trackerId,
								userId,
								error: conversionError,
								data,
							});
						}
					} else {
						logger.warn('Tracker document exists but has no data', {
							trackerId,
							userId,
						});
					}
				}
			}

			logger.debug('Fetched shared trackers from Firestore', {
				userId,
				count: trackers.length,
			});
			return trackers;
		} catch (error) {
			logger.error('Failed to fetch shared trackers from Firestore', {
				error,
				userId,
			});

			// Handle permission denied errors gracefully
			if (error.code === 'firestore/permission-denied') {
				logger.warn(
					'Permission denied for shared trackers, returning empty array',
					{
						userId,
					}
				);
				return [];
			}

			throw new SyncError('Failed to fetch shared trackers', {
				code: 'firestore.fetch_failed',
				originalError: error,
			});
		}
	}

	async ensureExists(id: string, ownerId: string): Promise<void> {
		try {
			const db = getFirestoreInstance();
			const trackerRef = doc(db, 'trackers', id);
			const trackerSnapshot = await getDoc(trackerRef);

			if (!trackerSnapshot.exists()) {
				// Create a default tracker if it doesn't exist
				const defaultTracker: TrackerDTO = {
					id,
					ownerId,
					name: 'Work Tracker',
					color: '#4CAF50',
					isDefault: true,
					trackerType: 'work',
				};

				const firestoreData = trackerDTOToFirestore(defaultTracker);
				await setDoc(trackerRef, firestoreData);

				logger.info('Created default tracker in Firestore', {
					id,
					ownerId,
				});
			} else {
				logger.debug('Tracker already exists in Firestore', {
					id,
					ownerId,
				});
			}
		} catch (error) {
			logger.error('Failed to ensure tracker exists in Firestore', {
				error,
				id,
				ownerId,
			});
			throw error;
		}
	}

	async upsertMany(trackers: TrackerDTO[]): Promise<void> {
		try {
			const db = getFirestoreInstance();

			for (const tracker of trackers) {
				const trackerRef = doc(db, 'trackers', tracker.id);
				const firestoreData = trackerDTOToFirestore(tracker);
				await setDoc(trackerRef, firestoreData, { merge: true });
			}

			logger.debug('Successfully upserted trackers to Firestore', {
				count: trackers.length,
			});
		} catch (error) {
			logger.error('Failed to upsert trackers to Firestore', {
				error,
				count: trackers.length,
			});
			throw new SyncError('Failed to upsert trackers to Firestore', {
				code: 'firestore.upsert_failed',
				originalError: error,
			});
		}
	}
}
