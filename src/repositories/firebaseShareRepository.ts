import { getApp } from '@react-native-firebase/app';
import {
	collectionGroup,
	doc,
	getDocs,
	getFirestore,
	query,
	setDoc,
	where,
} from '@react-native-firebase/firestore';

import { SyncError } from '../errors';
import { logger } from '../logging';
import { shareDTOToFirestore } from '../mappers/shareMapper';
import { IShareRepository, Permission, ShareDTO } from '../types';

export class FirebaseShareRepository implements IShareRepository {
	async share(share: ShareDTO): Promise<void> {
		try {
			const db = getFirestore(getApp());
			// Store share in /trackers/{trackerId}/shares/{sharedWithId}
			const shareRef = doc(
				db,
				'trackers',
				share.trackerId,
				'shares',
				share.sharedWithId
			);
			const firestoreData = shareDTOToFirestore(share);
			await setDoc(shareRef, firestoreData);
		} catch (error) {
			logger.error('Failed to share tracker', { error, share });
			throw new SyncError('Failed to share tracker', {
				code: 'firestore.share_failed',
				originalError: error,
			});
		}
	}

	async updatePermission(
		shareId: string,
		permission: Permission
	): Promise<void> {
		try {
			// Find the share document using collectionGroup query
			const db = getFirestore(getApp());
			const sharesQuery = query(
				collectionGroup(db, 'shares'),
				where('sharedWithId', '==', shareId)
			);
			const querySnapshot = await getDocs(sharesQuery);

			if (querySnapshot.empty) {
				throw new Error('Share not found');
			}

			const shareDoc = querySnapshot.docs[0];
			await setDoc(shareDoc.ref, { permission }, { merge: true });
		} catch (error) {
			logger.error('Failed to update share permission', {
				error,
				shareId,
				permission,
			});
			throw new SyncError('Failed to update share permission', {
				code: 'firestore.update_failed',
				originalError: error,
			});
		}
	}

	async unshare(trackerId: string, sharedWithId: string): Promise<void> {
		try {
			const db = getFirestore(getApp());
			const shareRef = doc(
				db,
				'trackers',
				trackerId,
				'shares',
				sharedWithId
			);
			await shareRef.delete();
		} catch (error) {
			logger.error('Failed to unshare tracker', {
				error,
				trackerId,
				sharedWithId,
			});
			throw new SyncError('Failed to unshare tracker', {
				code: 'firestore.unshare_failed',
				originalError: error,
			});
		}
	}
}
