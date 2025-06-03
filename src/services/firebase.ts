import { getApp } from '@react-native-firebase/app';
import { getAuth } from '@react-native-firebase/auth';
import {
	collection,
	deleteDoc,
	doc,
	getDoc,
	getDocs,
	getFirestore,
	query,
	setDoc,
	where,
	writeBatch,
} from '@react-native-firebase/firestore';

import { FIREBASE_COLLECTIONS } from '../constants/firebase';
import { addMarkedDay } from '../db/watermelon/worktrack/load';
import { MarkedDayStatus } from '../types/calendar';
import { SyncError } from './sync';

export interface SharePermission {
	ownerId: string;
	sharedWithId: string;
	sharedWithEmail: string;
	permission: 'read' | 'write';
	ownerName?: string;
	ownerPhoto?: string;
}

export type SharedWorkTrackData = {
	ownerId: string;
	ownerName?: string;
	ownerEmail: string;
	ownerPhoto?: string;
	permission: 'read' | 'write';
};

export default class FirebaseService {
	private static instance: FirebaseService;
	private readonly COLLECTION_NAME = FIREBASE_COLLECTIONS.WORK_TRACKS;
	private readonly SHARING_COLLECTION = FIREBASE_COLLECTIONS.SHARING;

	private constructor() {}

	static getInstance(): FirebaseService {
		if (!FirebaseService.instance) {
			FirebaseService.instance = new FirebaseService();
		}
		return FirebaseService.instance;
	}

	async shareWorkTrack(
		sharedWithId: string,
		permission: 'read' | 'write'
	): Promise<void> {
		const userId = getAuth(getApp()).currentUser?.uid;
		if (!userId) {
			throw new SyncError('User not authenticated', 'AUTH_ERROR');
		}

		const db = getFirestore(getApp());
		let sharedWithUserId = sharedWithId;
		let sharedWithEmail = sharedWithId.toLowerCase();

		try {
			const userQuery = query(
				collection(db, 'users'),
				where('email', '==', sharedWithId.toLowerCase())
			);
			const userSnapshot = await getDocs(userQuery);

			if (!userSnapshot.empty) {
				const userDoc = userSnapshot.docs[0];
				sharedWithUserId = userDoc.id;
				sharedWithEmail = userDoc.data().email;
			}
		} catch (error) {
			if (
				error instanceof Error &&
				'code' in error &&
				error.code === 'permission-denied'
			) {
				throw new SyncError(
					'Permission denied. Please check your Firestore rules.',
					'PERMISSION_DENIED'
				);
			}
			if (
				error instanceof Error &&
				'code' in error &&
				error.code !== 'not-found'
			) {
				throw error;
			}
		}

		const shareData = {
			ownerId: userId,
			sharedWithId: sharedWithUserId,
			sharedWithEmail: sharedWithEmail,
			permission,
			createdAt: new Date(),
			updatedAt: new Date(),
		};

		try {
			// Create a custom document ID using owner and shared user IDs
			const docId = `${userId}_${sharedWithUserId}`;
			const shareRef = doc(db, this.SHARING_COLLECTION, docId);
			await setDoc(shareRef, shareData);
		} catch (error) {
			if (
				error instanceof Error &&
				'code' in error &&
				error.code === 'permission-denied'
			) {
				throw new SyncError(
					'Permission denied. Please check your Firestore rules.',
					'PERMISSION_DENIED'
				);
			}
			throw error;
		}
	}

	async removeShare(sharedWithId: string): Promise<void> {
		const userId = getAuth().currentUser?.uid;
		if (!userId) {
			throw new SyncError('User not authenticated', 'AUTH_ERROR');
		}

		const db = getFirestore();
		const q = query(
			collection(db, this.SHARING_COLLECTION),
			where('ownerId', '==', userId),
			where('sharedWithId', '==', sharedWithId)
		);
		const snapshot = await getDocs(q);

		for (const doc of snapshot.docs) {
			await deleteDoc(doc.ref);
		}
	}

	async getSharedWithMe(): Promise<SharePermission[]> {
		const userId = getAuth().currentUser?.uid;
		if (!userId) {
			throw new SyncError('User not authenticated', 'AUTH_ERROR');
		}

		const db = getFirestore(getApp());
		const q = query(
			collection(db, this.SHARING_COLLECTION),
			where('sharedWithId', '==', userId)
		);
		const snapshot = await getDocs(q);

		const shares = await Promise.all(
			snapshot.docs.map(async (docSnapshot) => {
				const shareData = docSnapshot.data() as SharePermission;
				const ownerDoc = await getDoc(
					doc(db, 'users', shareData.ownerId)
				);
				const ownerData = ownerDoc.data();
				return {
					...shareData,
					sharedWithEmail: ownerData?.email ?? shareData.ownerId,
					ownerName: ownerData?.name,
					ownerPhoto: ownerData?.photo,
				};
			})
		);

		return shares;
	}

