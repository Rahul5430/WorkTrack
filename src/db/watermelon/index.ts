import { Database } from '@nozbe/watermelondb';
import SQLiteAdapter from '@nozbe/watermelondb/adapters/sqlite';

import { schema } from './schema';
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
	modelClasses: [WorkTrack],
});
