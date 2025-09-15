import type {
	EntryUseCase,
	ShareUseCase,
	SyncUseCase,
	UserManagementUseCase,
} from '../../src/use-cases';

// Capture calls to connectFirestoreEmulator using the central manual mock
const connectCalls: Array<{ host: string; port: number }> = [];

describe('DI container integration (emulator)', () => {
	it('resolves all dependencies and wires Firestore emulator', () => {
		const firestore = require('@react-native-firebase/firestore');
		jest.spyOn(firestore, 'connectFirestoreEmulator').mockImplementation(
			(...args: unknown[]) => {
				const host = args[1] as string;
				const port = args[2] as number;
				connectCalls.push({ host, port });
			}
		);

		const { createDefaultContainer } = require('../../src/di/container');
		const {
			FirebaseEntryRepository,
			FirebaseShareRepository,
			FirebaseTrackerRepository,
			WatermelonEntryRepository,
			WatermelonTrackerRepository,
		} = require('../../src/repositories');
		const { getFirestoreInstance } = require('../../src/services');

		const container = createDefaultContainer();

		expect(container.trackers).toBeInstanceOf(FirebaseTrackerRepository);
		expect(container.localTrackers).toBeInstanceOf(
			WatermelonTrackerRepository
		);
		expect(container.entries).toBeInstanceOf(WatermelonEntryRepository);
		expect(container.firebaseEntries).toBeInstanceOf(
			FirebaseEntryRepository
		);
		expect(container.shares).toBeInstanceOf(FirebaseShareRepository);

		const sync: SyncUseCase = container.sync;
		const share: ShareUseCase = container.share;
		const entry: EntryUseCase = container.entry;
		const userMgmt: UserManagementUseCase = container.userManagement;

		expect(typeof sync.execute).toBe('function');
		expect(typeof share.shareByEmail).toBe('function');
		expect(typeof entry.createOrUpdateEntry).toBe('function');
		expect(typeof userMgmt.ensureDatabaseReady).toBe('function');

		getFirestoreInstance();

		expect(connectCalls.length).toBeGreaterThan(0);
		expect(connectCalls[0]).toEqual({ host: '127.0.0.1', port: 8080 });
	});
});
