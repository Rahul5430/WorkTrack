describe('Index exports smoke', () => {
	it('repositories/index exports defined members', () => {
		const repoIndex = require('../../src/repositories');
		expect(repoIndex).toBeDefined();
	});
	it('services/index exports defined members', () => {
		const services = require('../../src/services');
		expect(services).toBeDefined();
	});
	it('use-cases/index exports defined members', () => {
		const usecases = require('../../src/use-cases');
		expect(usecases).toBeDefined();
	});
	it('db/watermelon/schema exports defined schema', () => {
		const schema = require('../../src/db/watermelon/schema');
		expect(schema).toBeDefined();
	});
});
