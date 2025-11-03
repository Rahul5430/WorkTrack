// Test that navigation types module can be imported
// Types are compile-time only, but we can verify the module exists
describe('navigation/types', () => {
	it('should export navigation types module', () => {
		// Just verify the module can be imported
		const navigationTypes = require('@/app/navigation/types');
		expect(navigationTypes).toBeDefined();
	});
});
