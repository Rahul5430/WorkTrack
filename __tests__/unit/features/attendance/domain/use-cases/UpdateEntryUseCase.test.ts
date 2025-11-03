import { WorkEntry } from '@/features/attendance/domain/entities/WorkEntry';
import { IEntryRepository } from '@/features/attendance/domain/ports/IEntryRepository';
import { UpdateEntryUseCase } from '@/features/attendance/domain/use-cases/UpdateEntryUseCase';

describe('UpdateEntryUseCase', () => {
	it('validates and updates entry', async () => {
		const repo: jest.Mocked<IEntryRepository> = {
			create: jest.fn(),
			update: jest.fn(),
			delete: jest.fn(),
			getById: jest.fn(),
			getForTracker: jest.fn(),
			getForPeriod: jest.fn(),
		};
		const entry = new WorkEntry('e1', 'u1', 't1', '2023-02-01', 'office');
		repo.update.mockResolvedValue(entry);

		const uc = new UpdateEntryUseCase(repo);
		const updated = await uc.execute(entry);
		expect(updated).toBe(entry);
		expect(repo.update).toHaveBeenCalledWith(entry);
	});
});
