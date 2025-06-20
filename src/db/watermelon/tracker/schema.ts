import { tableSchema } from '@nozbe/watermelondb';

export const trackerSchema = tableSchema({
	name: 'trackers',
	columns: [
		{ name: 'owner_id', type: 'string' },
		{ name: 'name', type: 'string' },
		{ name: 'color', type: 'string' },
		{ name: 'created_at', type: 'number' },
		{ name: 'is_default', type: 'boolean' },
		{ name: 'tracker_type', type: 'string' },
	],
});
