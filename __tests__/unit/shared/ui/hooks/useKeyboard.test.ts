// Keyboard hook is currently empty, but we test that the module exists
import * as useKeyboardModule from '@/shared/ui/hooks/useKeyboard';

describe('useKeyboard', () => {
	it('module exists and can be imported', () => {
		expect(useKeyboardModule).toBeDefined();
	});
});
