describe('FirebaseTrackerRepository branches', () => {
	it('update throws when tracker not owned', async () => {
		await jest.isolateModules(async () => {
			jest.doMock('../../../src/services', () => ({
				getFirestoreInstance: jest.fn(() => ({})),
			}));
			jest.doMock('../../../src/mappers/trackerMapper', () => ({
				trackerDTOToFirestore: (dto: Record<string, unknown>) => dto,
				trackerFirestoreToDTO: (d: Record<string, unknown>) => d,
			}));
			const getDocs = jest.fn().mockResolvedValue({
				forEach: (
					cb: (d: {
						id: string;
						data: () => { ownerId: string };
					}) => void
				) => cb({ id: 't-other', data: () => ({ ownerId: 'u2' }) }),
			});
			const setDoc = jest.fn();
			const doc = jest.fn();
			const collection = jest.fn();
			const where = jest.fn();
			const query = jest.fn();
			jest.doMock('@react-native-firebase/firestore', () => ({
				getDocs,
				setDoc,
				doc,
				collection,
				where,
				query,
				Timestamp: {
					fromDate: (d: Date) => ({ toMillis: () => d.getTime() }),
				},
			}));
			const {
				FirebaseTrackerRepository,
			} = require('../../../src/repositories/firebaseTrackerRepository');
			const repo = new FirebaseTrackerRepository();
			await expect(
				repo.update({ id: 't1', name: 'x' }, 'u1')
			).rejects.toThrow('Tracker not found or not owned by user');
		});
	});

	it('listOwned throws SyncError on generic error', async () => {
		await jest.isolateModules(async () => {
			jest.doMock('../../../src/services', () => ({
				getFirestoreInstance: jest.fn(() => ({})),
			}));
			const getDocs = jest.fn().mockRejectedValue(new Error('fail'));
			const collection = jest.fn();
			const where = jest.fn();
			const query = jest.fn();
			jest.doMock('@react-native-firebase/firestore', () => ({
				getDocs,
				collection,
				where,
				query,
			}));
			const {
				FirebaseTrackerRepository,
			} = require('../../../src/repositories/firebaseTrackerRepository');
			const repo = new FirebaseTrackerRepository();
			await expect(repo.listOwned('u1')).rejects.toMatchObject({
				name: 'SyncError',
			});
		});
	});

	it('listSharedWith warns on conversion error and returns [] on permission denied', async () => {
		await jest.isolateModules(async () => {
			jest.doMock('../../../src/services', () => ({
				getFirestoreInstance: jest.fn(() => ({})),
			}));
			jest.doMock('../../../src/mappers/trackerMapper', () => ({
				trackerFirestoreToDTO: () => {
					throw new Error('bad convert');
				},
			}));
			const getDocs = jest
				.fn()
				.mockResolvedValueOnce({
					docs: [{ ref: { path: 'trackers/t1/shares/s1' } }],
				})
				.mockRejectedValueOnce({ code: 'firestore/permission-denied' });
			const getDoc = jest.fn().mockResolvedValue({
				exists: () => true,
				id: 't1',
				data: () => ({}),
			});
			const doc = jest.fn();
			const collectionGroup = jest.fn();
			const where = jest.fn();
			const query = jest.fn();
			jest.doMock('@react-native-firebase/firestore', () => ({
				getDocs,
				getDoc,
				doc,
				collectionGroup,
				where,
				query,
			}));
			const {
				FirebaseTrackerRepository,
			} = require('../../../src/repositories/firebaseTrackerRepository');
			const repo = new FirebaseTrackerRepository();
			await expect(repo.listSharedWith('u1')).resolves.toEqual([]);
			await expect(repo.listSharedWith('u1')).resolves.toEqual([]);
		});
	});
});
