import { tableSchema } from '@nozbe/watermelondb';

export const workTrackSchema = tableSchema({
	name: 'work_tracks',
	columns: [
		{ name: 'date', type: 'string' },
		{ name: 'status', type: 'string' },
		{ name: 'created_at', type: 'number' },
		{ name: 'synced', type: 'boolean' },
		{ name: 'sync_error', type: 'string', isOptional: true },
		{ name: 'last_modified', type: 'number' },
	],
});
