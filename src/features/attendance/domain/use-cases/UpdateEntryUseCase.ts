// Update entry use case
import { logger } from '@/shared/utils/logging';

import { WorkEntry } from '../entities/WorkEntry';
import { IEntryRepository } from '../ports/IEntryRepository';
import { EntryValidator } from '../validators/EntryValidator';

export class UpdateEntryUseCase {
	constructor(private readonly entryRepository: IEntryRepository) {}

	async execute(entry: WorkEntry): Promise<WorkEntry> {
		EntryValidator.validate(entry);
		logger.info('Updating work entry', { id: entry.id });
		return this.entryRepository.update(entry);
	}
}
