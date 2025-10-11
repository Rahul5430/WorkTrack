describe('barrels direct index imports', () => {
	it('repositories/index.ts exports are defined', () => {
		const mod = require('../../../src/repositories/index.ts');
		expect(mod.FirebaseEntryRepository).toBeDefined();
		expect(mod.FirebaseShareRepository).toBeDefined();
		expect(mod.FirebaseTrackerRepository).toBeDefined();
		expect(mod.WatermelonEntryRepository).toBeDefined();
		expect(mod.WatermelonTrackerRepository).toBeDefined();
	});
	it('services/index.ts exports are defined', () => {
		const mod = require('../../../src/services/index.ts');
		expect(mod.getFirebaseApp).toBeDefined();
		expect(mod.getFirestoreInstance).toBeDefined();
		expect(mod.ToastQueueService).toBeDefined();
		expect(mod.Errors).toBeDefined();
		expect(mod.Logging).toBeDefined();
	});
	it('use-cases/index.ts exports are defined', () => {
		const mod = require('../../../src/use-cases/index.ts');
		expect(mod).toBeDefined();
	});
});
