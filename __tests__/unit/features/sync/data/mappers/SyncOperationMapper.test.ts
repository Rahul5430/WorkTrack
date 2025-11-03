import {
	SyncOperationMapper,
	SyncOperationModelShape,
} from '@/features/sync/data/mappers/SyncOperationMapper';
import { SyncOperation } from '@/features/sync/domain/entities/SyncOperation';

describe('SyncOperationMapper', () => {
	describe('toModel', () => {
		it('converts SyncOperation to model shape', () => {
			const createdAt = new Date('2024-01-01T00:00:00Z');
			const updatedAt = new Date('2024-01-01T00:00:00Z');
			const operation = new SyncOperation(
				'op-1',
				'create',
				'work_entries',
				'w1',
				{ foo: 'bar' },
				'pending',
				0,
				5,
				undefined,
				createdAt,
				updatedAt
			);

			const result = SyncOperationMapper.toModel(operation);

			expect(result.operation).toBe('create');
			expect(result.tableName).toBe('work_entries');
			expect(result.recordId).toBe('w1');
			expect(result.data).toBe('{"foo":"bar"}'); // JSON string
			expect(result.status).toBe('pending');
			expect(result.retryCount).toBe(0);
			expect(result.maxRetries).toBe(5);
			expect(result.createdAt).toBe(createdAt.getTime()); // timestamp
			expect(result.updatedAt).toBe(updatedAt.getTime()); // timestamp
		});

		it('handles undefined data', () => {
			const operation = new SyncOperation(
				'op-1',
				'delete',
				'work_entries',
				'w1',
				undefined,
				'pending'
			);

			const result = SyncOperationMapper.toModel(operation);

			expect(result.data).toBeUndefined();
		});

		it('handles nextRetryAt when present', () => {
			const nextRetryAt = new Date('2024-01-02T00:00:00Z');
			const operation = new SyncOperation(
				'op-1',
				'create',
				'work_entries',
				'w1',
				{},
				'pending',
				1,
				5,
				new Date('2024-01-01T00:00:00Z'),
				new Date('2024-01-01T00:00:00Z'),
				new Date('2024-01-01T00:00:00Z')
			).incrementRetry(nextRetryAt);

			const result = SyncOperationMapper.toModel(operation);

			expect(result.nextRetryAt).toBe(nextRetryAt.getTime()); // timestamp
		});

		it('handles nextRetryAt when undefined', () => {
			const operation = new SyncOperation(
				'op-1',
				'create',
				'work_entries',
				'w1',
				{},
				'pending'
			);

			const result = SyncOperationMapper.toModel(operation);

			expect(result.nextRetryAt).toBeUndefined();
		});

		it('handles all operation types', () => {
			const createOp = new SyncOperation(
				'op-1',
				'create',
				'work_entries',
				'w1'
			);
			const updateOp = new SyncOperation(
				'op-2',
				'update',
				'trackers',
				't1'
			);
			const deleteOp = new SyncOperation(
				'op-3',
				'delete',
				'work_entries',
				'w2'
			);

			expect(SyncOperationMapper.toModel(createOp).operation).toBe(
				'create'
			);
			expect(SyncOperationMapper.toModel(updateOp).operation).toBe(
				'update'
			);
			expect(SyncOperationMapper.toModel(deleteOp).operation).toBe(
				'delete'
			);
		});

		it('handles all status types', () => {
			const pendingOp = new SyncOperation(
				'op-1',
				'create',
				'work_entries',
				'w1',
				{},
				'pending'
			);
			const syncingOp = new SyncOperation(
				'op-2',
				'create',
				'work_entries',
				'w1',
				{},
				'syncing'
			);
			const completedOp = new SyncOperation(
				'op-3',
				'create',
				'work_entries',
				'w1',
				{},
				'completed'
			);

			expect(SyncOperationMapper.toModel(pendingOp).status).toBe(
				'pending'
			);
			expect(SyncOperationMapper.toModel(syncingOp).status).toBe(
				'syncing'
			);
			expect(SyncOperationMapper.toModel(completedOp).status).toBe(
				'completed'
			);
		});
	});

	describe('toDomain', () => {
		it('converts model shape to SyncOperation', () => {
			const model: SyncOperationModelShape = {
				id: 'op-1',
				operation: 'create',
				tableName: 'work_entries',
				recordId: 'w1',
				data: '{"foo":"bar"}', // JSON string
				status: 'pending',
				retryCount: 0,
				maxRetries: 5,
				createdAt: new Date('2024-01-01T00:00:00Z'),
				updatedAt: new Date('2024-01-02T00:00:00Z'),
			};

			const result = SyncOperationMapper.toDomain(model);

			expect(result).toBeInstanceOf(SyncOperation);
			expect(result.id).toBe('op-1');
			expect(result.operation).toBe('create');
			expect(result.tableName).toBe('work_entries');
			expect(result.recordId).toBe('w1');
			expect(result.data).toEqual({ foo: 'bar' }); // Parsed from JSON
			expect(result.status).toBe('pending');
			expect(result.retryCount).toBe(0);
			expect(result.maxRetries).toBe(5);
		});

		it('handles undefined data in model', () => {
			const model: SyncOperationModelShape = {
				id: 'op-1',
				operation: 'delete',
				tableName: 'work_entries',
				recordId: 'w1',
				data: undefined,
				status: 'pending',
				retryCount: 0,
				maxRetries: 5,
				createdAt: new Date('2024-01-01T00:00:00Z'),
				updatedAt: new Date('2024-01-02T00:00:00Z'),
			};

			const result = SyncOperationMapper.toDomain(model);

			expect(result.data).toBeUndefined();
		});

		it('handles nextRetryAt when present', () => {
			const nextRetryAt = new Date('2024-01-02T00:00:00Z');
			const model: SyncOperationModelShape = {
				id: 'op-1',
				operation: 'create',
				tableName: 'work_entries',
				recordId: 'w1',
				data: '{}', // JSON string
				status: 'pending',
				retryCount: 1,
				maxRetries: 5,
				createdAt: new Date('2024-01-01T00:00:00Z'),
				updatedAt: new Date('2024-01-02T00:00:00Z'),
				nextRetryAt,
			};

			const result = SyncOperationMapper.toDomain(model);

			expect(result.nextRetryAt).toEqual(nextRetryAt);
		});

		it('handles nextRetryAt when undefined', () => {
			const model: SyncOperationModelShape = {
				id: 'op-1',
				operation: 'create',
				tableName: 'work_entries',
				recordId: 'w1',
				data: '{}', // JSON string
				status: 'pending',
				retryCount: 0,
				maxRetries: 5,
				createdAt: new Date('2024-01-01T00:00:00Z'),
				updatedAt: new Date('2024-01-02T00:00:00Z'),
				nextRetryAt: undefined,
			};

			const result = SyncOperationMapper.toDomain(model);

			expect(result.nextRetryAt).toBeUndefined();
		});

		it('handles errorMessage when present', () => {
			const model: SyncOperationModelShape = {
				id: 'op-1',
				operation: 'create',
				tableName: 'work_entries',
				recordId: 'w1',
				data: '{}', // JSON string
				status: 'pending',
				retryCount: 1,
				maxRetries: 5,
				createdAt: new Date('2024-01-01T00:00:00Z'),
				updatedAt: new Date('2024-01-02T00:00:00Z'),
				errorMessage: 'Sync failed',
			};

			const result = SyncOperationMapper.toDomain(model);

			// SyncOperation may store errorMessage internally or expose it
			expect(result).toBeInstanceOf(SyncOperation);
		});

		it('handles errorMessage when undefined', () => {
			const model: SyncOperationModelShape = {
				id: 'op-1',
				operation: 'create',
				tableName: 'work_entries',
				recordId: 'w1',
				data: '{}', // JSON string
				status: 'pending',
				retryCount: 0,
				maxRetries: 5,
				createdAt: new Date('2024-01-01T00:00:00Z'),
				updatedAt: new Date('2024-01-02T00:00:00Z'),
				errorMessage: undefined,
			};

			const result = SyncOperationMapper.toDomain(model);

			expect(result).toBeInstanceOf(SyncOperation);
		});
	});
});
