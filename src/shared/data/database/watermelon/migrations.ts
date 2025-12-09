// migrated to V2 structure
import {
	addColumns,
	schemaMigrations,
} from '@nozbe/watermelondb/Schema/migrations';

export const migrations = schemaMigrations({
	migrations: [
		// Version 1: Initial schema
		// No migrations needed for version 1 as it's the initial schema
		// Future migrations can be added here:
		{
			toVersion: 2,
			steps: [
				addColumns({
					table: 'sync_queue',
					columns: [
						{
							name: 'attempt_count',
							type: 'number',
							isOptional: true,
						},
						{
							name: 'next_retry_at',
							type: 'number',
							isOptional: true,
						},
					],
				}),
			],
		},
	],
});

export type DatabaseMigrations = typeof migrations;
