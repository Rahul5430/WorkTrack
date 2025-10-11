describe('FirebaseEntryRepository more branches', () => {
	it('getEntriesForTracker returns [] on permission-denied', async () => {
		await jest.isolateModules(async () => {
			jest.doMock('../../../src/services', () => ({
				getFirestoreInstance: () => ({}),
			}));
			const getDocs = jest
				.fn()
				.mockRejectedValue({ code: 'firestore/permission-denied' });
			const collection = jest.fn();
			jest.doMock('@react-native-firebase/firestore', () => ({
				getDocs,
				collection,
			}));
			const {
				FirebaseEntryRepository,
			} = require('../../../src/repositories/firebaseEntryRepository');
			const repo = new FirebaseEntryRepository();
			await expect(repo.getEntriesForTracker('t1')).resolves.toEqual([]);
		});
	});

	it('getAllEntries returns [] on permission-denied', async () => {
		await jest.isolateModules(async () => {
			jest.doMock('../../../src/services', () => ({
				getFirestoreInstance: () => ({}),
			}));
			const getDocs = jest
				.fn()
				.mockRejectedValue({ code: 'firestore/permission-denied' });
			const collection = jest.fn();
			jest.doMock('@react-native-firebase/firestore', () => ({
				getDocs,
				collection,
			}));
			const {
				FirebaseEntryRepository,
			} = require('../../../src/repositories/firebaseEntryRepository');
			const repo = new FirebaseEntryRepository();
			await expect(repo.getAllEntries()).resolves.toEqual([]);
		});
	});

	it('delete logs not found path without throwing', async () => {
		await jest.isolateModules(async () => {
			jest.doMock('../../../src/services', () => ({
				getFirestoreInstance: () => ({}),
			}));
			const trackersSnapshot = { docs: [{ id: 't1' }, { id: 't2' }] };
			const getDocs = jest.fn().mockResolvedValueOnce(trackersSnapshot);
			const deleteDoc = jest.fn().mockRejectedValue(new Error('nope'));
			const collection = jest.fn();
			const doc = jest.fn();
			jest.doMock('@react-native-firebase/firestore', () => ({
				getDocs,
				deleteDoc,
				collection,
				doc,
			}));
			const {
				FirebaseEntryRepository,
			} = require('../../../src/repositories/firebaseEntryRepository');
			const repo = new FirebaseEntryRepository();
			await expect(repo.delete('x')).resolves.toBeUndefined();
		});
	});
});
