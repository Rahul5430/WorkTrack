import { tableSchema } from '@nozbe/watermelondb';

export const sharedTrackerSchema = tableSchema({
	name: 'shared_trackers',
	columns: [
		{ name: 'tracker_id', type: 'string' },
		{ name: 'shared_with', type: 'string' },
		{ name: 'permission', type: 'string' },
		{ name: 'created_at', type: 'number' },
	],
});
