import type { ISyncOpOutcome } from '@/shared/api/sync/types';

export interface ISyncRepository {
	syncToRemote(
		operations: { id: string; payload: unknown }[]
	): Promise<ISyncOpOutcome[]>;
	syncFromRemote(since?: Date): Promise<void>;
}
