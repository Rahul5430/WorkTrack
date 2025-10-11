describe('services/index.ts direct import', () => {
	it('imports and accesses all exports', () => {
		const services = require('../../../src/services/index.ts');

		// Test that all expected exports are available
		expect(services.getFirebaseApp).toBeDefined();
		expect(services.getFirestoreInstance).toBeDefined();
		expect(services.ToastQueueService).toBeDefined();
		expect(services.Errors).toBeDefined();
		expect(services.Logging).toBeDefined();

		// Access properties to ensure coverage
		expect(typeof services.getFirebaseApp).toBe('function');
		expect(typeof services.getFirestoreInstance).toBe('function');
		expect(typeof services.ToastQueueService).toBe('function');
		expect(typeof services.Errors).toBe('object');
		expect(typeof services.Logging).toBe('object');
	});
});
