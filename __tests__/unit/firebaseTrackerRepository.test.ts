describe('FirebaseTrackerRepository', () => {
	const sampleTracker = {
		id: 't1',
		ownerId: 'u1',
		name: 'My Tracker',
		color: '#123456',
		isDefault: false,
		trackerType: 'work',
	};

	type AnyRecord = Record<string, unknown>;

	function makeDoc(id: string, data?: AnyRecord) {
		return {
			id,
			ref: { path: `trackers/${id}` },
			data: () => data ?? {},
			exists: () => Boolean(data),
		};
	}

	const mapperStub = {
		trackerDTOToFirestore: (dto: AnyRecord) => ({ ...dto, createdAt: 0 }),
		trackerFirestoreToDTO: (data: AnyRecord) => ({
			id: data.id as string,
			ownerId: data.ownerId as string,
			name: data.name as string,
			color: data.color as string,
			isDefault: data.isDefault as boolean,
			trackerType: data.trackerType as string,
		}),
		trackerDTOToModelData: (dto: AnyRecord) => dto,
		trackerModelToDTO: (m: AnyRecord) => m,
	};

	it('create, update, listOwned happy path and permission denied', async () => {
		await jest.isolateModules(async () => {
			jest.doMock('../../src/services', () => ({
				getFirestoreInstance: jest.fn(() => ({})),
			}));
			jest.doMock('../../src/mappers/trackerMapper', () => mapperStub);
			const setDoc = jest.fn(async () => {});
			const successSnapshot = {
				forEach: (cb: (d: AnyRecord) => void) =>
					cb(
						makeDoc('t1', {
							ownerId: 'u1',
							name: 'My',
							color: '#111111',
							isDefault: false,
							trackerType: 'work',
							createdAt: { toMillis: () => Date.now() },
						})
					),
			};
			const getDocs = jest
				.fn()
				.mockResolvedValueOnce(successSnapshot)
				.mockResolvedValueOnce(successSnapshot)
				.mockRejectedValueOnce({ code: 'firestore/permission-denied' });
			const getDoc = jest
				.fn()
				.mockResolvedValue(makeDoc('t1', { exists: true }));
			const doc = jest.fn((_db: unknown, _col: string, id: string) => ({
				id,
			}));
			const collection = jest.fn();
			const collectionGroup = jest.fn();
			const where = jest.fn();
			const query = jest.fn();

			jest.doMock('@react-native-firebase/firestore', () => ({
				setDoc,
				getDocs,
				getDoc,
				doc,
				collection,
				collectionGroup,
				where,
				query,
				Timestamp: {
					fromDate: (d: Date) => ({ toMillis: () => d.getTime() }),
				},
			}));

			const {
				FirebaseTrackerRepository,
			} = require('../../src/repositories/firebaseTrackerRepository');
			const repo = new FirebaseTrackerRepository();

			await expect(
				repo.create(sampleTracker, 'u1')
			).resolves.toBeUndefined();
			expect(setDoc).toHaveBeenCalled();

			await expect(
				repo.update({ id: 't1', name: 'Renamed' }, 'u1')
			).resolves.toBeUndefined();
			expect(setDoc).toHaveBeenCalled();

			await expect(repo.listOwned('u1')).resolves.toHaveLength(1);
			await expect(repo.listOwned('u1')).resolves.toEqual([]);
		});
	});

	it('listSharedWith aggregates by collectionGroup and fetches trackers', async () => {
		await jest.isolateModules(async () => {
			jest.doMock('../../src/services', () => ({
				getFirestoreInstance: jest.fn(() => ({})),
			}));
			jest.doMock('../../src/mappers/trackerMapper', () => mapperStub);
			const getDocs = jest.fn().mockResolvedValue({
				docs: [{ ref: { path: 'trackers/t1/shares/s1' } }],
			});
			const getDoc = jest.fn().mockResolvedValue(
				makeDoc('t1', {
					ownerId: 'u2',
					name: 'S',
					color: '#222222',
					isDefault: false,
					trackerType: 'work',
					createdAt: { toMillis: () => Date.now() },
				})
			);
			const doc = jest.fn((_db: unknown, _c: string, id: string) => ({
				id,
			}));
			const collection = jest.fn();
			const collectionGroup = jest.fn();
			const where = jest.fn();
			const query = jest.fn();
			jest.doMock('@react-native-firebase/firestore', () => ({
				getDocs,
				getDoc,
				doc,
				collection,
				collectionGroup,
				where,
				query,
				Timestamp: {
					fromDate: (d: Date) => ({ toMillis: () => d.getTime() }),
				},
			}));
			const {
				FirebaseTrackerRepository,
			} = require('../../src/repositories/firebaseTrackerRepository');
			const repo = new FirebaseTrackerRepository();
			await expect(repo.listSharedWith('u1')).resolves.toHaveLength(1);
		});
	});

	it('ensureExists creates when missing and no-ops when exists', async () => {
		await jest.isolateModules(async () => {
			jest.doMock('../../src/services', () => ({
				getFirestoreInstance: jest.fn(() => ({})),
			}));
			jest.doMock('../../src/mappers/trackerMapper', () => mapperStub);
			const setDoc = jest.fn(async () => {});
			const getDoc = jest
				.fn()
				.mockResolvedValueOnce({ exists: () => false })
				.mockResolvedValueOnce({ exists: () => true });
			const doc = jest.fn((_db: unknown, _c: string, id: string) => ({
				id,
			}));
			jest.doMock('@react-native-firebase/firestore', () => ({
				setDoc,
				getDoc,
				doc,
			}));
			const {
				FirebaseTrackerRepository,
			} = require('../../src/repositories/firebaseTrackerRepository');
			const repo = new FirebaseTrackerRepository();
			await repo.ensureExists('t1', 'u1');
			expect(setDoc).toHaveBeenCalled();
			await repo.ensureExists('t1', 'u1');
			expect(setDoc).toHaveBeenCalledTimes(1);
		});
	});

	it('upsertMany success and error path', async () => {
		await jest.isolateModules(async () => {
			jest.doMock('../../src/services', () => ({
				getFirestoreInstance: jest.fn(() => ({})),
			}));
			jest.doMock('../../src/mappers/trackerMapper', () => mapperStub);
			const setDoc = jest
				.fn()
				.mockResolvedValueOnce(undefined)
				.mockResolvedValueOnce(undefined);
			const doc = jest.fn((_db: unknown, _c: string, id: string) => ({
				id,
			}));
			jest.doMock('@react-native-firebase/firestore', () => ({
				setDoc,
				doc,
			}));
			const {
				FirebaseTrackerRepository,
			} = require('../../src/repositories/firebaseTrackerRepository');
			const repo = new FirebaseTrackerRepository();
			await expect(
				repo.upsertMany([sampleTracker, { ...sampleTracker, id: 't2' }])
			).resolves.toBeUndefined();
		});

		await jest.isolateModules(async () => {
			jest.doMock('../../src/services', () => ({
				getFirestoreInstance: jest.fn(() => ({})),
			}));
			jest.doMock('../../src/mappers/trackerMapper', () => mapperStub);
			const setDoc = jest.fn(async () => {
				throw new Error('boom');
			});
			const doc = jest.fn((_db: unknown, _c: string, id: string) => ({
				id,
			}));
			jest.doMock('@react-native-firebase/firestore', () => ({
				setDoc,
				doc,
			}));
			const {
				FirebaseTrackerRepository,
			} = require('../../src/repositories/firebaseTrackerRepository');
			const repo = new FirebaseTrackerRepository();
			await expect(
				repo.upsertMany([sampleTracker])
			).rejects.toMatchObject({ name: 'SyncError' });
		});
	});
});
