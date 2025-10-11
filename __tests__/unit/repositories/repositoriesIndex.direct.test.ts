describe('repositories/index.ts direct import', () => {
	it('imports and accesses all exports', () => {
		const repositories = require('../../../src/repositories/index.ts');

		// Test that all expected exports are available
		expect(repositories.FirebaseEntryRepository).toBeDefined();
		expect(repositories.FirebaseShareRepository).toBeDefined();
		expect(repositories.FirebaseTrackerRepository).toBeDefined();
		expect(repositories.WatermelonEntryRepository).toBeDefined();
		expect(repositories.WatermelonTrackerRepository).toBeDefined();

		// Access properties to ensure coverage
		expect(typeof repositories.FirebaseEntryRepository).toBe('function');
		expect(typeof repositories.FirebaseShareRepository).toBe('function');
		expect(typeof repositories.FirebaseTrackerRepository).toBe('function');
		expect(typeof repositories.WatermelonEntryRepository).toBe('function');
		expect(typeof repositories.WatermelonTrackerRepository).toBe(
			'function'
		);
	});
});
