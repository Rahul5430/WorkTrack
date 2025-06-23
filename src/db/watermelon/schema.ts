import { appSchema, tableSchema } from '@nozbe/watermelondb';

import { workTrackSchema } from './worktrack/schema';

export default appSchema({
	version: 4,
	tables: [
		workTrackSchema,
		tableSchema({
			name: 'trackers',
			columns: [
				{ name: 'owner_id', type: 'string' },
				{ name: 'name', type: 'string' },
				{ name: 'color', type: 'string' },
				{ name: 'created_at', type: 'number' },
				{ name: 'is_default', type: 'boolean' },
				{ name: 'tracker_type', type: 'string' },
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
