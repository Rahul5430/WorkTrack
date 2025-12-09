import { logger } from '@/shared/utils/logging';

import { ISyncRepository } from '../ports/ISyncRepository';

export class SyncFromRemoteUseCase {
	constructor(private readonly syncRepo: ISyncRepository) {}

	async execute(since?: Date): Promise<void> {
		logger.info('Syncing from remote', { since });
		await this.syncRepo.syncFromRemote(since);
	}
}
