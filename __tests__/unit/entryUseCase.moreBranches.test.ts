import { SyncError, ValidationError } from '../../src/errors';
import { EntryDTO, ILocalEntryRepository } from '../../src/types';
import { EntryUseCaseImpl } from '../../src/use-cases/entryUseCase';

jest.mock('../../src/logging', () => {
	const debug = jest.fn();
	const info = jest.fn();
	const warn = jest.fn();
	const error = jest.fn();
	return { logger: { debug, info, warn, error } };
});

describe('EntryUseCaseImpl - branches and error paths', () => {
	const now = Date.now;

	beforeEach(() => {
		jest.clearAllMocks();
		// stabilize time
		Date.now = () => 1700000000000;
	});

	afterEach(() => {
		Date.now = now;
	});

	const createRepo = (
		overrides?: Partial<ILocalEntryRepository>
	): ILocalEntryRepository => ({
		upsertMany: jest.fn(),
		upsertOne: jest.fn(),
		delete: jest.fn(),
		getEntriesForTracker: jest.fn(async () => []),
		getAllEntries: jest.fn(async () => []),
		listUnsynced: jest.fn(async () => []),
		markSynced: jest.fn(async () => undefined),
		getFailedSyncRecords: jest.fn(async () => []),
		getRecordsExceedingRetryLimit: jest.fn(async () => []),
		...overrides,
	});

	it('createOrUpdateEntry - throws ValidationError for invalid data', async () => {
		const repo = createRepo();
		const useCase = new EntryUseCaseImpl(repo);
		await expect(
			useCase.createOrUpdateEntry({
				trackerId: 't1',
				date: 'bad-date',
				status: 'office',
				isAdvisory: false,
			})
		).rejects.toBeInstanceOf(ValidationError);
	});

	it('createOrUpdateEntry - upserts with computed DTO and logs', async () => {
		const upsertOne = jest.fn(async () => undefined);
		const repo = createRepo({ upsertOne });
		const useCase = new EntryUseCaseImpl(repo);

		await useCase.createOrUpdateEntry({
			trackerId: 't1',
			date: '2025-01-02',
			status: 'office',
			isAdvisory: true,
		});

		expect(upsertOne).toHaveBeenCalledTimes(1);
		const [dto] = upsertOne.mock.calls[0]! as unknown as [EntryDTO];
		expect(dto).toMatchObject({
			id: '2025-01-02',
			trackerId: 't1',
			date: '2025-01-02',
			status: 'office',
			isAdvisory: true,
			needsSync: true,
		});
		expect(typeof dto.lastModified).toBe('number');
	});

	it('createOrUpdateEntry - wraps repository error into SyncError', async () => {
		const upsertOne = jest.fn(async () => {
			throw new Error('boom');
		});
		const repo = createRepo({ upsertOne });
		const useCase = new EntryUseCaseImpl(repo);
		await expect(
			useCase.createOrUpdateEntry({
				trackerId: 't1',
				date: '2025-01-02',
				status: 'office',
				isAdvisory: false,
			})
		).rejects.toBeInstanceOf(SyncError);
	});

	it('getFailedSyncRecords - returns and logs', async () => {
		const records: EntryDTO[] = [
			{
				id: 'd',
				trackerId: 't',
				date: '2025-01-01',
				status: 'office',
				isAdvisory: false,
				needsSync: true,
				lastModified: 1,
			},
		];
		const getFailedSyncRecords = jest.fn(async () => records);
		const repo = createRepo({ getFailedSyncRecords });
		const useCase = new EntryUseCaseImpl(repo);
		const result = await useCase.getFailedSyncRecords();
		expect(result).toEqual(records);
	});

	it('getRecordsExceedingRetryLimit - returns and logs with provided limit', async () => {
		const records: EntryDTO[] = [];
		const getRecordsExceedingRetryLimit = jest.fn(async () => records);
		const repo = createRepo({ getRecordsExceedingRetryLimit });
		const useCase = new EntryUseCaseImpl(repo);
		const result = await useCase.getRecordsExceedingRetryLimit(3);
		expect(getRecordsExceedingRetryLimit).toHaveBeenCalledWith(3);
		expect(result).toEqual(records);
	});

	it('getEntriesForTracker - validates required trackerId', async () => {
		const repo = createRepo();
		const useCase = new EntryUseCaseImpl(repo);
		await expect(useCase.getEntriesForTracker('')).rejects.toBeInstanceOf(
			ValidationError
		);
	});
});
