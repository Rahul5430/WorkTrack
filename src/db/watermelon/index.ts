import { Database } from '@nozbe/watermelondb';
import SQLiteAdapter from '@nozbe/watermelondb/adapters/sqlite';

import schema from './schema';
import SharedTracker from './shared_tracker/model';
import Tracker from './tracker/model';
import WorkTrack from './worktrack/model';

const adapter = new SQLiteAdapter({
	schema,
	jsi: true,
	onSetUpError: (error) => {
		console.error('Database setup error:', error);
	},
});

export const database = new Database({
	adapter,
	modelClasses: [WorkTrack, Tracker, SharedTracker],
});

// Models and schemas
export { default as SharedTracker } from './shared_tracker/model';
export { sharedTrackerSchema } from './shared_tracker/schema';
export { default as Tracker } from './tracker/model';
export { trackerSchema } from './tracker/schema';
export { default as WorkTrack } from './worktrack/model';
export { workTrackSchema } from './worktrack/schema';
