describe('db/watermelon/schema.ts direct import', () => {
	it('imports and accesses schema', () => {
		const schema = require('../../../src/db/watermelon/schema');

		// Test that schema is defined and has expected structure
		expect(schema.default).toBeDefined();
		expect(schema.default.version).toBe(4);
		expect(schema.default.tables).toBeDefined();
		expect(Array.isArray(schema.default.tables)).toBe(true);
		expect(schema.default.tables.length).toBeGreaterThan(0);
	});
});
