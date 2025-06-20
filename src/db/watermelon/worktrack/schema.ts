import { tableSchema } from '@nozbe/watermelondb';

export const workTrackSchema = tableSchema({
	name: 'work_tracks',
	columns: [
		{ name: 'date', type: 'string', isIndexed: true },
		{ name: 'status', type: 'string' },
		{ name: 'created_at', type: 'number' },
		{ name: 'last_modified', type: 'number' },
		{ name: 'is_advisory', type: 'boolean' },
		{ name: 'tracker_id', type: 'string', isIndexed: true },
		{ name: 'needs_sync', type: 'boolean' },
		{ name: 'sync_error', type: 'string', isOptional: true },
		{ name: 'retry_count', type: 'number', isOptional: true },
	],
});
