describe('Database Schemas', () => {
	it('imports and snapshots all schemas', () => {
		// Import all schema files
		const appSchema = require('../../src/db/watermelon/schema');
		const worktrackSchema = require('../../src/db/watermelon/worktrack/schema');

		// Test that schemas are defined
		expect(appSchema.default).toBeDefined();
		expect(worktrackSchema.workTrackSchema).toBeDefined();

		// Snapshot the schema structures
		expect(appSchema.default).toMatchSnapshot('app-schema');
		expect(worktrackSchema.workTrackSchema).toMatchSnapshot(
			'worktrack-schema'
		);
	});

	it('verifies schema table names', () => {
		const appSchema = require('../../src/db/watermelon/schema');

		// Test that the app schema contains expected table names
		expect(appSchema.default.tables).toBeDefined();
		expect(Array.isArray(appSchema.default.tables)).toBe(true);
		expect(appSchema.default.tables.length).toBeGreaterThan(0);

		// Check that tables have the expected structure
		const tableNames = appSchema.default.tables.map(
			(table: { name: string }) => table.name
		);
		expect(tableNames).toContain('work_tracks');
		expect(tableNames).toContain('trackers');
		expect(tableNames).toContain('shared_trackers');
	});

	it('verifies schema version', () => {
		const appSchema = require('../../src/db/watermelon/schema');

		// Test that schema has a version
		expect(appSchema.default.version).toBeDefined();
		expect(typeof appSchema.default.version).toBe('number');
		expect(appSchema.default.version).toBeGreaterThan(0);
	});
});
