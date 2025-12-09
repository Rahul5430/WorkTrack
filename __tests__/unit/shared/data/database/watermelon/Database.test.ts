// Test that Database module can be imported and exports are defined
// Note: Database instantiation requires SQLite which isn't available in Jest
describe('Database', () => {
	it('should export database module', () => {
		// Just verify the module file exists and can be imported
		// Actual database instantiation is tested in integration tests
		const dbModule = require('@/shared/data/database/watermelon/Database');
		expect(dbModule).toBeDefined();
	});
});
