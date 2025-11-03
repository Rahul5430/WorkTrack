import { renderHook } from '@testing-library/react-native';
import { Platform, StatusBar } from 'react-native';

import { useResponsiveLayout } from '@/features/attendance/ui/hooks/useResponsiveLayout';

// Mock dependencies
const mockUseWindowDimensions = jest.fn();
const mockUseSafeAreaInsets = jest.fn();

jest.mock('react-native', () => ({
	Platform: {
		OS: 'ios',
	},
	StatusBar: {
		currentHeight: 0,
	},
	useWindowDimensions: () => mockUseWindowDimensions(),
}));

jest.mock('react-native-safe-area-context', () => ({
	useSafeAreaInsets: () => mockUseSafeAreaInsets(),
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
		mockUseSafeAreaInsets.mockReturnValue({
			top: 44,
			bottom: 0,
			left: 0,
			right: 0,
		});
	});

	it('should return basic dimensions and flags', () => {
		const { result } = renderHook(() => useResponsiveLayout());

		expect(result.current.width).toBe(375);
		expect(result.current.height).toBe(812);
		expect(result.current.isPortrait).toBe(true);
		expect(result.current.isLandscape).toBe(false);
		expect(result.current.isTablet).toBe(false);
		expect(result.current.isMobile).toBe(true);
	});

	it('should detect portrait orientation when height >= width', () => {
		mockUseWindowDimensions.mockReturnValue({
			width: 375,
			height: 812,
			scale: 2,
			fontScale: 2,
		});
		mockUseSafeAreaInsets.mockReturnValue({
			top: 44,
			bottom: 0,
			left: 0,
			right: 0,
		});

		const { result } = renderHook(() => useResponsiveLayout());

		expect(result.current.isPortrait).toBe(true);
		expect(result.current.isLandscape).toBe(false);
	});

	it('should detect landscape orientation when width > height', () => {
		mockUseWindowDimensions.mockReturnValue({
			width: 812,
			height: 375,
			scale: 2,
			fontScale: 2,
		});
		mockUseSafeAreaInsets.mockReturnValue({
			top: 0,
			bottom: 0,
			left: 0,
			right: 0,
		});

		const { result } = renderHook(() => useResponsiveLayout());

		expect(result.current.isPortrait).toBe(false);
		expect(result.current.isLandscape).toBe(true);
	});

	it('should detect tablet when width >= 768', () => {
		mockUseWindowDimensions.mockReturnValue({
			width: 768,
			height: 1024,
			scale: 2,
			fontScale: 2,
		});
		mockUseSafeAreaInsets.mockReturnValue({
			top: 0,
			bottom: 0,
			left: 0,
			right: 0,
		});

		const { result } = renderHook(() => useResponsiveLayout());

		expect(result.current.isTablet).toBe(true);
		expect(result.current.isMobile).toBe(false);
	});

	it('should detect mobile when width < 768', () => {
		mockUseWindowDimensions.mockReturnValue({
			width: 375,
			height: 812,
			scale: 2,
			fontScale: 2,
		});
		mockUseSafeAreaInsets.mockReturnValue({
			top: 44,
			bottom: 0,
			left: 0,
			right: 0,
		});

		const { result } = renderHook(() => useResponsiveLayout());

		expect(result.current.isMobile).toBe(true);
		expect(result.current.isTablet).toBe(false);
	});

	it('should calculate offset as 0 when not portrait', () => {
		mockUseWindowDimensions.mockReturnValue({
			width: 812,
			height: 375,
			scale: 2,
			fontScale: 2,
		});
		mockUseSafeAreaInsets.mockReturnValue({
			top: 44,
			bottom: 0,
			left: 0,
			right: 0,
		});

		const { result } = renderHook(() => useResponsiveLayout());

		expect(result.current.offset).toBe(0);
	});

	it('should use insets.top on iOS when portrait', () => {
		Platform.OS = 'ios';
		mockUseWindowDimensions.mockReturnValue({
			width: 375,
			height: 812,
			scale: 2,
			fontScale: 2,
		});
		mockUseSafeAreaInsets.mockReturnValue({
			top: 44,
			bottom: 0,
			left: 0,
			right: 0,
		});

		const { result } = renderHook(() => useResponsiveLayout());

		expect(result.current.offset).toBe(44);
	});

	it('should use default 78 on iOS when portrait and insets.top is 0', () => {
		Platform.OS = 'ios';
		mockUseWindowDimensions.mockReturnValue({
			width: 375,
			height: 812,
			scale: 2,
			fontScale: 2,
		});
		mockUseSafeAreaInsets.mockReturnValue({
			top: 0,
			bottom: 0,
			left: 0,
			right: 0,
		});

		const { result } = renderHook(() => useResponsiveLayout());

		expect(result.current.offset).toBe(78);
	});

	it('should use StatusBar.currentHeight on Android when portrait', () => {
		Platform.OS = 'android';
		StatusBar.currentHeight = 24;
		mockUseWindowDimensions.mockReturnValue({
			width: 375,
			height: 812,
			scale: 2,
			fontScale: 2,
		});
		mockUseSafeAreaInsets.mockReturnValue({
			top: 0,
			bottom: 0,
			left: 0,
			right: 0,
		});

		const { result } = renderHook(() => useResponsiveLayout());

		expect(result.current.offset).toBe(24);
	});

	it('should use 0 on Android when StatusBar.currentHeight is null', () => {
		Platform.OS = 'android';
		StatusBar.currentHeight = null as unknown as number | undefined;
		mockUseWindowDimensions.mockReturnValue({
			width: 375,
			height: 812,
			scale: 2,
			fontScale: 2,
		});
		mockUseSafeAreaInsets.mockReturnValue({
			top: 0,
			bottom: 0,
			left: 0,
			right: 0,
		});

		const { result } = renderHook(() => useResponsiveLayout());

		expect(result.current.offset).toBe(0);
	});

	it('should calculate deviceHeight correctly', () => {
		Platform.OS = 'ios';
		mockUseWindowDimensions.mockReturnValue({
			width: 375,
			height: 812,
			scale: 2,
			fontScale: 2,
		});
		mockUseSafeAreaInsets.mockReturnValue({
			top: 44,
			bottom: 0,
			left: 0,
			right: 0,
		});

		const { result } = renderHook(() => useResponsiveLayout());

		// deviceHeight = max(width, height) - offset
		// max(375, 812) = 812
		// offset = 44 (from insets.top on iOS in portrait mode, since height >= width)
		// deviceHeight = 812 - 44 = 768
		expect(result.current.deviceHeight).toBe(768);
	});

	it('should calculate RFPercentage correctly', () => {
		mockUseWindowDimensions.mockReturnValue({
			width: 375,
			height: 812,
			scale: 2,
			fontScale: 2,
		});
		mockUseSafeAreaInsets.mockReturnValue({
			top: 44,
			bottom: 0,
			left: 0,
			right: 0,
		});

		const { result } = renderHook(() => useResponsiveLayout());

		const percentage = result.current.RFPercentage(50);
		const expected = Math.round((50 * result.current.deviceHeight) / 100);
		expect(percentage).toBe(expected);
	});

	it('should calculate RFValue correctly with default baseHeight', () => {
		mockUseWindowDimensions.mockReturnValue({
			width: 375,
			height: 812,
			scale: 2,
			fontScale: 2,
		});
		mockUseSafeAreaInsets.mockReturnValue({
			top: 44,
			bottom: 0,
			left: 0,
			right: 0,
		});

		const { result } = renderHook(() => useResponsiveLayout());

		const fontSize = 16;
		const rfValue = result.current.RFValue(fontSize);
		const expected = Math.round(
			(fontSize * result.current.deviceHeight) / 680
		);
		expect(rfValue).toBe(expected);
	});

	it('should calculate RFValue correctly with custom baseHeight', () => {
		mockUseWindowDimensions.mockReturnValue({
			width: 375,
			height: 812,
			scale: 2,
			fontScale: 2,
		});
		mockUseSafeAreaInsets.mockReturnValue({
			top: 44,
			bottom: 0,
			left: 0,
			right: 0,
		});

		const { result } = renderHook(() => useResponsiveLayout());

		const fontSize = 16;
		const baseHeight = 800;
		const rfValue = result.current.RFValue(fontSize, baseHeight);
		const expected = Math.round(
			(fontSize * result.current.deviceHeight) / baseHeight
		);
		expect(rfValue).toBe(expected);
	});

	it('should return scaled size when getResponsiveSize called with one argument', () => {
		mockUseWindowDimensions.mockReturnValue({
			width: 375,
			height: 812,
			scale: 2,
			fontScale: 2,
		});
		mockUseSafeAreaInsets.mockReturnValue({
			top: 44,
			bottom: 0,
			left: 0,
			right: 0,
		});

		const { result } = renderHook(() => useResponsiveLayout());

		const size = result.current.getResponsiveSize(16);
		expect(typeof size).toBe('number');
		expect(size).toBe(result.current.RFValue(16));
	});

	it('should return object with width/height percentages when getResponsiveSize called with two arguments', () => {
		mockUseWindowDimensions.mockReturnValue({
			width: 375,
			height: 812,
			scale: 2,
			fontScale: 2,
		});
		mockUseSafeAreaInsets.mockReturnValue({
			top: 44,
			bottom: 0,
			left: 0,
			right: 0,
		});

		const { result } = renderHook(() => useResponsiveLayout());

		const size = result.current.getResponsiveSize(50, 30);
		expect(size).toEqual({
			width: (375 * 50) / 100,
			height: (812 * 30) / 100,
		});
	});

	it('should calculate getResponsiveMargin correctly', () => {
		mockUseWindowDimensions.mockReturnValue({
			width: 375,
			height: 812,
			scale: 2,
			fontScale: 2,
		});
		mockUseSafeAreaInsets.mockReturnValue({
			top: 44,
			bottom: 0,
			left: 0,
			right: 0,
		});

		const { result } = renderHook(() => useResponsiveLayout());

		const margin = result.current.getResponsiveMargin(10);
		const expected = Math.floor((375 * 10) / 100);
		expect(margin).toBe(expected);
	});

	it('should calculate autoScaleImage with requiredWidth only', () => {
		mockUseWindowDimensions.mockReturnValue({
			width: 375,
			height: 812,
			scale: 2,
			fontScale: 2,
		});
		mockUseSafeAreaInsets.mockReturnValue({
			top: 44,
			bottom: 0,
			left: 0,
			right: 0,
		});

		const { result } = renderHook(() => useResponsiveLayout());

		const scaled = result.current.autoScaleImage({
			imageWidth: 100,
			imageHeight: 50,
			requiredWidth: 200,
		});

		const aspectRatio = 100 / 50;
		expect(scaled).toEqual({
			width: 200,
			height: 200 / aspectRatio,
		});
	});

	it('should calculate autoScaleImage with requiredHeight only', () => {
		mockUseWindowDimensions.mockReturnValue({
			width: 375,
			height: 812,
			scale: 2,
			fontScale: 2,
		});
		mockUseSafeAreaInsets.mockReturnValue({
			top: 44,
			bottom: 0,
			left: 0,
			right: 0,
		});

		const { result } = renderHook(() => useResponsiveLayout());

		const scaled = result.current.autoScaleImage({
			imageWidth: 100,
			imageHeight: 50,
			requiredHeight: 100,
		});

		const aspectRatio = 100 / 50;
		expect(scaled).toEqual({
			width: 100 * aspectRatio,
			height: 100,
		});
	});

	it('should return original dimensions when neither requiredWidth nor requiredHeight provided', () => {
		mockUseWindowDimensions.mockReturnValue({
			width: 375,
			height: 812,
			scale: 2,
			fontScale: 2,
		});
		mockUseSafeAreaInsets.mockReturnValue({
			top: 44,
			bottom: 0,
			left: 0,
			right: 0,
		});

		const { result } = renderHook(() => useResponsiveLayout());

		const scaled = result.current.autoScaleImage({
			imageWidth: 100,
			imageHeight: 50,
		});

		expect(scaled).toEqual({
			width: 100,
			height: 50,
		});
	});

	it('should return original dimensions when both requiredWidth and requiredHeight provided', () => {
		mockUseWindowDimensions.mockReturnValue({
			width: 375,
			height: 812,
			scale: 2,
			fontScale: 2,
		});
		mockUseSafeAreaInsets.mockReturnValue({
			top: 44,
			bottom: 0,
			left: 0,
			right: 0,
		});

		const { result } = renderHook(() => useResponsiveLayout());

		const scaled = result.current.autoScaleImage({
			imageWidth: 100,
			imageHeight: 50,
			requiredWidth: 200,
			requiredHeight: 100,
		});

		expect(scaled).toEqual({
			width: 100,
			height: 50,
		});
	});

	it('should return original dimensions when requiredWidth is falsey and requiredHeight is provided', () => {
		mockUseWindowDimensions.mockReturnValue({
			width: 375,
			height: 812,
			scale: 2,
			fontScale: 2,
		});
		mockUseSafeAreaInsets.mockReturnValue({
			top: 44,
			bottom: 0,
			left: 0,
			right: 0,
		});

		const { result } = renderHook(() => useResponsiveLayout());

		const scaled = result.current.autoScaleImage({
			imageWidth: 100,
			imageHeight: 50,
			requiredWidth: 0,
			requiredHeight: 100,
		});

		// When requiredWidth is 0 (falsy), the condition `requiredWidth && !requiredHeight` is false
		// Then `requiredHeight && !requiredWidth` should be true since requiredWidth is 0 (falsy)
		// So it should scale based on requiredHeight: width = requiredHeight * aspectRatio
		const aspectRatio = 100 / 50; // 2
		expect(scaled).toEqual({
			width: 100 * aspectRatio, // 100 * 2 = 200
			height: 100,
		});
	});
});
