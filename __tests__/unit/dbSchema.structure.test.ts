describe('db/watermelon/schema structure', () => {
	it('contains expected tables and columns', () => {
		const schema = require('../../src/db/watermelon/schema').default;
		expect(schema.version).toBeGreaterThanOrEqual(1);
		const tables = schema.tables as Array<Record<string, unknown>>;
		const tableNames = tables.map((t) => (t as { name: string }).name);
		expect(tableNames).toEqual(
			expect.arrayContaining([
				'work_tracks',
				'trackers',
				'shared_trackers',
			])
		);
		const trackers = tables.find(
			(t) => (t as { name: string }).name === 'trackers'
		) as { columns: Array<{ name: string }> };
		expect(trackers.columns.map((c) => c.name)).toEqual(
			expect.arrayContaining([
				'owner_id',
				'name',
				'color',
				'created_at',
				'is_default',
				'tracker_type',
			])
		);
		expect(schema).toMatchSnapshot({ version: expect.any(Number) });
	});
});
