import { Share } from '@/features/sharing/domain/entities/Share';
import { IShareRepository } from '@/features/sharing/domain/ports/IShareRepository';
import { GetMySharesUseCase } from '@/features/sharing/domain/use-cases/GetMySharesUseCase';

describe('GetMySharesUseCase', () => {
	let mockRepository: jest.Mocked<IShareRepository>;
	let useCase: GetMySharesUseCase;

	beforeEach(() => {
		mockRepository = {
			shareTracker: jest.fn(),
			unshare: jest.fn(),
			updatePermission: jest.fn(),
			getMyShares: jest.fn(),
			getSharedWithMe: jest.fn(),
		};

		useCase = new GetMySharesUseCase(mockRepository);
	});

	describe('execute', () => {
		it('should return shares for owner user', async () => {
			const ownerUserId = 'user-1';
			const shares = [
				new Share('share-1', 'tracker-1', 'user-2', 'read'),
				new Share('share-2', 'tracker-2', 'user-3', 'write'),
			];

			mockRepository.getMyShares.mockResolvedValue(shares);

			const result = await useCase.execute(ownerUserId);

			expect(result).toEqual(shares);
			expect(mockRepository.getMyShares).toHaveBeenCalledWith(
				ownerUserId
			);
			expect(mockRepository.getMyShares).toHaveBeenCalledTimes(1);
		});

		it('should return empty array when user has no shares', async () => {
			const ownerUserId = 'user-1';
			mockRepository.getMyShares.mockResolvedValue([]);

			const result = await useCase.execute(ownerUserId);

			expect(result).toEqual([]);
			expect(mockRepository.getMyShares).toHaveBeenCalledWith(
				ownerUserId
			);
		});

		it('should propagate errors from repository', async () => {
			const ownerUserId = 'user-1';
			const error = new Error('Repository error');
			mockRepository.getMyShares.mockRejectedValue(error);

			await expect(useCase.execute(ownerUserId)).rejects.toThrow(
				'Repository error'
			);
			expect(mockRepository.getMyShares).toHaveBeenCalledWith(
				ownerUserId
			);
		});
	});
});
