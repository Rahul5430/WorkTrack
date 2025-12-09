import { IEntryRepository } from '@/features/attendance/domain/ports/IEntryRepository';
import { DeleteEntryUseCase } from '@/features/attendance/domain/use-cases/DeleteEntryUseCase';

describe('DeleteEntryUseCase', () => {
	let entryRepository: jest.Mocked<IEntryRepository>;
	let useCase: DeleteEntryUseCase;

	beforeEach(() => {
		entryRepository = {
			create: jest.fn(),
			update: jest.fn(),
			delete: jest.fn(),
			getById: jest.fn(),
			getForTracker: jest.fn(),
			getForPeriod: jest.fn(),
		};
		useCase = new DeleteEntryUseCase(entryRepository);
	});

	it('deletes entry successfully', async () => {
		const entryId = 'entry-1';
		entryRepository.delete.mockResolvedValue(undefined);

		await useCase.execute(entryId);

		expect(entryRepository.delete).toHaveBeenCalledWith(entryId);
	});

	it('handles delete errors', async () => {
		const entryId = 'entry-1';
		const error = new Error('Delete failed');
		entryRepository.delete.mockRejectedValue(error);

		await expect(useCase.execute(entryId)).rejects.toThrow('Delete failed');
		expect(entryRepository.delete).toHaveBeenCalledWith(entryId);
	});
});
