import type { Database } from '@nozbe/watermelondb';
import AsyncStorage from '@react-native-async-storage/async-storage';

import { bootstrap, initializeRuntime } from '@/app/initialization/bootstrap';
import { setLoading, setUser } from '@/app/store/reducers/userSlice';
import { store } from '@/app/store/store';
import { ServiceIdentifiers } from '@/di/registry';
import { SyncServiceIdentifiers } from '@/features/sync/di';
import { database as watermelonDB } from '@/shared/data/database/watermelon';

jest.mock('@react-native-async-storage/async-storage');
jest.mock('@/di/registry');
jest.mock('@/features/sync/di');
jest.mock('@/shared/data/database/watermelon');
jest.mock('@/app/store/store', () => ({
	store: {
		dispatch: jest.fn(),
		getState: jest.fn(() => ({
			user: { user: null, isLoggedIn: null, loading: false, error: null },
			workTrack: { loading: false, error: null, data: null },
		})),
		subscribe: jest.fn(),
		replaceReducer: jest.fn(),
	},
}));
jest.mock('@/app/store/reducers/userSlice', () => ({
	setLoading: jest.fn((value: boolean) => ({
		type: 'user/setLoading',
		payload: value,
	})),
	setUser: jest.fn((user: unknown) => ({
		type: 'user/setUser',
		payload: user,
	})),
}));

describe('bootstrap', () => {
	let mockContainer: {
		resolve: jest.Mock;
	};
	let mockDatabase: Database;
	let mockSyncManager: {
		start: jest.Mock;
	};

	beforeEach(() => {
		mockDatabase = {} as Database;
		mockSyncManager = {
			start: jest.fn(),
		};

		mockContainer = {
			resolve: jest.fn((key: symbol) => {
				if (key === ServiceIdentifiers.WATERMELON_DB) {
					return mockDatabase;
				}
				if (key === SyncServiceIdentifiers.SYNC_MANAGER) {
					return mockSyncManager;
				}
				return null;
			}),
		};

		const { createContainer } = require('@/di/registry');
		createContainer.mockReturnValue(mockContainer);

		jest.clearAllMocks();
	});

	describe('bootstrap', () => {
		it('initializes container and database', async () => {
			const result = await bootstrap();

			expect(result.container).toBe(mockContainer);
			expect(result.database).toBe(mockDatabase);
			expect(result.store).toBe(store);
			expect(mockContainer.resolve).toHaveBeenCalledWith(
				ServiceIdentifiers.WATERMELON_DB
			);
		});

		it('uses watermelonDB as fallback when container resolves null', async () => {
			mockContainer.resolve.mockReturnValue(null);

			const result = await bootstrap();

			expect(result.database).toBe(watermelonDB);
		});

		it('returns container and store', async () => {
			const result = await bootstrap();

			expect(result).toHaveProperty('container');
			expect(result).toHaveProperty('database');
			expect(result).toHaveProperty('store');
		});
	});

	describe('initializeRuntime', () => {
		it('restores user from storage and starts sync manager', async () => {
			const userData = {
				id: 'user-1',
				name: 'Test User',
				email: 'test@example.com',
				photo: 'photo-url',
				createdAt: '2024-01-01T00:00:00Z',
				updatedAt: '2024-01-02T00:00:00Z',
			};

			(AsyncStorage.getItem as jest.Mock).mockResolvedValue(
				JSON.stringify(userData)
			);

			await initializeRuntime();

			expect(store.dispatch).toHaveBeenCalledWith(setLoading(true));
			expect(AsyncStorage.getItem).toHaveBeenCalledWith('user');
			expect(store.dispatch).toHaveBeenCalledWith(
				setUser({
					id: userData.id,
					name: userData.name,
					email: userData.email,
					photo: userData.photo,
					createdAt: userData.createdAt,
					updatedAt: userData.updatedAt,
				})
			);
			expect(mockContainer.resolve).toHaveBeenCalledWith(
				SyncServiceIdentifiers.SYNC_MANAGER
			);
			expect(mockSyncManager.start).toHaveBeenCalled();
			expect(store.dispatch).toHaveBeenCalledWith(setLoading(false));
		});

		it('sets user to null when storage is empty', async () => {
			(AsyncStorage.getItem as jest.Mock).mockResolvedValue(null);

			await initializeRuntime();

			expect(store.dispatch).toHaveBeenCalledWith(setUser(null));
			expect(mockSyncManager.start).toHaveBeenCalled();
			expect(store.dispatch).toHaveBeenCalledWith(setLoading(false));
		});

		it('sets default dates when user data missing createdAt/updatedAt', async () => {
			const userData = {
				id: 'user-1',
				name: 'Test User',
				email: 'test@example.com',
			};

			(AsyncStorage.getItem as jest.Mock).mockResolvedValue(
				JSON.stringify(userData)
			);

			const mockNow = new Date('2024-01-01T00:00:00Z');
			// Mock Date constructor to return mockNow
			const OriginalDate = global.Date;
			global.Date = jest.fn(() => mockNow) as unknown as typeof Date;
			// Preserve Date static methods
			global.Date.now = OriginalDate.now;
			global.Date.parse = OriginalDate.parse;
			global.Date.UTC = OriginalDate.UTC;

			await initializeRuntime();

			expect(store.dispatch).toHaveBeenCalledWith(
				setUser({
					id: userData.id,
					name: userData.name,
					email: userData.email,
					photo: undefined,
					createdAt: expect.any(String),
					updatedAt: expect.any(String),
				})
			);

			global.Date = OriginalDate;
		});

		it('always sets loading to false in finally block', async () => {
			(AsyncStorage.getItem as jest.Mock).mockRejectedValue(
				new Error('Storage error')
			);

			await expect(initializeRuntime()).rejects.toThrow('Storage error');

			expect(store.dispatch).toHaveBeenCalledWith(setLoading(true));
			expect(store.dispatch).toHaveBeenCalledWith(setLoading(false));
		});

		it('handles JSON parse errors', async () => {
			(AsyncStorage.getItem as jest.Mock).mockResolvedValue(
				'invalid json'
			);

			await expect(initializeRuntime()).rejects.toThrow();

			expect(store.dispatch).toHaveBeenCalledWith(setLoading(false));
		});
	});
});
