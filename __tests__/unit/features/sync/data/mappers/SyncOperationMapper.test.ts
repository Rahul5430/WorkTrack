import {
	SyncOperationMapper,
	SyncOperationModelShape,
} from '@/features/sync/data/mappers/SyncOperationMapper';
import { SyncOperation } from '@/features/sync/domain/entities/SyncOperation';

describe('SyncOperationMapper', () => {
	describe('toDomain', () => {
		it('converts model to domain entity', () => {
			const model: SyncOperationModelShape = {
				id: 'op1',
				operation: 'create',
				tableName: 'work_entries',
				recordId: 'w1',
				data: '{"foo":"bar"}',
				status: 'pending',
				retryCount: 0,
				maxRetries: 5,
				createdAt: new Date('2023-01-01'),
				updatedAt: new Date('2023-01-01'),
			};

			const domain = SyncOperationMapper.toDomain(model);

			expect(domain.id).toBe('op1');
			expect(domain.operation).toBe('create');
			expect(domain.tableName).toBe('work_entries');
			expect(domain.recordId).toBe('w1');
			expect(domain.data).toEqual({ foo: 'bar' });
			expect(domain.status).toBe('pending');
			expect(domain.retryCount).toBe(0);
		});

		it('handles missing data field', () => {
			const model: SyncOperationModelShape = {
				id: 'op2',
				operation: 'delete',
				tableName: 'trackers',
				recordId: 't1',
				status: 'pending',
				retryCount: 0,
				maxRetries: 5,
				createdAt: new Date('2023-01-01'),
				updatedAt: new Date('2023-01-01'),
			};

			const domain = SyncOperationMapper.toDomain(model);

			expect(domain.data).toBeUndefined();
		});

		it('handles nextRetryAt', () => {
			const nextRetry = new Date('2023-01-02');
			const model: SyncOperationModelShape = {
				id: 'op3',
				operation: 'update',
				tableName: 'work_entries',
				recordId: 'w1',
				status: 'failed',
				retryCount: 2,
				maxRetries: 5,
				nextRetryAt: nextRetry,
				createdAt: new Date('2023-01-01'),
				updatedAt: new Date('2023-01-01'),
			};

			const domain = SyncOperationMapper.toDomain(model);

			expect(domain.nextRetryAt).toEqual(nextRetry);
		});
	});

	describe('toModel', () => {
		it('converts domain entity to model', () => {
			const domain = new SyncOperation(
				'op1',
				'create',
				'work_entries',
				'w1',
				{ foo: 'bar' },
				'pending',
				0,
				5
			);

			const model = SyncOperationMapper.toModel(domain);

			expect(model.operation).toBe('create');
			expect(model.tableName).toBe('work_entries');
			expect(model.recordId).toBe('w1');
			expect(model.data).toBe('{"foo":"bar"}');
			expect(model.status).toBe('pending');
			expect(model.retryCount).toBe(0);
			expect(model.maxRetries).toBe(5);
		});

		it('handles missing data', () => {
			const domain = new SyncOperation(
				'op2',
				'delete',
				'trackers',
				't1',
				undefined,
				'pending'
			);

			const model = SyncOperationMapper.toModel(domain);

			expect(model.data).toBeUndefined();
		});

		it('handles nextRetryAt', () => {
			const nextRetry = new Date('2023-01-02');
			const domain = new SyncOperation(
				'op3',
				'update',
				'work_entries',
				'w1',
				undefined,
				'failed',
				2,
				5,
				nextRetry
			);

			const model = SyncOperationMapper.toModel(domain);

			expect(model.nextRetryAt).toBe(nextRetry.getTime());
		});

		it('converts timestamps correctly', () => {
			const createdAt = new Date('2023-01-01T10:00:00Z');
			const updatedAt = new Date('2023-01-01T11:00:00Z');
			const domain = new SyncOperation(
				'op4',
				'create',
				'work_entries',
				'w1',
				undefined,
				'pending',
				0,
				5,
				undefined,
				createdAt,
				updatedAt
			);

			const model = SyncOperationMapper.toModel(domain);

			expect(model.createdAt).toBe(createdAt.getTime());
			expect(model.updatedAt).toBe(updatedAt.getTime());
		});
	});
});
