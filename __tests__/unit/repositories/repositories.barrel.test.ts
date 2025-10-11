describe('barrel exports', () => {
	it('repositories/index exports exist', () => {
		const mod = require('../../../src/repositories');
		expect(mod).toBeDefined();
	});
	it('services/index exports exist', () => {
		const mod = require('../../../src/services');
		expect(mod).toBeDefined();
		expect(mod.getFirestoreInstance).toBeDefined();
		expect(mod.ToastQueueService).toBeDefined();
	});
	it('use-cases/index exports exist', () => {
		const mod = require('../../../src/use-cases');
		expect(mod).toBeDefined();
	});
});
