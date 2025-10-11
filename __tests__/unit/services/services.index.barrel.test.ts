describe('barrels import direct', () => {
	it('repositories barrel direct import', () => {
		const repositories = require('../../../src/repositories');
		expect(repositories).toBeDefined();
	});
	it('services barrel direct import', () => {
		const services = require('../../../src/services');
		expect(services).toBeDefined();
	});
	it('use-cases barrel direct import', () => {
		const useCases = require('../../../src/use-cases');
		expect(useCases).toBeDefined();
	});
});
