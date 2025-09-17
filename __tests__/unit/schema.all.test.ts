describe('All schemas load and snapshot', () => {
	it('loads main app schema and matches snapshot', () => {
		const schema = require('../../src/db/watermelon/schema').default;
		expect(schema.tables.length).toBeGreaterThan(0);
		expect(schema).toMatchSnapshot({ version: expect.any(Number) });
	});
});
