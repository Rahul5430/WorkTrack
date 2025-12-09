import { WorkEntry } from '@/features/attendance/domain/entities/WorkEntry';
import { IEntryRepository } from '@/features/attendance/domain/ports/IEntryRepository';
import { GetEntriesForTrackerUseCase } from '@/features/attendance/domain/use-cases/GetEntriesForTrackerUseCase';

describe('GetEntriesForTrackerUseCase', () => {
	it('fetches entries for tracker', async () => {
		const repo: jest.Mocked<IEntryRepository> = {
			create: jest.fn(),
			update: jest.fn(),
			delete: jest.fn(),
			getById: jest.fn(),
			getForTracker: jest.fn(),
			getForPeriod: jest.fn(),
		};
		const entries = [
			new WorkEntry('e1', 'u1', 't1', '2023-01-05', 'office'),
		];
		repo.getForTracker.mockResolvedValue(entries);

		const uc = new GetEntriesForTrackerUseCase(repo);
		const result = await uc.execute('t1');
		expect(result).toBe(entries);
		expect(repo.getForTracker).toHaveBeenCalledWith('t1');
	});
});
