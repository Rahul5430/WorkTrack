// Create entry use case
import { logger } from '@/shared/utils/logging';

import { WorkEntry } from '../entities/WorkEntry';
import { IEntryRepository } from '../ports/IEntryRepository';
import { EntryValidator } from '../validators/EntryValidator';

export class CreateEntryUseCase {
	constructor(private readonly entryRepository: IEntryRepository) {}

	async execute(entry: WorkEntry): Promise<WorkEntry> {
		EntryValidator.validate(entry);
		logger.info('Creating work entry', { id: entry.id, date: entry.date });
		return this.entryRepository.create(entry);
	}
}
