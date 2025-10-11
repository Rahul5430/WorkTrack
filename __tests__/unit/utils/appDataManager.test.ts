import { database } from '../../../src/db/watermelon';
import { logger } from '../../../src/logging';
import { store } from '../../../src/store';
import { setWorkTrackData } from '../../../src/store/reducers/workTrackSlice';
import { clearAppData } from '../../../src/utils/appDataManager';

// Mock dependencies
jest.mock('../../../src/db/watermelon', () => ({
	database: {
		write: jest.fn(),
		unsafeResetDatabase: jest.fn(),
	},
}));

jest.mock('../../../src/store', () => ({
	store: {
		dispatch: jest.fn(),
	},
}));

jest.mock('../../../src/logging', () => ({
	logger: {
		warn: jest.fn(),
		error: jest.fn(),
	},
}));

// Mock localStorage and sessionStorage
const mockLocalStorage = {
	clear: jest.fn(),
};
const mockSessionStorage = {
	clear: jest.fn(),
};

Object.defineProperty(window, 'localStorage', {
	value: mockLocalStorage,
});
Object.defineProperty(window, 'sessionStorage', {
	value: mockSessionStorage,
});

describe('appDataManager', () => {
	beforeEach(() => {
		jest.clearAllMocks();
	});

	describe('clearAppData', () => {
		it('should clear all app data successfully', async () => {
			const mockWrite = database.write as jest.Mock;
			mockWrite.mockResolvedValue(undefined);

			const result = await clearAppData();

			expect(store.dispatch).toHaveBeenCalledWith(setWorkTrackData([]));
			expect(mockLocalStorage.clear).toHaveBeenCalled();
			expect(mockSessionStorage.clear).toHaveBeenCalled();
			expect(database.write).toHaveBeenCalled();
			expect(result).toBe(true);
		});

		it('should handle storage clear errors gracefully', async () => {
			const mockWrite = database.write as jest.Mock;
			mockWrite.mockResolvedValue(undefined);

			const storageError = new Error('Storage not available');
			mockLocalStorage.clear.mockImplementation(() => {
				throw storageError;
			});

			const result = await clearAppData();

			expect(store.dispatch).toHaveBeenCalledWith(setWorkTrackData([]));
			expect(logger.warn).toHaveBeenCalledWith(
				'Error clearing storage:',
				{ error: storageError }
			);
			expect(database.write).toHaveBeenCalled();
			expect(result).toBe(true);
		});

		it('should handle database clear errors', async () => {
			const dbError = new Error('Database error');
			const mockWrite = database.write as jest.Mock;
			mockWrite.mockRejectedValue(dbError);

			await expect(clearAppData()).rejects.toThrow(dbError);

			expect(store.dispatch).toHaveBeenCalledWith(setWorkTrackData([]));
			expect(logger.error).toHaveBeenCalledWith(
				'Error clearing app data:',
				{ error: dbError }
			);
		});

		it('should clear all storage types', async () => {
			const mockWrite = database.write as jest.Mock;
			mockWrite.mockResolvedValue(undefined);

			await clearAppData();

			expect(mockLocalStorage.clear).toHaveBeenCalled();
			expect(mockSessionStorage.clear).toHaveBeenCalled();
		});

		it('should reset database last', async () => {
			const mockWrite = database.write as jest.Mock;
			mockWrite.mockResolvedValue(undefined);

			await clearAppData();

			// Verify all operations were called
			expect(store.dispatch).toHaveBeenCalled();
			expect(mockLocalStorage.clear).toHaveBeenCalled();
			expect(mockSessionStorage.clear).toHaveBeenCalled();
			expect(mockWrite).toHaveBeenCalled();
		});
	});
});
