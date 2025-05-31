import { appSchema, tableSchema } from '@nozbe/watermelondb';

import { workTrackSchema } from './worktrack/schema';

export default appSchema({
	version: 2,
	tables: [
		workTrackSchema,
		tableSchema({
			name: 'sharing',
			columns: [
				{ name: 'owner_id', type: 'string' },
				{ name: 'shared_with_id', type: 'string' },
				{ name: 'shared_with_email', type: 'string' },
				{ name: 'permission', type: 'string' },
				{ name: 'created_at', type: 'number' },
				{ name: 'updated_at', type: 'number' },
			],
		}),
	],
});
