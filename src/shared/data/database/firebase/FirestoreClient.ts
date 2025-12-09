// migrated to V2 structure
// React Native Firebase Firestore client using modular API (v22+)
import { getApp } from '@react-native-firebase/app';
import firestoreModule, {
	FirebaseFirestoreTypes,
	getFirestore,
} from '@react-native-firebase/firestore';

import { logger } from '@/shared/utils/logging';

import { DocumentData } from './FirestoreDocumentTypes';
import type {
	FirestoreQueryConstraint,
	FirestoreQueryValue,
} from './FirestoreQueryTypes';

// Re-export for backwards compatibility
export type { DocumentData } from './FirestoreDocumentTypes';
export type {
	FirestoreQueryConstraint,
	FirestoreQueryValue,
} from './FirestoreQueryTypes';

export class FirestoreClient {
	private db: FirebaseFirestoreTypes.Module;

	constructor() {
		const app = getApp();
		this.db = getFirestore(app);
	}

	/**
	 * Get a document by ID
	 */
	async getDocument<T = DocumentData>(
		collectionName: string,
		documentId: string
	): Promise<T | null> {
		try {
			const docRef = this.db.collection(collectionName).doc(documentId);
			const docSnap = await docRef.get();

			const data = docSnap.data();
			if (data) {
				return { id: docSnap.id, ...data } as T;
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
		constraints: FirestoreQueryConstraint[] = []
	): Promise<T[]> {
		try {
			const collectionRef = this.db.collection(collectionName);
			let queryRef:
				| FirebaseFirestoreTypes.Query
				| FirebaseFirestoreTypes.CollectionReference = collectionRef;

			// Apply constraints (where, orderBy, limit, etc.)
			for (const constraint of constraints) {
				if (constraint.type === 'where') {
					queryRef = queryRef.where(
						constraint.field,
						constraint.operator,
						constraint.value
					);
				} else if (constraint.type === 'orderBy') {
					queryRef = queryRef.orderBy(
						constraint.field,
						constraint.direction || 'asc'
					);
				} else if (constraint.type === 'limit') {
					queryRef = queryRef.limit(constraint.count);
				} else if (constraint.type === 'startAfter') {
					queryRef = queryRef.startAfter(constraint.docSnapshot);
				}
			}

			const querySnapshot = await queryRef.get();

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
			const docRef = this.db.collection(collectionName).doc(documentId);
			await docRef.set(
				{
					...data,
					updatedAt: firestoreModule.FieldValue.serverTimestamp(),
				},
				{ merge: true }
			);
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
			const docRef = this.db.collection(collectionName).doc(documentId);
			await docRef.update({
				...data,
				updatedAt: firestoreModule.FieldValue.serverTimestamp(),
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
			const docRef = this.db.collection(collectionName).doc(documentId);
			await docRef.delete();
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
	): () => void {
		const docRef = this.db.collection(collectionName).doc(documentId);

		return docRef.onSnapshot(
			(docSnap) => {
				const data = docSnap.data();
				if (data) {
					callback({ id: docSnap.id, ...data } as T);
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
		constraints: FirestoreQueryConstraint[] = [],
		callback: (data: T[]) => void
	): () => void {
		const collectionRef = this.db.collection(collectionName);
		let queryRef:
			| FirebaseFirestoreTypes.Query
			| FirebaseFirestoreTypes.CollectionReference = collectionRef;

		// Apply constraints
		for (const constraint of constraints) {
			if (constraint.type === 'where') {
				queryRef = queryRef.where(
					constraint.field,
					constraint.operator,
					constraint.value
				);
			} else if (constraint.type === 'orderBy') {
				queryRef = queryRef.orderBy(
					constraint.field,
					constraint.direction || 'asc'
				);
			} else if (constraint.type === 'limit') {
				queryRef = queryRef.limit(constraint.count);
			} else if (constraint.type === 'startAfter') {
				queryRef = queryRef.startAfter(constraint.docSnapshot);
			}
		}

		return queryRef.onSnapshot(
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
	createBatch(): FirebaseFirestoreTypes.WriteBatch {
		return this.db.batch();
	}

	/**
	 * Execute a batch
	 */
	async executeBatch(
		batch: FirebaseFirestoreTypes.WriteBatch
	): Promise<void> {
		try {
			await batch.commit();
		} catch (error) {
			logger.error('Error executing batch:', error);
			throw error;
		}
	}

	/**
	 * Query helper methods
	 * These methods create typed constraint objects for building Firestore queries
	 */
	static where(
		field: string,
		operator: FirebaseFirestoreTypes.WhereFilterOp,
		value: FirestoreQueryValue
	): FirestoreQueryConstraint {
		return { type: 'where', field, operator, value };
	}

	static orderBy(
		field: string,
		direction: 'asc' | 'desc' = 'asc'
	): FirestoreQueryConstraint {
		return { type: 'orderBy', field, direction };
	}

	static limit(count: number): FirestoreQueryConstraint {
		return { type: 'limit', count };
	}

	static startAfter(
		docSnapshot: FirebaseFirestoreTypes.QueryDocumentSnapshot
	): FirestoreQueryConstraint {
		return { type: 'startAfter', docSnapshot };
	}

	/**
	 * Convert Firestore timestamp to JavaScript Date
	 */
	static timestampToDate(
		timestamp: FirebaseFirestoreTypes.Timestamp | null
	): Date | null {
		if (!timestamp) return null;
		return timestamp.toDate();
	}

	/**
	 * Convert JavaScript Date to Firestore timestamp
	 */
	static dateToTimestamp(date: Date): FirebaseFirestoreTypes.Timestamp {
		return firestoreModule.Timestamp.fromDate(date);
	}
}

// Export singleton instance
export const firestoreClient = new FirestoreClient();

// Export default
export default firestoreClient;
