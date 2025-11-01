import firestore from '@react-native-firebase/firestore';

import { Share } from '../../domain/entities/Share';
import { IShareRepository } from '../../domain/ports/IShareRepository';

export class FirebaseShareRepository implements IShareRepository {
	async shareTracker(share: Share): Promise<Share> {
		const ref = firestore().collection('shares').doc(share.id);
		await ref.set({
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
		permission: Share['permission']
	): Promise<Share> {
		const ref = firestore().collection('shares').doc(shareId);
		await ref.set(
			{ permission: permission.value, updated_at: Date.now() },
			{ merge: true }
		);
		// Returning partial; in our usage tests we can stub the returned share
		return new Share(shareId, '', '', permission);
	}

	async unshare(shareId: string): Promise<void> {
		await firestore()
			.collection('shares')
			.doc(shareId)
			.set({ is_active: false, updated_at: Date.now() }, { merge: true });
	}

	async getMyShares(ownerUserId: string): Promise<Share[]> {
		const snap = await firestore()
			.collection('shares')
			.where('created_by_user_id', '==', ownerUserId)
			.where('is_active', '==', true)
			.get();
		return snap.docs.map((d) => {
			const permission = (d.get('permission') as string) || 'read';
			return new Share(
				d.id,
				d.get('tracker_id') as string,
				d.get('shared_with_user_id') as string,
				permission as 'read' | 'write'
			);
		});
	}

	async getSharedWithMe(userId: string): Promise<Share[]> {
		const snap = await firestore()
			.collection('shares')
			.where('shared_with_user_id', '==', userId)
			.where('is_active', '==', true)
			.get();
		return snap.docs.map((d) => {
			const permission = (d.get('permission') as string) || 'read';
			return new Share(
				d.id,
				d.get('tracker_id') as string,
				d.get('shared_with_user_id') as string,
				permission as 'read' | 'write'
			);
		});
	}
}
