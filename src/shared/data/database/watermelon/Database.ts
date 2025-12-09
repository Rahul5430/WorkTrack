// migrated to V2 structure
import { Database } from '@nozbe/watermelondb';
import SQLiteAdapter from '@nozbe/watermelondb/adapters/sqlite';

// Import models
import TrackerModel from '@/features/attendance/data/models/TrackerModel';
import WorkEntryModel from '@/features/attendance/data/models/WorkEntryModel';
import User from '@/features/auth/data/models/UserModel';
import ShareModel from '@/features/sharing/data/models/ShareModel';
import SyncOperationModel from '@/features/sync/data/models/SyncOperationModel';

import { migrations } from './migrations';
import { schema } from './schema';

// Create SQLite adapter
const adapter = new SQLiteAdapter({
	schema,
	migrations,
	// Enable JSI for better performance on React Native
	jsi: true,
	// Enable FTS (Full Text Search) for better search capabilities
	onSetUpError: (_error) => {
		// console.error('Database setup error:', error);
	},
});

// Create database instance
export const database = new Database({
	adapter,
	modelClasses: [
		WorkEntryModel,
		TrackerModel,
		User,
		ShareModel,
		SyncOperationModel,
	],
});

// Export database instance as default
export default database;

// Export types for use in other modules
export type { DatabaseMigrations } from './migrations';
export type { DatabaseSchema } from './schema';
export type { Database } from '@nozbe/watermelondb';
