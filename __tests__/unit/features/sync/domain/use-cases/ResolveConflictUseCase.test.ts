import { IConflictResolver } from '@/features/sync/domain/ports/IConflictResolver';
import { ResolveConflictUseCase } from '@/features/sync/domain/use-cases/ResolveConflictUseCase';

describe('ResolveConflictUseCase', () => {
	it('delegates to resolver', () => {
		const resolver: jest.Mocked<IConflictResolver<{ value: number }>> = {
			resolve: jest.fn((local, _remote) => local),
		};
		const uc = new ResolveConflictUseCase(resolver);
		const local = { value: 1 };
		const remote = { value: 2 };
		const result = uc.execute(local, remote);
		expect(resolver.resolve).toHaveBeenCalledWith(local, remote);
		expect(result).toBe(local);
	});

	it('returns resolver result', () => {
		const resolver: jest.Mocked<IConflictResolver<string>> = {
			resolve: jest.fn((_local, remote) => remote),
		};
		const uc = new ResolveConflictUseCase(resolver);
		const result = uc.execute('local', 'remote');
		expect(result).toBe('remote');
	});
});
