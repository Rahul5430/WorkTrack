import { appSchema, tableSchema } from '@nozbe/watermelondb';

import { workTrackSchema } from './worktrack/schema';

export default appSchema({
	version: 2,
	tables: [
		workTrackSchema,
		tableSchema({
			name: 'trackers',
			columns: [
				{ name: 'name', type: 'string' },
				{ name: 'color', type: 'string' },
				{ name: 'created_at', type: 'number' },
				{ name: 'is_default', type: 'boolean' },
			],
		}),
		tableSchema({
			name: 'shared_trackers',
			columns: [
				{ name: 'tracker_id', type: 'string' },
				{ name: 'shared_with', type: 'string' },
				{ name: 'permission', type: 'string' },
				{ name: 'created_at', type: 'number' },
			],
		}),
	],
});
