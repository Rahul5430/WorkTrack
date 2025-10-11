import type {
	IShareRepository,
	ITrackerRepository,
	Permission,
	TrackerDTO,
} from '../../../src/types';
import { ShareUseCaseImpl } from '../../../src/use-cases/shareUseCase';

jest.mock('@react-native-firebase/auth', () => ({
	getAuth: () => ({ currentUser: { uid: 'me' } }),
}));

describe('ShareUseCase branches', () => {
	let shares: jest.Mocked<IShareRepository>;
	let trackers: jest.Mocked<ITrackerRepository>;
	beforeEach(() => {
		shares = {
			share: jest.fn(async () => {}),
			updatePermission: jest.fn(async () => {}),
			unshare: jest.fn(async () => {}),
		} as unknown as jest.Mocked<IShareRepository>;
		const defaultTracker: TrackerDTO = {
			id: 't1',
			ownerId: 'me',
			name: 'Tracker t1',
			color: '#000000',
			trackerType: 'default',
			isDefault: true,
		};
		trackers = {
			listOwned: jest.fn(async () => [defaultTracker]),
			ensureExists: jest.fn(async () => {}),
		} as unknown as jest.Mocked<ITrackerRepository>;
		jest.resetModules();
	});

	it('shareByEmail throws when unauthenticated', async () => {
		let Impl!: typeof ShareUseCaseImpl;
		jest.isolateModules(() => {
			jest.doMock('@react-native-firebase/auth', () => ({
				getAuth: () => ({ currentUser: null }),
			}));
			Impl =
				require('../../../src/use-cases/shareUseCase').ShareUseCaseImpl;
		});
		const uc = new Impl(shares, trackers);
		await expect(
			uc.shareByEmail('a@b.com', 'read' as Permission, 't1')
		).rejects.toMatchObject({ code: 'auth.unauthenticated' });
	});

	it('shareByEmail throws when trying to share to self', async () => {
		let Impl!: typeof ShareUseCaseImpl;
		jest.isolateModules(() => {
			jest.doMock('@react-native-firebase/auth', () => ({
				getAuth: () => ({ currentUser: { uid: 'me' } }),
			}));
			jest.doMock('../../../src/services', () => ({
				getFirestoreInstance: jest.fn(() => ({})),
			}));
			jest.doMock('@react-native-firebase/firestore', () => ({
				getDocs: jest.fn(async () => ({
					empty: false,
					docs: [{ id: 'me' }],
				})),
				collection: jest.fn(() => ({})),
				where: jest.fn(() => ({})),
				query: jest.fn(() => ({})),
			}));
			Impl =
				require('../../../src/use-cases/shareUseCase').ShareUseCaseImpl;
		});
		const uc = new Impl(shares, trackers);
		await expect(
			uc.shareByEmail('Me@Example.com', 'read' as Permission, 't1')
		).rejects.toMatchObject({ code: 'share.self' });
	});

	it('shareByEmail throws when no tracker available to share', async () => {
		(trackers.listOwned as unknown as jest.Mock).mockResolvedValueOnce([]);
		let Impl!: typeof ShareUseCaseImpl;
		jest.isolateModules(() => {
			jest.doMock('@react-native-firebase/auth', () => ({
				getAuth: () => ({ currentUser: { uid: 'me' } }),
			}));
			jest.doMock('../../../src/services', () => ({
				getFirestoreInstance: jest.fn(() => ({})),
			}));
			jest.doMock('@react-native-firebase/firestore', () => ({
				getDocs: jest.fn(async () => ({
					empty: false,
					docs: [{ id: 'other' }],
				})),
				collection: jest.fn(() => ({})),
				where: jest.fn(() => ({})),
				query: jest.fn(() => ({})),
			}));
			Impl =
				require('../../../src/use-cases/shareUseCase').ShareUseCaseImpl;
		});
		const uc = new Impl(shares, trackers);
		await expect(
			uc.shareByEmail('x@y.com', 'read' as Permission)
		).rejects.toMatchObject({ code: 'tracker.not_found' });
	});

	it('updateSharePermission resolves tracker and forwards to repository', async () => {
		const uc = new ShareUseCaseImpl(shares, trackers);
		await uc.updateSharePermission('u2', 'write' as Permission);
		expect(shares.updatePermission).toHaveBeenCalledWith(
			't1',
			'u2',
			'write'
		);
	});
});
