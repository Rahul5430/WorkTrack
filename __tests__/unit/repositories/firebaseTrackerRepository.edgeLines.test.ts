import { jest } from '@jest/globals';

describe('FirebaseTrackerRepository edge lines', () => {
	it('listSharedWith warns when tracker document exists but has no data (line 157)', async () => {
		await jest.isolateModules(async () => {
			const warnSpy = jest.fn();
			jest.doMock('../../../src/logging', () => ({
				logger: {
					debug: jest.fn(),
					info: jest.fn(),
					warn: warnSpy,
					error: jest.fn(),
				},
			}));
			jest.doMock('../../../src/services', () => ({
				getFirestoreInstance: () => ({}),
			}));
			const getDocMock = jest
				.fn<
					() => Promise<{
						exists: () => boolean;
						data: () => undefined;
					}>
				>()
				.mockResolvedValue({
					exists: () => true,
					data: () => undefined, // No data
				});
			const getDocsMock = jest
				.fn<() => Promise<{ docs: Array<{ ref: { path: string } }> }>>()
				.mockResolvedValue({
					docs: [
						{
							ref: { path: 'trackers/t1/shares/s1' },
						},
					],
				});
			jest.doMock('@react-native-firebase/firestore', () => ({
				collectionGroup: jest.fn(),
				where: jest.fn(),
				query: jest.fn(() => ({})),
				getDocs: () => getDocsMock(),
				doc: jest.fn(),
				getDoc: () => getDocMock(),
			}));

			const {
				FirebaseTrackerRepository,
			} = require('../../../src/repositories/firebaseTrackerRepository');
			const repo = new FirebaseTrackerRepository();

			await repo.listSharedWith('u1');

			expect(warnSpy).toHaveBeenCalledWith(
				'Tracker document exists but has no data',
				{
					trackerId: 't1',
					userId: 'u1',
				}
			);
		});
	});

	it('listSharedWith throws SyncError on generic error (line 187)', async () => {
		await jest.isolateModules(async () => {
			jest.doMock('../../../src/services', () => ({
				getFirestoreInstance: () => ({}),
			}));
			jest.doMock('@react-native-firebase/firestore', () => ({
				collection: jest.fn(),
				getDocs: jest
					.fn<() => Promise<never>>()
					.mockRejectedValue(new Error('Generic error')),
			}));
			jest.doMock('../../../src/errors', () => ({
				SyncError: class SyncError extends Error {
					context?: Record<string, unknown>;
					constructor(
						message: string,
						context: Record<string, unknown>
					) {
						super(message);
						this.name = 'SyncError';
						this.context = context;
					}
				},
			}));

			const {
				FirebaseTrackerRepository,
			} = require('../../../src/repositories/firebaseTrackerRepository');
			const repo = new FirebaseTrackerRepository();

			await expect(repo.listSharedWith('u1')).rejects.toMatchObject({
				name: 'SyncError',
				message: 'Failed to fetch shared trackers',
			});
		});
	});
});
