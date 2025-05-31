import { schemaMigrations } from '@nozbe/watermelondb/Schema/migrations';

export default schemaMigrations({
	migrations: [
		{
			toVersion: 2,
			steps: [
				{
					type: 'add_columns',
					table: 'sharing',
					columns: [{ name: 'shared_with_email', type: 'string' }],
				},
			],
		},
	],
});
