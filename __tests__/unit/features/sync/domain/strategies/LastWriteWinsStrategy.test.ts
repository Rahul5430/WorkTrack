import { LastWriteWinsStrategy } from '@/features/sync/domain/strategies/LastWriteWinsStrategy';

type HasUpdatedAt = { updatedAt?: Date };

describe('LastWriteWinsStrategy', () => {
	let strategy: LastWriteWinsStrategy<HasUpdatedAt>;

	beforeEach(() => {
		strategy = new LastWriteWinsStrategy();
	});

	describe('resolve', () => {
		it('returns remote when remote is newer', () => {
			const local = { updatedAt: new Date('2024-01-01T00:00:00Z') };
			const remote = { updatedAt: new Date('2024-01-02T00:00:00Z') };

			const result = strategy.resolve(local, remote);

			expect(result).toBe(remote);
		});

		it('returns local when local is newer', () => {
			const local = { updatedAt: new Date('2024-01-02T00:00:00Z') };
			const remote = { updatedAt: new Date('2024-01-01T00:00:00Z') };

			const result = strategy.resolve(local, remote);

			expect(result).toBe(local);
		});

		it('returns remote when timestamps are equal', () => {
			const local = { updatedAt: new Date('2024-01-01T00:00:00Z') };
			const remote = { updatedAt: new Date('2024-01-01T00:00:00Z') };

			const result = strategy.resolve(local, remote);

			expect(result).toBe(remote);
		});

		it('returns remote when local has no updatedAt', () => {
			const local = {};
			const remote = { updatedAt: new Date('2024-01-01T00:00:00Z') };

			const result = strategy.resolve(local, remote);

			expect(result).toBe(remote);
		});

		it('returns local when remote has no updatedAt', () => {
			const local = { updatedAt: new Date('2024-01-01T00:00:00Z') };
			const remote = {};

			const result = strategy.resolve(local, remote);

			expect(result).toBe(local);
		});

		it('returns remote when both have no updatedAt', () => {
			const local = {};
			const remote = {};

			const result = strategy.resolve(local, remote);

			expect(result).toBe(remote);
		});

		it('handles null updatedAt', () => {
			const local = { updatedAt: null as unknown as Date | undefined };
			const remote = { updatedAt: new Date('2024-01-01T00:00:00Z') };

			const result = strategy.resolve(
				local as unknown as HasUpdatedAt,
				remote as HasUpdatedAt
			);

			expect(result).toBe(remote);
		});
	});
});
