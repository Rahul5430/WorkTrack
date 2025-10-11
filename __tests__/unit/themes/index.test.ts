import { fonts } from '../../../src/themes';
import * as colors from '../../../src/themes/colors';

describe('themes/index', () => {
	it('should export fonts object', () => {
		expect(fonts).toBeDefined();
		expect(typeof fonts).toBe('object');
	});

	it('should have all expected font properties', () => {
		expect(fonts.PoppinsBold).toBeDefined();
		expect(fonts.PoppinsMedium).toBeDefined();
		expect(fonts.PoppinsRegular).toBeDefined();
		expect(fonts.PoppinsSemiBold).toBeDefined();
	});

	it('should have correct font values', () => {
		expect(fonts.PoppinsBold).toBe('Poppins-Bold');
		expect(fonts.PoppinsMedium).toBe('Poppins-Medium');
		expect(fonts.PoppinsRegular).toBe('Poppins-Regular');
		expect(fonts.PoppinsSemiBold).toBe('Poppins-SemiBold');
	});

	it('should export all color properties', () => {
		expect(colors.colors).toBeDefined();
		expect(colors.colors.office).toBeDefined();
		expect(colors.colors.wfh).toBeDefined();
		expect(colors.colors.holiday).toBeDefined();
		expect(colors.colors.error).toBeDefined();
		expect(colors.colors.background).toBeDefined();
		expect(colors.colors.text).toBeDefined();
		expect(colors.colors.button).toBeDefined();
		expect(colors.colors.ui).toBeDefined();
	});

	it('should export colors as a named export', () => {
		expect(colors.colors).toBeDefined();
		expect(typeof colors.colors).toBe('object');
	});

	it('should have consistent font structure', () => {
		// Test that all fonts follow the expected naming pattern
		const fontNames = Object.keys(fonts);
		expect(fontNames).toHaveLength(4);
		expect(fontNames).toContain('PoppinsBold');
		expect(fontNames).toContain('PoppinsMedium');
		expect(fontNames).toContain('PoppinsRegular');
		expect(fontNames).toContain('PoppinsSemiBold');
	});
});
