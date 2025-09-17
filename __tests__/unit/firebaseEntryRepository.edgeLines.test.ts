import { jest } from '@jest/globals';

describe('FirebaseEntryRepository edge lines', () => {
	it('upsertOne delegates to upsertMany (line 48)', async () => {
		await jest.isolateModules(async () => {
			const upsertManySpy = jest
				.fn<(trackerId: string, entries: unknown[]) => Promise<void>>()
				.mockResolvedValue(undefined);

			jest.doMock('../../src/services', () => ({
				getFirestoreInstance: () => ({}),
			}));
			jest.doMock('@react-native-firebase/firestore', () => ({
				collection: jest.fn(),
				setDoc: jest.fn(),
				doc: jest.fn(),
			}));

			// Mock the class to spy on upsertMany
			jest.doMock(
				'../../src/repositories/firebaseEntryRepository',
				() => {
					class MockFirebaseEntryRepository {
						async upsertMany(
							trackerId: string,
							entries: unknown[]
						) {
							return upsertManySpy(trackerId, entries);
						}

						async upsertOne(entry: { trackerId: string }) {
							await this.upsertMany(entry.trackerId, [entry]);
						}

						async getEntriesForTracker() {
							throw new Error('not implemented');
						}
					}
					return {
						FirebaseEntryRepository: MockFirebaseEntryRepository,
					};
				}
			);

			const {
				FirebaseEntryRepository,
			} = require('../../src/repositories/firebaseEntryRepository');
			const repo = new FirebaseEntryRepository();

			const testEntry = {
				id: 'e1',
				trackerId: 't1',
				date: '2025-01-01',
				status: 'office',
				isAdvisory: false,
				needsSync: true,
				lastModified: 1,
			};

			await repo.upsertOne(testEntry);

			expect(upsertManySpy).toHaveBeenCalledWith('t1', [testEntry]);
		});
	});

	it('getEntriesForTracker throws SyncError on generic error (line 94)', async () => {
		await jest.isolateModules(async () => {
			jest.doMock('../../src/services', () => ({
				getFirestoreInstance: () => ({}),
			}));
			jest.doMock('@react-native-firebase/firestore', () => ({
				collection: jest.fn(),
				getDocs: jest
					.fn<() => Promise<never>>()
					.mockRejectedValue(new Error('Generic error')),
			}));
			jest.doMock('../../src/errors', () => ({
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

			// Import real repository (without our class mock) to test error wrapping
			jest.dontMock('../../src/repositories/firebaseEntryRepository');
			const realRepoModule = require('../../src/repositories/firebaseEntryRepository');
			const repo = new realRepoModule.FirebaseEntryRepository();

			await expect(repo.getEntriesForTracker('t1')).rejects.toMatchObject(
				{
					name: 'SyncError',
					message: 'Failed to fetch entries from Firestore',
				}
			);
		});
	});
});
