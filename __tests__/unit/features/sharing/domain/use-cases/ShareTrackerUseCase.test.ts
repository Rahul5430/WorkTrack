import { Share } from '@/features/sharing/domain/entities/Share';
import { IShareRepository } from '@/features/sharing/domain/ports/IShareRepository';
import { ShareTrackerUseCase } from '@/features/sharing/domain/use-cases/ShareTrackerUseCase';

describe('ShareTrackerUseCase', () => {
	let mockRepository: jest.Mocked<IShareRepository>;
	let useCase: ShareTrackerUseCase;

	beforeEach(() => {
		mockRepository = {
			shareTracker: jest.fn(),
			unshare: jest.fn(),
			updatePermission: jest.fn(),
			getMyShares: jest.fn(),
			getSharedWithMe: jest.fn(),
		};

		useCase = new ShareTrackerUseCase(mockRepository);
	});

	describe('execute', () => {
		it('should share tracker successfully', async () => {
			const share = new Share('share-1', 'tracker-1', 'user-2', 'read');
			mockRepository.shareTracker.mockResolvedValue(share);

			const result = await useCase.execute(share);

			expect(result).toEqual(share);
			expect(mockRepository.shareTracker).toHaveBeenCalledWith(share);
			expect(mockRepository.shareTracker).toHaveBeenCalledTimes(1);
		});

		it('should propagate errors from repository', async () => {
			const share = new Share('share-1', 'tracker-1', 'user-2', 'read');
			const error = new Error('Repository error');
			mockRepository.shareTracker.mockRejectedValue(error);

			await expect(useCase.execute(share)).rejects.toThrow(
				'Repository error'
			);
			expect(mockRepository.shareTracker).toHaveBeenCalledWith(share);
		});
	});
});
