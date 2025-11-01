import { createSelector } from '@reduxjs/toolkit';

import type { SyncState } from './syncSlice';

type RootWithSync = { sync: SyncState };

const selectSync = (state: RootWithSync) => state.sync;

export const selectSyncState = createSelector(
	[selectSync],
	(sync) => sync.state
);

export const selectLastSyncedAt = createSelector(
	[selectSync],
	(sync) => sync.lastSyncedAt
);

export const selectSyncError = createSelector(
	[selectSync],
	(sync) => sync.error
);
