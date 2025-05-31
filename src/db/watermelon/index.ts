import { Database } from '@nozbe/watermelondb';
import SQLiteAdapter from '@nozbe/watermelondb/adapters/sqlite';

import migrations from './migrations/schema_v2';
import schema from './schema';
import Sharing from './sharing/model';
import WorkTrack from './worktrack/model';

const adapter = new SQLiteAdapter({
	schema,
	migrations,
	jsi: true,
	onSetUpError: (error) => {
		console.error('Database setup error:', error);
	},
});

export const database = new Database({
	adapter,
	modelClasses: [WorkTrack, Sharing],
});
