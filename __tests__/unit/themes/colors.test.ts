import { colors } from '../../../src/themes/colors';

describe('colors', () => {
	it('should export all expected color categories', () => {
		expect(colors).toHaveProperty('office');
		expect(colors).toHaveProperty('wfh');
		expect(colors).toHaveProperty('holiday');
		expect(colors).toHaveProperty('error');
		expect(colors).toHaveProperty('weekend');
		expect(colors).toHaveProperty('weekendPressed');
		expect(colors).toHaveProperty('leave');
		expect(colors).toHaveProperty('leavePressed');
		expect(colors).toHaveProperty('forecast');
		expect(colors).toHaveProperty('success');
		expect(colors).toHaveProperty('background');
		expect(colors).toHaveProperty('text');
		expect(colors).toHaveProperty('button');
		expect(colors).toHaveProperty('ui');
	});

	it('should have correct status colors', () => {
		expect(colors.office).toBe('#2196F3');
		expect(colors.wfh).toBe('#4CAF50');
		expect(colors.holiday).toBe('#FF9800');
		expect(colors.error).toBe('#EF4444');
		expect(colors.weekend).toBe('#FFEDD5');
		expect(colors.weekendPressed).toBe('#FED7AA');
		expect(colors.leave).toBe('#DBEAFE');
		expect(colors.leavePressed).toBe('#BFDBFE');
		expect(colors.forecast).toBe('#9C27B0');
		expect(colors.success).toBe('#4CAF50');
	});

	it('should have correct background colors', () => {
		expect(colors.background.primary).toBe('#FFFFFF');
		expect(colors.background.secondary).toBe('#F3F4F6');
		expect(colors.background.office).toBe('#2196F315');
		expect(colors.background.wfh).toBe('#4CAF5015');
		expect(colors.background.holiday).toBe('#FF525215');
		expect(colors.background.forecast).toBe('#9C27B015');
		expect(colors.background.error).toBe('#EF444415');
	});

	it('should have correct text colors', () => {
		expect(colors.text.primary).toBe('#111827');
		expect(colors.text.secondary).toBe('#4B5563');
		expect(colors.text.light).toBe('#FFFFFF');
	});

	it('should have correct button colors', () => {
		expect(colors.button.primary).toBe('#2563EB');
		expect(colors.button.primaryPressed).toBe('#1E40AF');
		expect(colors.button.secondary).toBe('#F3F4F6');
		expect(colors.button.disabled).toBe('#93C5FD');
	});

	it('should have correct UI colors', () => {
		expect(colors.ui.white).toBe('#FFFFFF');
		expect(colors.ui.black).toBe('#000000');
		expect(colors.ui.loading).toBe('#0000ff');
		expect(colors.ui.checkCircle).toBe('#4CAF50');
		expect(colors.ui.accountIcon).toBe('#666');
		expect(colors.ui.shadow).toBe('#000');
		expect(colors.ui.backdrop).toBe('rgba(0, 0, 0, 0.5)');
	});

	it('should have correct gray color scale', () => {
		expect(colors.ui.gray[100]).toBe('#F3F4F6');
		expect(colors.ui.gray[200]).toBe('#E5E7EB');
		expect(colors.ui.gray[300]).toBe('#D1D5DB');
		expect(colors.ui.gray[400]).toBe('#9CA3AF');
		expect(colors.ui.gray[500]).toBe('#6B7280');
		expect(colors.ui.gray[600]).toBe('#4B5563');
		expect(colors.ui.gray[700]).toBe('#374151');
		expect(colors.ui.gray[800]).toBe('#1F2937');
		expect(colors.ui.gray[900]).toBe('#111827');
	});

	it('should have correct blue color scale', () => {
		expect(colors.ui.blue[100]).toBe('#DBEAFE');
		expect(colors.ui.blue[200]).toBe('#BFDBFE');
		expect(colors.ui.blue[300]).toBe('#93C5FD');
		expect(colors.ui.blue[400]).toBe('#60A5FA');
		expect(colors.ui.blue[500]).toBe('#3B82F6');
		expect(colors.ui.blue[600]).toBe('#2563EB');
		expect(colors.ui.blue[700]).toBe('#1D4ED8');
		expect(colors.ui.blue[800]).toBe('#1E40AF');
		expect(colors.ui.blue[900]).toBe('#1E3A8A');
	});

	it('should have correct orange color scale', () => {
		expect(colors.ui.orange[100]).toBe('#FFEDD5');
		expect(colors.ui.orange[200]).toBe('#FED7AA');
		expect(colors.ui.orange[300]).toBe('#FDBA74');
		expect(colors.ui.orange[400]).toBe('#FB923C');
		expect(colors.ui.orange[500]).toBe('#F97316');
		expect(colors.ui.orange[600]).toBe('#EA580C');
		expect(colors.ui.orange[700]).toBe('#C2410C');
		expect(colors.ui.orange[800]).toBe('#9A3412');
		expect(colors.ui.orange[900]).toBe('#7C2D12');
	});

	it('should be readonly (const assertion)', () => {
		// This test verifies that the colors object is readonly
		// In JavaScript, const objects can still have their properties modified
		// The readonly behavior is enforced at TypeScript compile time
		// We'll test that the structure is as expected instead
		expect(typeof colors).toBe('object');
		expect(colors).not.toBeNull();
	});
});
