import {
	FirebaseEntryRepository,
	FirebaseShareRepository,
	FirebaseTrackerRepository,
	WatermelonEntryRepository,
	WatermelonTrackerRepository,
} from '../repositories';
import {
	ILocalEntryRepository,
	IRemoteEntryRepository,
	IShareRepository,
	ITrackerRepository,
} from '../types';
import {
	createEntryUseCase,
	createShareReadUseCase,
	createShareUseCase,
	createSyncUseCase,
	createUserManagementUseCase,
	EntryUseCase,
	ShareReadUseCase,
	ShareUseCase,
	SyncFromRemoteUseCaseImpl,
	SyncToRemoteUseCaseImpl,
	SyncUseCase,
	UserManagementUseCase,
} from '../use-cases';

export interface Container {
	trackers: ITrackerRepository;
	localTrackers: ITrackerRepository;
	entries: ILocalEntryRepository;
	firebaseEntries: IRemoteEntryRepository;
	shares: IShareRepository;
	sync: SyncUseCase;
	share: ShareUseCase;
	shareRead: ShareReadUseCase;
	userManagement: UserManagementUseCase;
	entry: EntryUseCase;
}

export function createDefaultContainer(): Container {
	const trackers = new FirebaseTrackerRepository();
	const localTrackers = new WatermelonTrackerRepository();
	const entries = new WatermelonEntryRepository();
	const firebaseEntries = new FirebaseEntryRepository();
	const shares = new FirebaseShareRepository();

	const syncToRemote = new SyncToRemoteUseCaseImpl(
		entries,
		firebaseEntries,
		trackers
	);
	const syncFromRemote = new SyncFromRemoteUseCaseImpl(
		entries,
		trackers,
		firebaseEntries,
		localTrackers
	);
	const sync = createSyncUseCase(syncToRemote, syncFromRemote);
	const share = createShareUseCase(shares, trackers);
	const shareRead = createShareReadUseCase(shares, trackers);
	const userManagement = createUserManagementUseCase(
		trackers,
		entries,
		firebaseEntries
	);
	const entry = createEntryUseCase(entries);

	return {
		trackers,
		localTrackers,
		entries,
		firebaseEntries,
		shares,
		sync,
		share,
		shareRead,
		userManagement,
		entry,
	};
}
