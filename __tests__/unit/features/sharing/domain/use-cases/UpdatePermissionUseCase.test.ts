import { Permission, Share } from '@/features/sharing/domain/entities';
import { IShareRepository } from '@/features/sharing/domain/ports/IShareRepository';
import { UpdatePermissionUseCase } from '@/features/sharing/domain/use-cases/UpdatePermissionUseCase';

describe('UpdatePermissionUseCase', () => {
	let mockRepository: jest.Mocked<IShareRepository>;
	let useCase: UpdatePermissionUseCase;

	beforeEach(() => {
		mockRepository = {
			shareTracker: jest.fn(),
			unshare: jest.fn(),
			updatePermission: jest.fn(),
			getMyShares: jest.fn(),
			getSharedWithMe: jest.fn(),
		};

		useCase = new UpdatePermissionUseCase(mockRepository);
	});

	describe('execute', () => {
		it('should update permission to read', async () => {
			const shareId = 'share-1';
			const permission = new Permission('read');
			const updatedShare = new Share(
				'share-1',
				'tracker-1',
				'user-2',
				'read'
			);

			mockRepository.updatePermission.mockResolvedValue(updatedShare);

			const result = await useCase.execute(shareId, permission);

			expect(result).toEqual(updatedShare);
			expect(mockRepository.updatePermission).toHaveBeenCalledWith(
				shareId,
				permission
			);
			expect(mockRepository.updatePermission).toHaveBeenCalledTimes(1);
		});

		it('should update permission to write', async () => {
			const shareId = 'share-1';
			const permission = new Permission('write');
			const updatedShare = new Share(
				'share-1',
				'tracker-1',
				'user-2',
				'write'
			);

			mockRepository.updatePermission.mockResolvedValue(updatedShare);

			const result = await useCase.execute(shareId, permission);

			expect(result).toEqual(updatedShare);
			expect(mockRepository.updatePermission).toHaveBeenCalledWith(
				shareId,
				permission
			);
		});

		it('should accept PermissionType string', async () => {
			const shareId = 'share-1';
			const permission: Share['permission'] = new Permission('read');
			const updatedShare = new Share(
				'share-1',
				'tracker-1',
				'user-2',
				'read'
			);

			mockRepository.updatePermission.mockResolvedValue(updatedShare);

			const result = await useCase.execute(shareId, permission);

			expect(result).toEqual(updatedShare);
			expect(mockRepository.updatePermission).toHaveBeenCalledWith(
				shareId,
				permission
			);
		});

		it('should propagate errors from repository', async () => {
			const shareId = 'share-1';
			const permission = new Permission('read');
			const error = new Error('Repository error');
			mockRepository.updatePermission.mockRejectedValue(error);

			await expect(useCase.execute(shareId, permission)).rejects.toThrow(
				'Repository error'
			);
			expect(mockRepository.updatePermission).toHaveBeenCalledWith(
				shareId,
				permission
			);
		});
	});
});
