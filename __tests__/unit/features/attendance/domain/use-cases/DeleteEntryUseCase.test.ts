import { IEntryRepository } from '@/features/attendance/domain/ports/IEntryRepository';
import { DeleteEntryUseCase } from '@/features/attendance/domain/use-cases/DeleteEntryUseCase';

describe('DeleteEntryUseCase', () => {
	it('deletes entry by id', async () => {
		const repo: jest.Mocked<IEntryRepository> = {
			create: jest.fn(),
			update: jest.fn(),
			delete: jest.fn(),
			getById: jest.fn(),
			getForTracker: jest.fn(),
			getForPeriod: jest.fn(),
		};
		repo.delete.mockResolvedValue();

		const uc = new DeleteEntryUseCase(repo);
		await uc.execute('e1');
		expect(repo.delete).toHaveBeenCalledWith('e1');
	});
});
