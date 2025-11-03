import AsyncStorage from '@react-native-async-storage/async-storage';

import { AsyncStorageAdapter } from '@/shared/data/storage/AsyncStorageAdapter';

jest.mock('@react-native-async-storage/async-storage');

describe('AsyncStorageAdapter', () => {
	let adapter: AsyncStorageAdapter;

	beforeEach(() => {
		adapter = new AsyncStorageAdapter();
		jest.clearAllMocks();
	});

	describe('getItem', () => {
		it('retrieves item from AsyncStorage', async () => {
			const key = 'test-key';
			const value = 'test-value';

			(AsyncStorage.getItem as jest.Mock).mockResolvedValue(value);

			const result = await adapter.getItem(key);

			expect(AsyncStorage.getItem).toHaveBeenCalledWith(key);
			expect(result).toBe(value);
		});

		it('returns null when item not found', async () => {
			const key = 'non-existent-key';

			(AsyncStorage.getItem as jest.Mock).mockResolvedValue(null);

			const result = await adapter.getItem(key);

			expect(result).toBeNull();
		});
	});

	describe('setItem', () => {
		it('stores item in AsyncStorage', async () => {
			const key = 'test-key';
			const value = 'test-value';

			(AsyncStorage.setItem as jest.Mock).mockResolvedValue(undefined);

			await adapter.setItem(key, value);

			expect(AsyncStorage.setItem).toHaveBeenCalledWith(key, value);
		});
	});

	describe('removeItem', () => {
		it('removes item from AsyncStorage', async () => {
			const key = 'test-key';

			(AsyncStorage.removeItem as jest.Mock).mockResolvedValue(undefined);

			await adapter.removeItem(key);

			expect(AsyncStorage.removeItem).toHaveBeenCalledWith(key);
		});
	});
});
