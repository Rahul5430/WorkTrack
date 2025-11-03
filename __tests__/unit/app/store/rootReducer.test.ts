// Test that rootReducer module can be imported
// Root reducer combines all feature reducers
describe('rootReducer', () => {
	it('should export rootReducer module', () => {
		// Just verify the module can be imported
		const rootReducer = require('@/app/store/rootReducer');
		expect(rootReducer).toBeDefined();
	});
});
