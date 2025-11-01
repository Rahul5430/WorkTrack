import type { ISyncOpOutcome } from './types';

export interface ISyncRepository {
	syncToRemote(
		ops: { id: string; payload: unknown }[]
	): Promise<ISyncOpOutcome[]>;
}
