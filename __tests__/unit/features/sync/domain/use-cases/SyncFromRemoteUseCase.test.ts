import { ISyncRepository } from '@/features/sync/domain/ports/ISyncRepository';
import { SyncFromRemoteUseCase } from '@/features/sync/domain/use-cases/SyncFromRemoteUseCase';

describe('SyncFromRemoteUseCase', () => {
	it('calls syncFromRemote', async () => {
		const sync: jest.Mocked<ISyncRepository> = {
			syncToRemote: jest.fn(),
			syncFromRemote: jest.fn(),
		};
		const uc = new SyncFromRemoteUseCase(sync);
		await uc.execute();
		expect(sync.syncFromRemote).toHaveBeenCalled();
	});
});
