import { SecureStorage } from '@/shared/data/storage/SecureStorage';

describe('SecureStorage', () => {
	let storage: SecureStorage;

	beforeEach(() => {
		storage = new SecureStorage();
	});

	describe('getItem', () => {
		it('returns null', async () => {
			const result = await storage.getItem('test-key');

			expect(result).toBeNull();
		});
	});

	describe('setItem', () => {
		it('completes without error', async () => {
			await expect(
				storage.setItem('test-key', 'test-value')
			).resolves.toBeUndefined();
		});
	});

	describe('removeItem', () => {
		it('completes without error', async () => {
			await expect(
				storage.removeItem('test-key')
			).resolves.toBeUndefined();
		});
	});
});
