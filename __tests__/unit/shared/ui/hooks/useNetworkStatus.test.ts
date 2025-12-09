// Network status hook is currently empty, but we test that the module exists
const networkStatusModule = require('@/shared/ui/hooks/useNetworkStatus');

describe('useNetworkStatus', () => {
	it('module exists and can be imported', () => {
		expect(networkStatusModule).toBeDefined();
	});
});
