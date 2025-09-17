import { getFirestoreInstance } from '../../src/services';
import type { Permission, ShareDTO } from '../../src/types';

type RepoAPI = {
	share: (s: ShareDTO) => Promise<void>;
	updatePermission: (
		sharedWithId: string,
		permission: Permission
	) => Promise<void>;
	unshare: (trackerId: string, sharedWithId: string) => Promise<void>;
};

jest.mock('../../src/services', () => ({ getFirestoreInstance: jest.fn() }));

const mockDb = {} as unknown as object;

describe('FirebaseShareRepository (isolated)', () => {
	beforeEach(() => {
		(getFirestoreInstance as unknown as jest.Mock).mockReturnValue(mockDb);
		jest.resetModules();
		jest.clearAllMocks();
	});

	it('share writes share doc and handles errors', async () => {
		const doc = jest.fn(() => ({}));
		const setDoc = jest.fn(async () => {});
		let repo!: RepoAPI;
		jest.isolateModules(() => {
			jest.doMock('../../src/mappers/shareMapper', () => ({
				shareDTOToFirestore: (s: ShareDTO) => ({ ...s }),
			}));
			jest.doMock('@react-native-firebase/firestore', () => ({
				doc,
				setDoc,
			}));
			const {
				FirebaseShareRepository,
			} = require('../../src/repositories/firebaseShareRepository');
			repo = new FirebaseShareRepository() as RepoAPI;
		});
		await expect(
			repo.share({
				trackerId: 't1',
				sharedWithId: 'u2',
				permission: 'read',
				sharedWithEmail: 'a@b.com',
			})
		).resolves.toBeUndefined();
		expect(doc).toHaveBeenCalled();
		expect(setDoc).toHaveBeenCalled();

		// error path
		jest.resetModules();
		const doc2 = jest.fn(() => ({}));
		const setDoc2 = jest.fn(async () => {
			throw new Error('boom');
		});
		jest.isolateModules(() => {
			jest.doMock('../../src/mappers/shareMapper', () => ({
				shareDTOToFirestore: (s: ShareDTO) => ({ ...s }),
			}));
			jest.doMock('@react-native-firebase/firestore', () => ({
				doc: doc2,
				setDoc: setDoc2,
			}));
			const {
				FirebaseShareRepository,
			} = require('../../src/repositories/firebaseShareRepository');
			repo = new FirebaseShareRepository() as RepoAPI;
		});
		await expect(
			repo.share({
				trackerId: 't1',
				sharedWithId: 'u2',
				permission: 'read',
				sharedWithEmail: 'a@b.com',
			})
		).rejects.toMatchObject({ code: 'firestore.share_failed' });
	});

	it('updatePermission finds share via collectionGroup and updates, or errors', async () => {
		const collectionGroup = jest.fn(() => ({}));
		const where = jest.fn(() => ({}));
		const query = jest.fn(() => ({}));
		const shareRef = { ref: {} };
		const getDocs = jest.fn(async () => ({
			empty: false,
			docs: [shareRef],
		}));
		const setDoc = jest.fn(async () => {});
		let repo!: RepoAPI;
		jest.isolateModules(() => {
			jest.doMock('../../src/mappers/shareMapper', () => ({
				shareDTOToFirestore: (s: ShareDTO) => ({ ...s }),
			}));
			jest.doMock('@react-native-firebase/firestore', () => ({
				collectionGroup,
				where,
				query,
				getDocs,
				setDoc,
			}));
			const {
				FirebaseShareRepository,
			} = require('../../src/repositories/firebaseShareRepository');
			repo = new FirebaseShareRepository() as RepoAPI;
		});
		await expect(
			repo.updatePermission('u2', 'write')
		).resolves.toBeUndefined();
		expect(getDocs).toHaveBeenCalled();
		expect(setDoc).toHaveBeenCalledWith(
			shareRef.ref,
			{ permission: 'write' },
			{ merge: true }
		);

		// error path
		jest.resetModules();
		const getDocsErr = jest.fn(async () => {
			throw new Error('boom');
		});
		jest.isolateModules(() => {
			jest.doMock('../../src/mappers/shareMapper', () => ({
				shareDTOToFirestore: (s: ShareDTO) => ({ ...s }),
			}));
			jest.doMock('@react-native-firebase/firestore', () => ({
				collectionGroup,
				where,
				query,
				getDocs: getDocsErr,
				setDoc,
			}));
			const {
				FirebaseShareRepository,
			} = require('../../src/repositories/firebaseShareRepository');
			repo = new FirebaseShareRepository() as RepoAPI;
		});
		await expect(repo.updatePermission('u2', 'read')).rejects.toMatchObject(
			{
				code: 'firestore.update_failed',
			}
		);
	});

	it('unshare deletes the doc and errors on failure', async () => {
		const deleted = { delete: jest.fn(async () => {}) };
		const doc = jest.fn(() => deleted);
		let repo!: RepoAPI;
		jest.isolateModules(() => {
			jest.doMock('../../src/mappers/shareMapper', () => ({
				shareDTOToFirestore: (s: ShareDTO) => ({ ...s }),
			}));
			jest.doMock('@react-native-firebase/firestore', () => ({ doc }));
			const {
				FirebaseShareRepository,
			} = require('../../src/repositories/firebaseShareRepository');
			repo = new FirebaseShareRepository() as RepoAPI;
		});
		await expect(repo.unshare('t1', 'u2')).resolves.toBeUndefined();
		expect(doc).toHaveBeenCalled();
		expect(deleted.delete).toHaveBeenCalled();

		// error path
		jest.resetModules();
		const bad = {
			delete: jest.fn(async () => {
				throw new Error('boom');
			}),
		};
		const doc2 = jest.fn(() => bad);
		jest.isolateModules(() => {
			jest.doMock('../../src/mappers/shareMapper', () => ({
				shareDTOToFirestore: (s: ShareDTO) => ({ ...s }),
			}));
			jest.doMock('@react-native-firebase/firestore', () => ({
				doc: doc2,
			}));
			const {
				FirebaseShareRepository,
			} = require('../../src/repositories/firebaseShareRepository');
			repo = new FirebaseShareRepository() as RepoAPI;
		});
		await expect(repo.unshare('t1', 'u2')).rejects.toMatchObject({
			code: 'firestore.unshare_failed',
		});
	});
});
