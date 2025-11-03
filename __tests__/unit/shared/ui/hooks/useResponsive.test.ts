import { renderHook } from '@testing-library/react-native';

import { useResponsiveLayout } from '@/shared/ui/hooks/useResponsive';

// Mock useWindowDimensions
const mockUseWindowDimensions = jest.fn();

jest.mock('react-native', () => ({
	useWindowDimensions: () => mockUseWindowDimensions(),
}));

describe('useResponsiveLayout', () => {
	beforeEach(() => {
		jest.clearAllMocks();
		mockUseWindowDimensions.mockReturnValue({
			width: 375,
			height: 812,
			scale: 2,
			fontScale: 2,
		});
	});

	it('should return all required functions and properties', () => {
		const { result } = renderHook(() => useResponsiveLayout());

		expect(result.current.RFValue).toBeDefined();
		expect(result.current.getResponsiveSize).toBeDefined();
		expect(result.current.getResponsiveMargin).toBeDefined();
		expect(result.current.isTablet).toBeDefined();
		expect(result.current.isLandscape).toBeDefined();
		expect(result.current.width).toBeDefined();
		expect(result.current.height).toBeDefined();
	});

	it('should return correct dimensions', () => {
		mockUseWindowDimensions.mockReturnValue({
			width: 375,
			height: 812,
		});

		const { result } = renderHook(() => useResponsiveLayout());

		expect(result.current.width).toBe(375);
		expect(result.current.height).toBe(812);
	});

	it('should calculate RFValue correctly', () => {
		mockUseWindowDimensions.mockReturnValue({
			width: 375,
			height: 812,
		});

		const { result } = renderHook(() => useResponsiveLayout());

		expect(result.current.RFValue(20)).toBe(20);
	});

	it('should scale RFValue when width differs from base', () => {
		mockUseWindowDimensions.mockReturnValue({
			width: 750, // 2x the base width
			height: 812,
		});

		const { result } = renderHook(() => useResponsiveLayout());

		expect(result.current.RFValue(20)).toBe(40);
	});

	it('should use RFValue for getResponsiveSize', () => {
		mockUseWindowDimensions.mockReturnValue({
			width: 375,
			height: 812,
		});

		const { result } = renderHook(() => useResponsiveLayout());

		const size = result.current.getResponsiveSize(20);
		const expectedSize = result.current.RFValue(20);
		expect(size).toBe(expectedSize);
	});

	it('should use RFValue for getResponsiveMargin', () => {
		mockUseWindowDimensions.mockReturnValue({
			width: 375,
			height: 812,
		});

		const { result } = renderHook(() => useResponsiveLayout());

		const margin = result.current.getResponsiveMargin(20);
		const expectedMargin = result.current.RFValue(20);
		expect(margin).toBe(expectedMargin);
	});

	it('should detect tablet when width >= 768', () => {
		mockUseWindowDimensions.mockReturnValue({
			width: 768,
			height: 1024,
		});

		const { result } = renderHook(() => useResponsiveLayout());

		expect(result.current.isTablet).toBe(true);
	});

	it('should not detect tablet when width < 768', () => {
		mockUseWindowDimensions.mockReturnValue({
			width: 767,
			height: 1024,
		});

		const { result } = renderHook(() => useResponsiveLayout());

		expect(result.current.isTablet).toBe(false);
	});

	it('should detect landscape when width > height', () => {
		mockUseWindowDimensions.mockReturnValue({
			width: 812,
			height: 375,
		});

		const { result } = renderHook(() => useResponsiveLayout());

		expect(result.current.isLandscape).toBe(true);
	});

	it('should not detect landscape when width <= height', () => {
		mockUseWindowDimensions.mockReturnValue({
			width: 375,
			height: 812,
		});

		const { result } = renderHook(() => useResponsiveLayout());

		expect(result.current.isLandscape).toBe(false);
	});

	it('should handle edge case when width equals height', () => {
		mockUseWindowDimensions.mockReturnValue({
			width: 500,
			height: 500,
		});

		const { result } = renderHook(() => useResponsiveLayout());

		expect(result.current.isLandscape).toBe(false);
	});

	it('should round RFValue results', () => {
		mockUseWindowDimensions.mockReturnValue({
			width: 450, // 1.2x the base width
			height: 812,
		});

		const { result } = renderHook(() => useResponsiveLayout());

		// 20 * 1.2 = 24 (should be rounded)
		expect(result.current.RFValue(20)).toBe(24);
	});
});
