// Test that migrations module can be imported
// Note: schemaMigrations returns a SchemaMigrations object
describe('migrations', () => {
	it('should export migrations object', () => {
		// Just verify the module can be imported
		const migrationsModule = require('@/shared/data/database/watermelon/migrations');
		expect(migrationsModule).toBeDefined();
		expect(migrationsModule.migrations).toBeDefined();
	});

	it('should have migrations property', () => {
		const {
			migrations,
		} = require('@/shared/data/database/watermelon/migrations');
		// SchemaMigrations object has migrations array
		expect(migrations).toBeDefined();
		if (migrations && typeof migrations === 'object') {
			// Verify it's an object (SchemaMigrations instance)
			expect(typeof migrations).toBe('object');
		}
	});
});
