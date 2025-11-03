import { schema } from '@/shared/data/database/watermelon/schema';

describe('schema', () => {
	it('should export schema object', () => {
		expect(schema).toBeDefined();
		expect(schema.version).toBeDefined();
		expect(typeof schema.version).toBe('number');
	});

	it('should have version 2', () => {
		expect(schema.version).toBe(2);
	});

	it('should have tables array', () => {
		expect(schema.tables).toBeDefined();
		expect(Array.isArray(schema.tables)).toBe(true);
		expect(schema.tables.length).toBeGreaterThan(0);
	});

	it('should have work_entries table', () => {
		const tablesArray = Array.isArray(schema.tables)
			? schema.tables
			: Object.values(schema.tables);
		const workEntriesTable = tablesArray.find(
			(t: { name: string }) => t.name === 'work_entries'
		);
		expect(workEntriesTable).toBeDefined();
		if (workEntriesTable) {
			expect(workEntriesTable.columns).toBeDefined();
			// columnArray may or may not exist depending on WatermelonDB version
			if ('columnArray' in workEntriesTable) {
				expect(Array.isArray(workEntriesTable.columnArray)).toBe(true);
			}
		}
	});

	it('should have trackers table', () => {
		const tablesArray = Array.isArray(schema.tables)
			? schema.tables
			: Object.values(schema.tables);
		const trackersTable = tablesArray.find(
			(t: { name: string }) => t.name === 'trackers'
		);
		expect(trackersTable).toBeDefined();
		if (trackersTable) {
			expect(trackersTable.columns).toBeDefined();
		}
	});

	it('should have users table', () => {
		const tablesArray = Array.isArray(schema.tables)
			? schema.tables
			: Object.values(schema.tables);
		const usersTable = tablesArray.find(
			(t: { name: string }) => t.name === 'users'
		);
		expect(usersTable).toBeDefined();
		if (usersTable) {
			expect(usersTable.columns).toBeDefined();
		}
	});

	it('should have shares table', () => {
		const tablesArray = Array.isArray(schema.tables)
			? schema.tables
			: Object.values(schema.tables);
		const sharesTable = tablesArray.find(
			(t: { name: string }) => t.name === 'shares'
		);
		expect(sharesTable).toBeDefined();
		if (sharesTable) {
			expect(sharesTable.columns).toBeDefined();
		}
	});

	it('should have sync_queue table', () => {
		const tablesArray = Array.isArray(schema.tables)
			? schema.tables
			: Object.values(schema.tables);
		const syncQueueTable = tablesArray.find(
			(t: { name: string }) => t.name === 'sync_queue'
		);
		expect(syncQueueTable).toBeDefined();
		if (syncQueueTable) {
			expect(syncQueueTable.columns).toBeDefined();
		}
	});
});
