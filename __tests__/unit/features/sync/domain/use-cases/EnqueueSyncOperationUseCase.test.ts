import { SyncOperation } from '@/features/sync/domain/entities/SyncOperation';
import { ISyncQueueRepository } from '@/features/sync/domain/ports/ISyncQueueRepository';
import { EnqueueSyncOperationUseCase } from '@/features/sync/domain/use-cases/EnqueueSyncOperationUseCase';

describe('EnqueueSyncOperationUseCase', () => {
	it('enqueues operation', async () => {
		const repo: jest.Mocked<ISyncQueueRepository> = {
			enqueue: jest.fn(),
			dequeue: jest.fn(),
			peek: jest.fn(),
			update: jest.fn(),
			getAll: jest.fn(),
			clear: jest.fn(),
		};
		const uc = new EnqueueSyncOperationUseCase(repo);
		const op = new SyncOperation('1', 'create', 'work_entries', 'w1');
		await uc.execute(op);
		expect(repo.enqueue).toHaveBeenCalledWith(op);
	});
});
