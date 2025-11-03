import { IShareRepository } from '@/features/sharing/domain/ports/IShareRepository';
import { UnshareTrackerUseCase } from '@/features/sharing/domain/use-cases/UnshareTrackerUseCase';

describe('UnshareTrackerUseCase', () => {
	let mockRepository: jest.Mocked<IShareRepository>;
	let useCase: UnshareTrackerUseCase;

	beforeEach(() => {
		mockRepository = {
			shareTracker: jest.fn(),
			unshare: jest.fn(),
			updatePermission: jest.fn(),
			getMyShares: jest.fn(),
			getSharedWithMe: jest.fn(),
		};

		useCase = new UnshareTrackerUseCase(mockRepository);
	});

	describe('execute', () => {
		it('should unshare tracker successfully', async () => {
			const shareId = 'share-1';
			mockRepository.unshare.mockResolvedValue(undefined);

			await useCase.execute(shareId);

			expect(mockRepository.unshare).toHaveBeenCalledWith(shareId);
			expect(mockRepository.unshare).toHaveBeenCalledTimes(1);
		});

		it('should propagate errors from repository', async () => {
			const shareId = 'share-1';
			const error = new Error('Repository error');
			mockRepository.unshare.mockRejectedValue(error);

			await expect(useCase.execute(shareId)).rejects.toThrow(
				'Repository error'
			);
			expect(mockRepository.unshare).toHaveBeenCalledWith(shareId);
		});
	});
});
