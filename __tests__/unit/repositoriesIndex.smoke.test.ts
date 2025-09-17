describe('repositories index smoke with access', () => {
	it('accesses each export to count coverage', () => {
		const mod = require('../../src/repositories');
		expect(mod.FirebaseEntryRepository).toBeDefined();
		expect(mod.FirebaseShareRepository).toBeDefined();
		expect(mod.FirebaseTrackerRepository).toBeDefined();
		expect(mod.WatermelonEntryRepository).toBeDefined();
		expect(mod.WatermelonTrackerRepository).toBeDefined();
	});
});
