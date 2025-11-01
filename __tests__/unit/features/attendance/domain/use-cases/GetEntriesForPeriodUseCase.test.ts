import { DateRange } from '@/features/attendance/domain/entities/DateRange';
import { WorkEntry } from '@/features/attendance/domain/entities/WorkEntry';
import { IEntryRepository } from '@/features/attendance/domain/ports/IEntryRepository';
import { GetEntriesForPeriodUseCase } from '@/features/attendance/domain/use-cases/GetEntriesForPeriodUseCase';

describe('GetEntriesForPeriodUseCase', () => {
	it('fetches entries for user and period', async () => {
		const repo: jest.Mocked<IEntryRepository> = {
			create: jest.fn(),
			update: jest.fn(),
			delete: jest.fn(),
			getById: jest.fn(),
			getForTracker: jest.fn(),
			getForPeriod: jest.fn(),
		};
		const range = new DateRange('2023-01-01', '2023-01-31');
		const entries = [
			new WorkEntry('e1', 'u1', 't1', '2023-01-05', 'present'),
		];
		repo.getForPeriod.mockResolvedValue(entries);

		const uc = new GetEntriesForPeriodUseCase(repo);
		const result = await uc.execute('u1', range);
		expect(result).toBe(entries);
		expect(repo.getForPeriod).toHaveBeenCalled();
	});
});
