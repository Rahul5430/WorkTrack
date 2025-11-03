import { ManualResolutionStrategy } from '@/features/sync/domain/strategies/ManualResolutionStrategy';

type TestType = { id: string; value: string };

describe('ManualResolutionStrategy', () => {
	it('returns remote when choose returns remote', () => {
		const local = { id: '1', value: 'local' };
		const remote = { id: '2', value: 'remote' };
		const choose = jest.fn(() => 'remote' as const);

		const strategy = new ManualResolutionStrategy<TestType>(choose);

		const result = strategy.resolve(local, remote);

		expect(result).toBe(remote);
		expect(choose).toHaveBeenCalledWith(local, remote);
	});

	it('returns local when choose returns local', () => {
		const local = { id: '1', value: 'local' };
		const remote = { id: '2', value: 'remote' };
		const choose = jest.fn(() => 'local' as const);

		const strategy = new ManualResolutionStrategy<TestType>(choose);

		const result = strategy.resolve(local, remote);

		expect(result).toBe(local);
		expect(choose).toHaveBeenCalledWith(local, remote);
	});

	it('delegates choice to provided function', () => {
		const local = { id: '1', value: 'local-value' };
		const remote = { id: '2', value: 'remote-value' };
		const choose = jest.fn((l, r) => {
			if (l.value.length > r.value.length) {
				return 'local' as const;
			}
			return 'remote' as const;
		});

		const strategy = new ManualResolutionStrategy<TestType>(choose);

		const result = strategy.resolve(local, remote);

		expect(choose).toHaveBeenCalledWith(local, remote);
		expect(result).toBe(remote);
	});

	it('allows complex decision logic', () => {
		const local = { id: '1', value: 'a' };
		const remote = { id: '2', value: 'b' };
		const choose = jest.fn((l, _r) => {
			if (l.id === '1') {
				return 'local' as const;
			}
			return 'remote' as const;
		});

		const strategy = new ManualResolutionStrategy<TestType>(choose);

		const result = strategy.resolve(local, remote);

		expect(result).toBe(local);
		expect(choose).toHaveBeenCalledWith(local, remote);
	});
});
