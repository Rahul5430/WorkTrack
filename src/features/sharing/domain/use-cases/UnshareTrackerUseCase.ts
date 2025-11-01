// Unshare tracker use case

import { logger } from '@/shared/utils/logging';

import { IShareRepository } from '../ports/IShareRepository';

export class UnshareTrackerUseCase {
	constructor(private readonly repo: IShareRepository) {}

	async execute(shareId: string): Promise<void> {
		logger.info('Unsharing tracker', { shareId });
		await this.repo.unshare(shareId);
	}
}
