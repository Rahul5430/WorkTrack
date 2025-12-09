import { logger } from '@/shared/utils/logging';

import { Share } from '../entities/Share';
import { IShareRepository } from '../ports/IShareRepository';

export class ShareTrackerUseCase {
	constructor(private readonly repo: IShareRepository) {}

	async execute(share: Share): Promise<Share> {
		logger.info('Sharing tracker', { trackerId: share.trackerId });
		return await this.repo.shareTracker(share);
	}
}
