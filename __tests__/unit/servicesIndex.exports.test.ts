describe('services index exports - explicit access', () => {
	it('exports firebase and utilities', () => {
		const mod = require('../../src/services');
		expect(mod.getFirebaseApp).toBeDefined();
		expect(mod.getFirestoreInstance).toBeDefined();
		expect(mod.ToastQueueService).toBeDefined();
		expect(mod.Errors).toBeDefined();
		expect(mod.Logging).toBeDefined();
	});
});
