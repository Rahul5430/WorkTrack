// migrated to V2 structure
import {
	collection,
	deleteDoc,
	doc,
	DocumentData,
	getDoc,
	getDocs,
	limit,
	onSnapshot,
	orderBy,
	query,
	QueryConstraint,
	QueryDocumentSnapshot,
	serverTimestamp,
	setDoc,
	startAfter,
	Timestamp,
	Unsubscribe,
	updateDoc,
	where,
	WriteBatch,
	writeBatch,
} from 'firebase/firestore';

import { logger } from '@/logging';

import { firestore } from './Firebase';

export class FirestoreClient {
	private db: typeof firestore;

	constructor() {
		this.db = firestore;
	}

	/**
	 * Get a document by ID
	 */
	async getDocument<T = DocumentData>(
		collectionName: string,
		documentId: string
	): Promise<T | null> {
		try {
			const docRef = doc(this.db, collectionName, documentId);
			const docSnap = await getDoc(docRef);

			if (docSnap.exists()) {
				return { id: docSnap.id, ...docSnap.data() } as T;
			}

			return null;
		} catch (error) {
			logger.error('Error getting document:', error);
			throw error;
		}
	}

	/**
	 * Get all documents from a collection
	 */
	async getCollection<T = DocumentData>(
		collectionName: string,
		constraints: QueryConstraint[] = []
	): Promise<T[]> {
		try {
			const collectionRef = collection(this.db, collectionName);
			const q = query(collectionRef, ...constraints);
			const querySnapshot = await getDocs(q);

			return querySnapshot.docs.map((docSnapshot) => ({
				id: docSnapshot.id,
				...docSnapshot.data(),
			})) as T[];
		} catch (error) {
			logger.error('Error getting collection:', error);
			throw error;
		}
	}

	/**
	 * Create or update a document
	 */
	async setDocument<T = DocumentData>(
		collectionName: string,
		documentId: string,
		data: Partial<T>
	): Promise<void> {
		try {
			const docRef = doc(this.db, collectionName, documentId);
			await setDoc(docRef, {
				...data,
				updatedAt: serverTimestamp(),
			});
		} catch (error) {
			logger.error('Error setting document:', error);
			throw error;
		}
	}

	/**
	 * Update a document
	 */
	async updateDocument<T = DocumentData>(
		collectionName: string,
		documentId: string,
		data: Partial<T>
	): Promise<void> {
		try {
			const docRef = doc(this.db, collectionName, documentId);
			await updateDoc(docRef, {
				...data,
				updatedAt: serverTimestamp(),
			});
		} catch (error) {
			logger.error('Error updating document:', error);
			throw error;
		}
	}

	/**
	 * Delete a document
	 */
	async deleteDocument(
		collectionName: string,
		documentId: string
	): Promise<void> {
		try {
			const docRef = doc(this.db, collectionName, documentId);
			await deleteDoc(docRef);
		} catch (error) {
			logger.error('Error deleting document:', error);
			throw error;
		}
	}

	/**
	 * Listen to a document for real-time updates
	 */
	subscribeToDocument<T = DocumentData>(
		collectionName: string,
		documentId: string,
		callback: (data: T | null) => void
	): Unsubscribe {
		const docRef = doc(this.db, collectionName, documentId);

		return onSnapshot(
			docRef,
			(docSnap) => {
				if (docSnap.exists()) {
					callback({ id: docSnap.id, ...docSnap.data() } as T);
				} else {
					callback(null);
				}
			},
			(error) => {
				logger.error('Error in document subscription:', error);
				callback(null);
			}
		);
	}

	/**
	 * Listen to a collection for real-time updates
	 */
	subscribeToCollection<T = DocumentData>(
		collectionName: string,
		constraints: QueryConstraint[] = [],
		callback: (data: T[]) => void
	): Unsubscribe {
		const collectionRef = collection(this.db, collectionName);
		const q = query(collectionRef, ...constraints);

		return onSnapshot(
			q,
			(querySnapshot) => {
				const data = querySnapshot.docs.map((docSnapshot) => ({
					id: docSnapshot.id,
					...docSnapshot.data(),
				})) as T[];
				callback(data);
			},
			(error) => {
				logger.error('Error in collection subscription:', error);
				callback([]);
			}
		);
	}

	/**
	 * Create a batch for multiple operations
	 */
	createBatch(): WriteBatch {
		return writeBatch(this.db);
	}

	/**
	 * Execute a batch
	 */
	async executeBatch(batch: WriteBatch): Promise<void> {
		try {
			await batch.commit();
		} catch (error) {
			logger.error('Error executing batch:', error);
			throw error;
		}
	}

	/**
	 * Query helper methods
	 */
	static where(field: string, operator: unknown, value: unknown) {
		return where(field, operator, value);
	}

	static orderBy(field: string, direction: 'asc' | 'desc' = 'asc') {
		return orderBy(field, direction);
	}

	static limit(count: number) {
		return limit(count);
	}

	static startAfter(docSnapshot: QueryDocumentSnapshot) {
		return startAfter(docSnapshot);
	}

	/**
	 * Convert Firestore timestamp to JavaScript Date
	 */
	static timestampToDate(timestamp: Timestamp | null): Date | null {
		if (!timestamp) return null;
		return timestamp.toDate();
	}

	/**
	 * Convert JavaScript Date to Firestore timestamp
	 */
	static dateToTimestamp(date: Date): Timestamp {
		return Timestamp.fromDate(date);
	}
}

// Export singleton instance
export const firestoreClient = new FirestoreClient();

// Export default
export default firestoreClient;
