import type { IShareRepository, ITrackerRepository } from '../src/types';
import { ShareUseCaseImpl } from '../src/use-cases/shareUseCase';

describe('ShareUseCase', () => {
	it('shareByEmail resolves user and calls repo', async () => {
		const shares: IShareRepository = {
			share: jest.fn(),
			unshare: jest.fn(),
			updatePermission: jest.fn(),
		};
		const trackers: ITrackerRepository = {
			create: jest.fn(),
			update: jest.fn(),
			listOwned: jest.fn().mockResolvedValue([
				{
					id: 't1',
					name: '',
					color: '',
					ownerId: '',
					isDefault: true,
					trackerType: '',
				},
			]),
			listSharedWith: jest.fn().mockResolvedValue([]),
			ensureExists: jest.fn(),
			upsertMany: jest.fn(),
		};
		const useCase = new ShareUseCaseImpl(shares, trackers);
		// mock internal resolver with typed cast
		(
			useCase as unknown as {
				resolveUserIdByEmail: (
					email: string
				) => Promise<{ id: string; email: string }>;
			}
		).resolveUserIdByEmail = jest
			.fn()
			.mockResolvedValue({ id: 'u2', email: 'a@b.com' });

		await expect(
			useCase.shareByEmail('a@b.com', 'read', 't1')
		).resolves.toBeUndefined();
		expect(shares.share).toHaveBeenCalled();
	});

	it('updateSharePermission uses default tracker when not provided', async () => {
		const shares: IShareRepository = {
			share: jest.fn(),
			unshare: jest.fn(),
			updatePermission: jest.fn(),
		};
		const trackers: ITrackerRepository = {
			create: jest.fn(),
			update: jest.fn(),
			listOwned: jest.fn().mockResolvedValue([
				{
					id: 't1',
					name: '',
					color: '',
					ownerId: '',
					isDefault: true,
					trackerType: '',
				},
			]),
			listSharedWith: jest.fn().mockResolvedValue([]),
			ensureExists: jest.fn(),
			upsertMany: jest.fn(),
		};
		const useCase = new ShareUseCaseImpl(shares, trackers);

		await expect(
			useCase.updateSharePermission('u2', 'write')
		).resolves.toBeUndefined();
		expect(shares.updatePermission).toHaveBeenCalled();
	});
});
