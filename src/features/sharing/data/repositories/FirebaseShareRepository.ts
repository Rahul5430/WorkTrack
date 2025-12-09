import { getApp } from '@react-native-firebase/app';
import {
	collection,
	collectionGroup,
	doc,
	getDoc,
	getDocs,
	getFirestore,
	query,
	setDoc,
	where,
} from '@react-native-firebase/firestore';

import type { FirestoreShareDocument } from '@/shared/data/database/firebase';

import { Share } from '../../domain/entities/Share';
import { IShareRepository } from '../../domain/ports/IShareRepository';

export class FirebaseShareRepository implements IShareRepository {
	private readonly firestore;

	constructor() {
		const app = getApp();
		this.firestore = getFirestore(app);
	}

	async shareTracker(share: Share): Promise<Share> {
		// Shares are stored under trackers/{trackerId}/shares/{shareId}
		const trackerRef = doc(this.firestore, 'trackers', share.trackerId);
		const sharesRef = collection(trackerRef, 'shares');
		const shareRef = doc(sharesRef, share.id);
		await setDoc(shareRef, {
			tracker_id: share.trackerId,
			shared_with_user_id: share.sharedWithUserId,
			permission: share.permission.value,
			is_active: share.isActive,
			created_at: share.createdAt.getTime(),
			updated_at: share.updatedAt.getTime(),
		});
		return share;
	}

	async updatePermission(
		shareId: string,
		permission: Share['permission'],
		trackerId?: string
	): Promise<Share> {
		let shareRef: ReturnType<typeof doc>;
		let shareData: FirestoreShareDocument | undefined;

		if (trackerId) {
			// Use trackerId directly for efficient access
			const trackerRef = doc(this.firestore, 'trackers', trackerId);
			const sharesRef = collection(trackerRef, 'shares');
			shareRef = doc(sharesRef, shareId);
			// Fetch current data to return complete Share object
			const shareDocSnap = await getDoc(shareRef);
			const data = shareDocSnap.data();
			if (!data) {
				throw new Error(`Share not found: ${shareId}`);
			}
			shareData = {
				id: shareDocSnap.id,
				...data,
			} as FirestoreShareDocument;
		} else {
			// Fallback to collectionGroup lookup (less efficient)
			const sharesGroup = collectionGroup(this.firestore, 'shares');
			const snapshot = await getDocs(sharesGroup);

			// Find the share by ID (filter in code since Firestore doesn't support querying by doc ID)
			const shareDoc = snapshot.docs.find(
				(docSnapshot: { id: string }) => docSnapshot.id === shareId
			);

			if (!shareDoc) {
				throw new Error(`Share not found: ${shareId}`);
			}

			shareRef = shareDoc.ref;
			shareData = {
				id: shareDoc.id,
				...shareDoc.data(),
			} as FirestoreShareDocument;
		}

		await setDoc(
			shareRef,
			{ permission: permission.value, updated_at: Date.now() },
			{ merge: true }
		);

		// Return share with full data from Firestore
		return new Share(
			shareId,
			shareData.tracker_id,
			shareData.shared_with_user_id,
			permission
		);
	}

	async unshare(shareId: string, trackerId?: string): Promise<void> {
		let shareRef: ReturnType<typeof doc>;

		if (trackerId) {
			// Use trackerId directly for efficient access
			const trackerRef = doc(this.firestore, 'trackers', trackerId);
			const sharesRef = collection(trackerRef, 'shares');
			shareRef = doc(sharesRef, shareId);
		} else {
			// Fallback to collectionGroup lookup (less efficient)
			const sharesGroup = collectionGroup(this.firestore, 'shares');
			const snapshot = await getDocs(sharesGroup);

			// Find the share by ID (filter in code since Firestore doesn't support querying by doc ID)
			const shareDoc = snapshot.docs.find(
				(docSnapshot: { id: string }) => docSnapshot.id === shareId
			);

			if (!shareDoc) {
				throw new Error(`Share not found: ${shareId}`);
			}

			shareRef = shareDoc.ref;
		}

		await setDoc(
			shareRef,
			{ is_active: false, updated_at: Date.now() },
			{ merge: true }
		);
	}

	async getMyShares(ownerUserId: string): Promise<Share[]> {
		// Use collectionGroup to query all shares across all trackers
		const sharesGroup = collectionGroup(this.firestore, 'shares');
		const sharesQuery = query(
			sharesGroup,
			where('created_by_user_id', '==', ownerUserId),
			where('is_active', '==', true)
		);
		const snapshot = await getDocs(sharesQuery);
		return snapshot.docs.map(
			(docSnapshot: {
				id: string;
				data: () => Partial<FirestoreShareDocument>;
			}) => {
				const data = {
					id: docSnapshot.id,
					...docSnapshot.data(),
				} as FirestoreShareDocument;
				return new Share(
					data.id,
					data.tracker_id,
					data.shared_with_user_id,
					data.permission || 'read' // Default to 'read' if permission is null/undefined
				);
			}
		);
	}

	async getSharedWithMe(userId: string): Promise<Share[]> {
		// Use collectionGroup to query all shares across all trackers
		const sharesGroup = collectionGroup(this.firestore, 'shares');
		const sharesQuery = query(
			sharesGroup,
			where('shared_with_user_id', '==', userId),
			where('is_active', '==', true)
		);
		const snapshot = await getDocs(sharesQuery);
		return snapshot.docs.map(
			(docSnapshot: {
				id: string;
				data: () => Partial<FirestoreShareDocument>;
			}) => {
				const data = {
					id: docSnapshot.id,
					...docSnapshot.data(),
				} as FirestoreShareDocument;
				return new Share(
					data.id,
					data.tracker_id,
					data.shared_with_user_id,
					data.permission || 'read' // Default to 'read' if permission is null/undefined
				);
			}
		);
	}
}
