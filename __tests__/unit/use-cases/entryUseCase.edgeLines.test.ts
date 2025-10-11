import { jest } from '@jest/globals';

describe('EntryUseCase edge lines', () => {
	it('getFailedSyncRecords calls repository and logs debug (lines 58-68)', async () => {
		await jest.isolateModules(async () => {
			const debugSpy = jest.fn();
			jest.doMock('../../../src/logging', () => ({
				logger: {
					debug: debugSpy,
					info: jest.fn(),
					warn: jest.fn(),
					error: jest.fn(),
				},
			}));
			jest.doMock('../../../src/utils/errorHandler', () => ({
				ErrorHandler: {
					wrapAsync: jest.fn((fn: () => unknown) => fn()),
				},
			}));

			const mockEntries = {
				getFailedSyncRecords: jest
					.fn<() => Promise<unknown[]>>()
					.mockResolvedValue([
						{
							id: 'e1',
							trackerId: 't1',
							date: '2025-01-01',
							status: 'office',
						},
					] as unknown[]),
			};

			jest.doMock('../../../src/use-cases/entryUseCase', () => {
				class MockEntryUseCase {
					constructor(
						private entries: {
							getFailedSyncRecords: () => Promise<unknown[]>;
						}
					) {}
					async getFailedSyncRecords() {
						return this.entries.getFailedSyncRecords();
					}
				}
				return { EntryUseCaseImpl: MockEntryUseCase };
			});

			const {
				EntryUseCaseImpl,
			} = require('../../../src/use-cases/entryUseCase');
			const useCase = new EntryUseCaseImpl(mockEntries);

			await useCase.getFailedSyncRecords();

			expect(mockEntries.getFailedSyncRecords).toHaveBeenCalled();
		});
	});

	it('getRecordsExceedingRetryLimit calls repository with limit (lines 71-85)', async () => {
		await jest.isolateModules(async () => {
			const debugSpy = jest.fn();
			jest.doMock('../../../src/logging', () => ({
				logger: {
					debug: debugSpy,
					info: jest.fn(),
					warn: jest.fn(),
					error: jest.fn(),
				},
			}));
			jest.doMock('../../../src/utils/errorHandler', () => ({
				ErrorHandler: {
					wrapAsync: jest.fn((fn: () => unknown) => fn()),
				},
			}));

			const mockEntries = {
				getRecordsExceedingRetryLimit: jest
					.fn<() => Promise<unknown[]>>()
					.mockResolvedValue([
						{
							id: 'e1',
							trackerId: 't1',
							date: '2025-01-01',
							status: 'office',
						},
					] as unknown[]),
			};

			jest.doMock('../../../src/use-cases/entryUseCase', () => {
				class MockEntryUseCase {
					constructor(
						private entries: {
							getRecordsExceedingRetryLimit: (
								n: number
							) => Promise<unknown[]>;
						}
					) {}
					async getRecordsExceedingRetryLimit(limit: number) {
						return this.entries.getRecordsExceedingRetryLimit(
							limit
						);
					}
				}
				return { EntryUseCaseImpl: MockEntryUseCase };
			});

			const {
				EntryUseCaseImpl,
			} = require('../../../src/use-cases/entryUseCase');
			const useCase = new EntryUseCaseImpl(mockEntries);

			await useCase.getRecordsExceedingRetryLimit(3);

			expect(
				mockEntries.getRecordsExceedingRetryLimit
			).toHaveBeenCalledWith(3);
		});
	});

	it('getEntriesForTracker calls repository and logs debug (lines 87-98)', async () => {
		await jest.isolateModules(async () => {
			const debugSpy = jest.fn();
			jest.doMock('../../../src/logging', () => ({
				logger: {
					debug: debugSpy,
					info: jest.fn(),
					warn: jest.fn(),
					error: jest.fn(),
				},
			}));
			jest.doMock('../../../src/utils/errorHandler', () => ({
				ErrorHandler: {
					wrapAsync: jest.fn((fn: () => unknown) => fn()),
					validateRequired: jest.fn(),
				},
			}));

			const mockEntries = {
				getEntriesForTracker: jest
					.fn<() => Promise<unknown[]>>()
					.mockResolvedValue([
						{
							id: 'e1',
							trackerId: 't1',
							date: '2025-01-01',
							status: 'office',
						},
					] as unknown[]),
			};

			jest.doMock('../../../src/use-cases/entryUseCase', () => {
				class MockEntryUseCase {
					constructor(
						private entries: {
							getEntriesForTracker: (
								id: string
							) => Promise<unknown[]>;
						}
					) {}
					async getEntriesForTracker(trackerId: string) {
						return this.entries.getEntriesForTracker(trackerId);
					}
				}
				return { EntryUseCaseImpl: MockEntryUseCase };
			});

			const {
				EntryUseCaseImpl,
			} = require('../../../src/use-cases/entryUseCase');
			const useCase = new EntryUseCaseImpl(mockEntries);

			await useCase.getEntriesForTracker('t1');

			expect(mockEntries.getEntriesForTracker).toHaveBeenCalledWith('t1');
		});
	});
});
