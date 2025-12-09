// Theme object is currently minimal, but we test that the module exists
// Use require to allow loading files with no exports

const themeModule = require('@/shared/ui/theme/theme');

describe('theme', () => {
	it('module exists and can be imported', () => {
		expect(themeModule).toBeDefined();
	});
});
