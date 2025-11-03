import { Share } from '@/features/sharing/domain/entities/Share';
import { IShareRepository } from '@/features/sharing/domain/ports/IShareRepository';
import { GetSharedWithMeUseCase } from '@/features/sharing/domain/use-cases/GetSharedWithMeUseCase';

describe('GetSharedWithMeUseCase', () => {
	let mockRepository: jest.Mocked<IShareRepository>;
	let useCase: GetSharedWithMeUseCase;

	beforeEach(() => {
		mockRepository = {
			shareTracker: jest.fn(),
			unshare: jest.fn(),
			updatePermission: jest.fn(),
			getMyShares: jest.fn(),
			getSharedWithMe: jest.fn(),
		};

		useCase = new GetSharedWithMeUseCase(mockRepository);
	});

	describe('execute', () => {
		it('should return shares shared with user', async () => {
			const userId = 'user-2';
			const shares = [
				new Share('share-1', 'tracker-1', 'user-2', 'read'),
				new Share('share-2', 'tracker-2', 'user-2', 'write'),
			];

			mockRepository.getSharedWithMe.mockResolvedValue(shares);

			const result = await useCase.execute(userId);

			expect(result).toEqual(shares);
			expect(mockRepository.getSharedWithMe).toHaveBeenCalledWith(userId);
			expect(mockRepository.getSharedWithMe).toHaveBeenCalledTimes(1);
		});

		it('should return empty array when user has no shares', async () => {
			const userId = 'user-2';
			mockRepository.getSharedWithMe.mockResolvedValue([]);

			const result = await useCase.execute(userId);

			expect(result).toEqual([]);
			expect(mockRepository.getSharedWithMe).toHaveBeenCalledWith(userId);
		});

		it('should propagate errors from repository', async () => {
			const userId = 'user-2';
			const error = new Error('Repository error');
			mockRepository.getSharedWithMe.mockRejectedValue(error);

			await expect(useCase.execute(userId)).rejects.toThrow(
				'Repository error'
			);
			expect(mockRepository.getSharedWithMe).toHaveBeenCalledWith(userId);
		});
	});
});
