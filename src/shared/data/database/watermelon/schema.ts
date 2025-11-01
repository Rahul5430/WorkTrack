// migrated to V2 structure
import { appSchema, tableSchema } from '@nozbe/watermelondb';

export const schema = appSchema({
	version: 2,
	tables: [
		// WorkEntry table for tracking work status
		tableSchema({
			name: 'work_entries',
			columns: [
				{ name: 'date', type: 'string', isIndexed: true },
				{ name: 'status', type: 'string' },
				{ name: 'is_advisory', type: 'boolean' },
				{ name: 'notes', type: 'string', isOptional: true },
				{ name: 'created_at', type: 'number' },
				{ name: 'updated_at', type: 'number' },
				{ name: 'user_id', type: 'string', isIndexed: true },
				{ name: 'tracker_id', type: 'string', isIndexed: true },
				{ name: 'sync_status', type: 'string', isOptional: true },
				{ name: 'last_synced_at', type: 'number', isOptional: true },
			],
		}),
		// Tracker table for work trackers
		tableSchema({
			name: 'trackers',
			columns: [
				{ name: 'name', type: 'string' },
				{ name: 'description', type: 'string', isOptional: true },
				{ name: 'is_active', type: 'boolean' },
				{ name: 'created_at', type: 'number' },
				{ name: 'updated_at', type: 'number' },
				{ name: 'user_id', type: 'string', isIndexed: true },
				{ name: 'sync_status', type: 'string', isOptional: true },
				{ name: 'last_synced_at', type: 'number', isOptional: true },
			],
		}),
		// User table for user information
		tableSchema({
			name: 'users',
			columns: [
				{ name: 'email', type: 'string', isIndexed: true },
				{ name: 'name', type: 'string' },
				{ name: 'photo_url', type: 'string', isOptional: true },
				{ name: 'is_active', type: 'boolean' },
				{ name: 'created_at', type: 'number' },
				{ name: 'updated_at', type: 'number' },
				{ name: 'sync_status', type: 'string', isOptional: true },
				{ name: 'last_synced_at', type: 'number', isOptional: true },
			],
		}),
		// Share table for sharing trackers
		tableSchema({
			name: 'shares',
			columns: [
				{ name: 'tracker_id', type: 'string', isIndexed: true },
				{
					name: 'shared_with_user_id',
					type: 'string',
					isIndexed: true,
				},
				{ name: 'permission', type: 'string' }, // 'read' or 'write'
				{ name: 'is_active', type: 'boolean' },
				{ name: 'created_at', type: 'number' },
				{ name: 'updated_at', type: 'number' },
				{ name: 'created_by_user_id', type: 'string', isIndexed: true },
				{ name: 'sync_status', type: 'string', isOptional: true },
				{ name: 'last_synced_at', type: 'number', isOptional: true },
			],
		}),
		// SyncQueue table for managing sync operations
		tableSchema({
			name: 'sync_queue',
			columns: [
				{ name: 'operation', type: 'string' }, // 'create', 'update', 'delete'
				{ name: 'table_name', type: 'string' },
				{ name: 'record_id', type: 'string' },
				{ name: 'data', type: 'string' }, // JSON string of the data
				{ name: 'status', type: 'string' }, // 'pending', 'syncing', 'completed', 'failed'
				{ name: 'retry_count', type: 'number' },
				{ name: 'max_retries', type: 'number' },
				{ name: 'error_message', type: 'string', isOptional: true },
				{ name: 'created_at', type: 'number' },
				{ name: 'updated_at', type: 'number' },
				{ name: 'next_retry_at', type: 'number', isOptional: true },
				{ name: 'attempt_count', type: 'number', isOptional: true },
			],
		}),
	],
});

export type DatabaseSchema = typeof schema;
