describe('SyncUseCase branches', () => {
	beforeEach(() => {
		jest.resetModules();
		jest.clearAllMocks();
	});

	it('skips when already syncing and throws when unauthenticated', async () => {
		jest.isolateModules(async () => {
			const to = { execute: jest.fn(async () => {}) };
			const from = { execute: jest.fn(async () => {}) };
			// unauthenticated
			jest.doMock('@react-native-firebase/auth', () => ({
				getAuth: () => ({ currentUser: null }),
			}));
			const {
				SyncUseCaseImpl: Impl,
			} = require('../../src/use-cases/syncUseCase');
			const uc = new Impl(to, from);
			await expect(uc.execute()).rejects.toMatchObject({
				code: 'auth.unauthenticated',
			});

			// already syncing
			jest.doMock('@react-native-firebase/auth', () => ({
				getAuth: () => ({ currentUser: { uid: 'me' } }),
			}));
			const {
				SyncUseCaseImpl: Impl2,
			} = require('../../src/use-cases/syncUseCase');
			const uc2 = new Impl2(to, from);
			// set private flag via casting
			(uc2 as unknown as { isSyncing: boolean }).isSyncing = true;
			await uc2.execute();
			expect(to.execute).not.toHaveBeenCalled();
		});
	});

	it('success path updates lastSyncTime and resets isSyncing', async () => {
		jest.isolateModules(async () => {
			const to = { execute: jest.fn(async () => {}) };
			const from = { execute: jest.fn(async () => {}) };
			jest.doMock('@react-native-firebase/auth', () => ({
				getAuth: () => ({ currentUser: { uid: 'me' } }),
			}));
			const {
				SyncUseCaseImpl: Impl,
			} = require('../../src/use-cases/syncUseCase');
			const uc = new Impl(to, from);
			await uc.execute();
			const status = await uc.getSyncStatus();
			expect(status.isSyncing).toBe(false);
			expect(status.lastSyncTime).toBeDefined();
		});
	});

	it('error path resets isSyncing and rethrows', async () => {
		jest.isolateModules(async () => {
			const to = {
				execute: jest.fn(async () => {
					throw new Error('boom');
				}),
			};
			const from = { execute: jest.fn(async () => {}) };
			jest.doMock('@react-native-firebase/auth', () => ({
				getAuth: () => ({ currentUser: { uid: 'me' } }),
			}));
			const {
				SyncUseCaseImpl: Impl,
			} = require('../../src/use-cases/syncUseCase');
			const uc = new Impl(to, from);
			await expect(uc.execute()).rejects.toThrow('boom');
			const status = await uc.getSyncStatus();
			expect(status.isSyncing).toBe(false);
		});
	});
});
