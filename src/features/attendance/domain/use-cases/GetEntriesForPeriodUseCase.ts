// Get entries for period use case
import { logger } from '@/shared/utils/logging';

import { DateRange } from '../entities/DateRange';
import { WorkEntry } from '../entities/WorkEntry';
import { IEntryRepository } from '../ports/IEntryRepository';

export class GetEntriesForPeriodUseCase {
	constructor(private readonly entryRepository: IEntryRepository) {}

	async execute(
		userId: string,
		range: DateRange,
		trackerId?: string
	): Promise<WorkEntry[]> {
		logger.info('Querying entries for period', {
			userId,
			range: range.toString(),
			trackerId,
		});
		return this.entryRepository.getForPeriod(userId, range, trackerId);
	}
}
