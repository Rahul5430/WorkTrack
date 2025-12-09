// Delete entry use case
import { logger } from '@/shared/utils/logging';

import { IEntryRepository } from '../ports/IEntryRepository';

export class DeleteEntryUseCase {
	constructor(private readonly entryRepository: IEntryRepository) {}

	async execute(entryId: string): Promise<void> {
		logger.info('Deleting work entry', { id: entryId });
		await this.entryRepository.delete(entryId);
	}
}
