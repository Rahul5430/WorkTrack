// Firebase sync repository
import firestore from '@react-native-firebase/firestore';

import { logger } from '@/shared/utils/logging';

import { ISyncRepository } from '../../domain/ports/ISyncRepository';
import type { ISyncOpOutcome } from '../../domain/types';

export class FirebaseSyncRepository implements ISyncRepository {
	async syncToRemote(
		operations: { id: string; payload: unknown }[]
	): Promise<ISyncOpOutcome[]> {
		logger.info('Syncing operations to remote', {
			count: operations.length,
		});
		const batch = firestore().batch();

		for (const op of operations) {
			// We expect payload shape to contain tableName, recordId, operation, data
			const payload = op.payload as {
				tableName: string;
				recordId: string;
				operation: 'create' | 'update' | 'delete';
				data?: Record<string, unknown>;
			};
			const ref = firestore()
				.collection(payload.tableName)
				.doc(payload.recordId);

			switch (payload.operation) {
				case 'create':
				case 'update':
					if (payload.data) {
						batch.set(ref, payload.data, { merge: true });
					}
					break;
				case 'delete':
					batch.delete(ref);
					break;
			}
		}

		await batch.commit();
		logger.info('Successfully synced operations to remote');
		return operations.map((o) => ({ opId: o.id, success: true }));
	}

	async syncFromRemote(since?: Date): Promise<void> {
		logger.info('Syncing from remote', { since });
		// Collections to pull from remote. Align with schema table names
		const collections = ['work_entries', 'trackers', 'users', 'shares'];
		const sinceMs = since ? since.getTime() : undefined;

		for (const name of collections) {
			let query = firestore().collection(name) as ReturnType<
				typeof firestore.prototype.collection
			>;
			if (sinceMs) {
				query = query.where('updated_at', '>', sinceMs);
			}
			// Note: For now, we only read; applying to local DB is handled by
			// a dedicated mapper/repository in a subsequent step of the manager flow.
			const snapshot = await query.get();
			logger.info('Pulled remote changes', {
				collection: name,
				count: snapshot.size,
			});
			// Future: upsert into WatermelonDB within a single write block
		}
	}
}
