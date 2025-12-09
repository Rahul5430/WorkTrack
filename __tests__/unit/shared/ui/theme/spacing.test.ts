// Spacing definitions are currently empty, but we test that the module exists
import * as spacingModule from '@/shared/ui/theme/spacing';

describe('spacing', () => {
	it('module exists and can be imported', () => {
		expect(spacingModule).toBeDefined();
	});
});
