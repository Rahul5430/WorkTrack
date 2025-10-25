// migrated to V2 structure
import { schemaMigrations } from '@nozbe/watermelondb/Schema/migrations';

export const migrations = schemaMigrations({
	migrations: [
		// Version 1: Initial schema
		// No migrations needed for version 1 as it's the initial schema
		// Future migrations can be added here:
		// {
		//   toVersion: 2,
		//   steps: [
		//     addColumns({
		//       table: 'work_entries',
		//       columns: [
		//         { name: 'new_field', type: 'string', isOptional: true },
		//       ],
		//     }),
		//   ],
		// },
	],
});

export type DatabaseMigrations = typeof migrations;
