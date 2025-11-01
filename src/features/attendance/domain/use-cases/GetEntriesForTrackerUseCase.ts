// Get entries for tracker use case
import { logger } from '@/shared/utils/logging';

import { WorkEntry } from '../entities/WorkEntry';
import { IEntryRepository } from '../ports/IEntryRepository';

export class GetEntriesForTrackerUseCase {
	constructor(private readonly entryRepository: IEntryRepository) {}

	async execute(trackerId: string): Promise<WorkEntry[]> {
		logger.info('Querying entries for tracker', { trackerId });
		return this.entryRepository.getForTracker(trackerId);
	}
}
