describe('use-cases index exports access', () => {
	it('exposes the module', () => {
		const mod = require('../../src/use-cases');
		expect(mod).toBeDefined();
	});
});
