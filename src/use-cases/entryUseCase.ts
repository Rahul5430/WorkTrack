import { ValidationError } from '../errors';
import { logger } from '../logging';
import { EntryDTO, ILocalEntryRepository, MarkedDayStatus } from '../types';
import { ErrorHandler } from '../utils/errorHandler';
import { ValidationUtils } from '../utils/validation';

export interface EntryUseCase {
	createOrUpdateEntry(data: {
		trackerId: string;
		date: string;
		status: MarkedDayStatus;
		isAdvisory: boolean;
	}): Promise<void>;
	getFailedSyncRecords(): Promise<EntryDTO[]>;
	getRecordsExceedingRetryLimit(limit: number): Promise<EntryDTO[]>;
	getEntriesForTracker(trackerId: string): Promise<EntryDTO[]>;
}

export class EntryUseCaseImpl implements EntryUseCase {
	constructor(private readonly entries: ILocalEntryRepository) {}

	async createOrUpdateEntry(data: {
		trackerId: string;
		date: string;
		status: MarkedDayStatus;
		isAdvisory: boolean;
	}): Promise<void> {
		if (!ValidationUtils.validateEntryData(data)) {
			throw new ValidationError('Invalid entry data provided', {
				code: 'validation.invalid_entry_data',
				details: { data },
			});
		}

		return ErrorHandler.wrapAsync(
			async () => {
				const entryDTO: EntryDTO = {
					id: data.date,
					trackerId: data.trackerId,
					date: data.date,
					status: data.status,
					isAdvisory: data.isAdvisory,
					needsSync: true,
					lastModified: Date.now(),
				};

				await this.entries.upsertOne(entryDTO);
				logger.debug('Entry created/updated successfully', {
					entryDTO,
				});
			},
			'Failed to create/update entry',
			'entry.create_failed'
		);
	}

	async getFailedSyncRecords(): Promise<EntryDTO[]> {
		return ErrorHandler.wrapAsync(
			async () => {
				const records = await this.entries.getFailedSyncRecords();
				logger.debug('Retrieved failed sync records', {
					count: records.length,
				});
				return records;
			},
			'Failed to get failed sync records',
			'entry.fetch_failed'
		);
	}

	async getRecordsExceedingRetryLimit(limit: number): Promise<EntryDTO[]> {
		return ErrorHandler.wrapAsync(
			async () => {
				const records =
					await this.entries.getRecordsExceedingRetryLimit(limit);
				logger.debug('Retrieved records exceeding retry limit', {
					limit,
					count: records.length,
				});
				return records;
			},
			'Failed to get records exceeding retry limit',
			'entry.fetch_failed'
		);
	}

	async getEntriesForTracker(trackerId: string): Promise<EntryDTO[]> {
		ErrorHandler.validateRequired(trackerId, 'trackerId');

		return ErrorHandler.wrapAsync(
			async () => {
				const entries =
					await this.entries.getEntriesForTracker(trackerId);
				logger.debug('Retrieved entries for tracker', {
					trackerId,
					count: entries.length,
				});
				return entries;
			},
			'Failed to get entries for tracker',
			'entry.fetch_failed'
		);
	}
}

export function createEntryUseCase(
	entries: ILocalEntryRepository
): EntryUseCase {
	return new EntryUseCaseImpl(entries);
}
