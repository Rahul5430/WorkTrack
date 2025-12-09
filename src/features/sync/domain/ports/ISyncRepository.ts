import { SyncOperationPayload } from '../entities/SyncOperation';
import type { ISyncOpOutcome } from '../types';

export interface ISyncRepository {
	syncToRemote(
		operations: { id: string; payload: SyncOperationPayload }[]
	): Promise<ISyncOpOutcome[]>;
	syncFromRemote(since?: Date): Promise<void>;
}
