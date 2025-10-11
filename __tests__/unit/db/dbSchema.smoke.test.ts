describe('db/watermelon modules smoke', () => {
	it('schema.ts loads without crashing', () => {
		const schema = require('../../../src/db/watermelon/schema');
		expect(schema).toBeDefined();
	});
	it('db index loads', () => {
		const dbIndex = require('../../../src/db/watermelon');
		expect(dbIndex).toBeDefined();
	});
	it('worktrack model loads', () => {
		const model = require('../../../src/db/watermelon/worktrack/model');
		expect(model).toBeDefined();
	});
});