	async getMyShares(): Promise<SharePermission[]> {
		try {
			const user = getAuth().currentUser;
			if (!user) throw new Error('No user logged in');

			const db = getFirestore(getApp());
			const sharesRef = collection(db, this.SHARING_COLLECTION);
			const q = query(sharesRef, where('ownerId', '==', user.uid));
			const querySnapshot = await getDocs(q);
			const shares: SharePermission[] = [];

			for (const shareDoc of querySnapshot.docs) {
				const shareData = shareDoc.data();
				// Get user details from users collection
				const userDocRef = doc(db, 'users', shareData.sharedWithId);
				const userDoc = await getDoc(userDocRef);
				const userData = userDoc.data() as
					| { name?: string; photo?: string }
					| undefined;

				shares.push({
					ownerId: shareData.ownerId,
					sharedWithId: shareData.sharedWithId,
					sharedWithEmail: shareData.sharedWithEmail,
					permission: shareData.permission,
					ownerName: userData?.name,
					ownerPhoto: userData?.photo,
				});
			}

			return shares;
		} catch (error) {
			console.error('Error getting my shares:', error);
			throw error;
		}
	}

	async updateSharePermission(
		sharedWithId: string,
		newPermission: 'read' | 'write'
	): Promise<void> {
		const userId = getAuth().currentUser?.uid;
		if (!userId) {
			throw new SyncError('User not authenticated', 'AUTH_ERROR');
		}

		const db = getFirestore();
		const q = query(
			collection(db, this.SHARING_COLLECTION),
			where('ownerId', '==', userId),
			where('sharedWithId', '==', sharedWithId)
		);
		const snapshot = await getDocs(q);

		for (const doc of snapshot.docs) {
			await doc.ref.update({
				permission: newPermission,
				updatedAt: new Date(),
			});
		}
	}

	async syncToFirebase(records: any[], userId: string): Promise<void> {
		const db = getFirestore();
		const batchRef = writeBatch(db);

		for (const record of records) {
			const docId = `${record.date}_${userId}`;
			const docRef = doc(db, this.COLLECTION_NAME, docId);

			batchRef.set(
				docRef,
				{
					date: record.date,
					status: record.status,
					userId,
					lastModified: record.lastModified,
					createdAt: record.createdAt,
					isAdvisory: record.isAdvisory,
				},
				{ merge: true }
			);
		}

		await batchRef.commit();
	}

	async syncFromFirebase(userId: string): Promise<any[]> {
		const db = getFirestore();
		const q = query(
			collection(db, this.COLLECTION_NAME),
			where('userId', '==', userId)
		);

		const snapshot = await getDocs(q);
		return snapshot.docs.map((doc) => doc.data());
	}

	async syncWorkTrackData(): Promise<void> {
		try {
			const userId = getAuth(getApp()).currentUser?.uid;
			if (!userId) {
				throw new SyncError('User not authenticated', 'AUTH_ERROR');
			}

			// Get data from Firestore
			const db = getFirestore(getApp());
			const q = query(
				collection(db, FIREBASE_COLLECTIONS.WORK_TRACKS),
				where('userId', '==', userId)
			);
			const querySnapshot = await getDocs(q);
			const firestoreData = querySnapshot.docs.map((doc) => ({
				id: doc.id,
				...doc.data(),
			})) as Array<{
				id: string;
				date: string;
				status: MarkedDayStatus;
				isAdvisory: boolean;
			}>;

			// Update local database
			for (const data of firestoreData) {
				await addMarkedDay({
					date: data.date,
					status: data.status,
					isAdvisory: data.isAdvisory ?? false,
				});
			}
		} catch (error) {
			console.error('Error syncing work track data:', error);
			if (
				error instanceof Error &&
				'code' in error &&
				error.code === 'permission-denied'
			) {
				throw new SyncError(
					'Permission denied. Please check your Firestore rules.',
					'PERMISSION_DENIED'
				);
			}
			throw error;
		}
	}

	async getSharedWorkTracks(): Promise<SharedWorkTrackData[]> {
		const user = getAuth().currentUser;
		if (!user) throw new Error('No user logged in');

		// Get shared worktracks
		const sharedTracks = await this.getSharedWithMe();
		const sharedWorkTracks: SharedWorkTrackData[] = sharedTracks.map(
			(track) => ({
				ownerId: track.ownerId,
				ownerName: track.ownerName,
				ownerEmail: track.sharedWithEmail,
				ownerPhoto: track.ownerPhoto,
				permission: track.permission,
			})
		);

		// Add current user's worktrack
		const db = getFirestore(getApp());
		const currentUserDoc = await getDoc(doc(db, 'users', user.uid));

		if (currentUserDoc.exists()) {
			const userData = currentUserDoc.data();
			sharedWorkTracks.unshift({
				ownerId: user.uid,
				ownerName: userData?.displayName,
				ownerEmail: userData?.email,
				ownerPhoto: userData?.photoURL,
				permission: 'write',
			});
		}

		return sharedWorkTracks;
	}
}

export const getWorkTrackData = async () => {
	try {
		const db = getFirestore(getApp());
		const querySnapshot = await getDocs(
			collection(db, FIREBASE_COLLECTIONS.WORK_TRACKS)
		);
		return querySnapshot.docs.map((doc) => ({
			id: doc.id,
			...doc.data(),
		}));
	} catch (error) {
		console.error('Error fetching work track data:', error);
		throw error;
	}
};
