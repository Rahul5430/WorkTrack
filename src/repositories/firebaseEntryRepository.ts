import {
	collection,
	deleteDoc,
	doc,
	getDocs,
	setDoc,
} from '@react-native-firebase/firestore';

import { SyncError } from '../errors';
import { logger } from '../logging';
import {
	entryDTOToFirestore,
	entryFirestoreToDTO,
} from '../mappers/entryMapper';
import { getFirestoreInstance } from '../services';
import { EntryDTO, IRemoteEntryRepository } from '../types';

export class FirebaseEntryRepository implements IRemoteEntryRepository {
	async upsertMany(trackerId: string, entries: EntryDTO[]): Promise<void> {
		try {
			const db = getFirestoreInstance();
			const entriesRef = collection(db, 'trackers', trackerId, 'entries');

			for (const entry of entries) {
				const entryRef = doc(entriesRef, entry.id);
				const firestoreData = entryDTOToFirestore(entry);
				await setDoc(entryRef, firestoreData, { merge: true });
			}

			logger.debug('Successfully upserted entries to Firestore', {
				trackerId,
				count: entries.length,
			});
		} catch (error) {
			logger.error('Failed to upsert entries to Firestore', {
				error,
				trackerId,
				count: entries.length,
			});
			throw new SyncError('Failed to upsert entries to Firestore', {
				code: 'firestore.upsert_failed',
				originalError: error,
			});
		}
	}

	async upsertOne(entry: EntryDTO): Promise<void> {
		await this.upsertMany(entry.trackerId, [entry]);
	}

	async getEntriesForTracker(trackerId: string): Promise<EntryDTO[]> {
		try {
			const db = getFirestoreInstance();
			const entriesRef = collection(db, 'trackers', trackerId, 'entries');
			const querySnapshot = await getDocs(entriesRef);

			const entries: EntryDTO[] = [];
			querySnapshot.forEach((doc) => {
				const entryData = doc.data();
				const completeEntryData = {
					id: doc.id,
					trackerId: trackerId,
					date: entryData.date || '',
					status: entryData.status || 'office',
					isAdvisory: Boolean(entryData.isAdvisory),
					createdAt: entryData.createdAt || new Date(),
					lastModified: entryData.lastModified || new Date(),
					...entryData,
				};
				entries.push(entryFirestoreToDTO(completeEntryData));
			});

			logger.debug('Fetched entries from Firestore', {
				trackerId,
				count: entries.length,
			});
			return entries;
		} catch (error) {
			logger.error('Failed to fetch entries from Firestore', {
				error,
				trackerId,
			});

			if (error.code === 'firestore/permission-denied') {
				logger.warn(
					'Permission denied for entries, returning empty array',
					{
						trackerId,
					}
				);
				return [];
			}

			throw new SyncError('Failed to fetch entries from Firestore', {
				code: 'firestore.fetch_failed',
				originalError: error,
			});
		}
	}

	async getAllEntries(): Promise<EntryDTO[]> {
		try {
			const db = getFirestoreInstance();
			const trackersRef = collection(db, 'trackers');
			const trackersSnapshot = await getDocs(trackersRef);

			const allEntries: EntryDTO[] = [];

			for (const trackerDoc of trackersSnapshot.docs) {
				const trackerId = trackerDoc.id;
				const entriesRef = collection(
					db,
					'trackers',
					trackerId,
					'entries'
				);
				const entriesSnapshot = await getDocs(entriesRef);

				entriesSnapshot.forEach((entryDoc) => {
					const entryData = entryDoc.data();
					const completeEntryData = {
						id: entryDoc.id,
						trackerId: trackerId,
						date: entryData.date || '',
						status: entryData.status || 'office',
						isAdvisory: Boolean(entryData.isAdvisory),
						createdAt: entryData.createdAt || new Date(),
						lastModified: entryData.lastModified || new Date(),
						...entryData,
					};
					allEntries.push(entryFirestoreToDTO(completeEntryData));
				});
			}

			logger.debug('Fetched all entries from Firestore', {
				count: allEntries.length,
				trackersCount: trackersSnapshot.docs.length,
			});

			return allEntries;
		} catch (error) {
			logger.error('Failed to fetch all entries from Firestore', {
				error,
			});

			if (error.code === 'firestore/permission-denied') {
				logger.warn(
					'Permission denied for entries, returning empty array'
				);
				return [];
			}

			throw new SyncError('Failed to fetch all entries from Firestore', {
				code: 'firestore.fetch_failed',
				originalError: error,
			});
		}
	}

	async delete(entryId: string): Promise<void> {
		try {
			const db = getFirestoreInstance();

			// We need to find which tracker this entry belongs to
			// Since we don't have trackerId, we'll need to search across all trackers
			// This is a cleanup operation, so we'll search through all trackers
			const trackersRef = collection(db, 'trackers');
			const trackersSnapshot = await getDocs(trackersRef);

			let deleted = false;

			for (const trackerDoc of trackersSnapshot.docs) {
				const trackerId = trackerDoc.id;
				const entriesRef = collection(
					db,
					'trackers',
					trackerId,
					'entries'
				);
				const entryRef = doc(entriesRef, entryId);

				try {
					// Try to delete the entry from this tracker
					await deleteDoc(entryRef);
					deleted = true;
					logger.debug('Successfully deleted entry from Firebase', {
						entryId,
						trackerId,
					});
					break; // Found and deleted, no need to continue
				} catch {
					// Entry doesn't exist in this tracker, continue searching
					continue;
				}
			}

			if (!deleted) {
				logger.debug('Entry not found in any Firebase tracker', {
					entryId,
				});
			}
		} catch (error) {
			logger.error('Failed to delete entry from Firebase', {
				error,
				entryId,
			});
			throw new SyncError('Failed to delete entry from Firebase', {
				code: 'firestore.delete_failed',
				originalError: error,
			});
		}
	}
}
