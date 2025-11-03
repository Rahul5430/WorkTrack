import { mockFactories } from '@/shared/utils/testing/mockFactories';

describe('mockFactories', () => {
	describe('user', () => {
		it('creates user with default values', () => {
			const user = mockFactories.user();

			expect(user.id).toBe('u1');
			expect(user.name).toBe('User One');
			expect(user.email).toBe('user@example.com');
		});

		it('overrides default values', () => {
			const user = mockFactories.user({
				id: 'custom-id',
				name: 'Custom Name',
				email: 'custom@example.com',
			});

			expect(user.id).toBe('custom-id');
			expect(user.name).toBe('Custom Name');
			expect(user.email).toBe('custom@example.com');
		});

		it('allows partial overrides', () => {
			const user = mockFactories.user({
				email: 'partial@example.com',
			});

			expect(user.id).toBe('u1');
			expect(user.name).toBe('User One');
			expect(user.email).toBe('partial@example.com');
		});

		it('handles empty overrides', () => {
			const user = mockFactories.user({});

			expect(user.id).toBe('u1');
			expect(user.name).toBe('User One');
			expect(user.email).toBe('user@example.com');
		});
	});
});
