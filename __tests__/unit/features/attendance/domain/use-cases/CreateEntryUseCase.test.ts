import { WorkEntry } from '@/features/attendance/domain/entities/WorkEntry';
import { IEntryRepository } from '@/features/attendance/domain/ports/IEntryRepository';
import { CreateEntryUseCase } from '@/features/attendance/domain/use-cases/CreateEntryUseCase';

describe('CreateEntryUseCase', () => {
	it('validates and creates entry', async () => {
		const repo: jest.Mocked<IEntryRepository> = {
			create: jest.fn(),
			update: jest.fn(),
			delete: jest.fn(),
			getById: jest.fn(),
			getForTracker: jest.fn(),
			getForPeriod: jest.fn(),
		};
		const entry = new WorkEntry('e1', 'u1', 't1', '2023-02-01', 'present');
		repo.create.mockResolvedValue(entry);

		const uc = new CreateEntryUseCase(repo);
		const created = await uc.execute(entry);
		expect(created).toBe(entry);
		expect(repo.create).toHaveBeenCalledWith(entry);
	});
});
