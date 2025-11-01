// migrated to V2 structure
import { useWindowDimensions } from 'react-native';

export const useResponsiveLayout = () => {
	const { width, height } = useWindowDimensions();

	const RFValue = (size: number) => {
		const baseWidth = 375; // iPhone X width
		const scale = width / baseWidth;
		return Math.round(size * scale);
	};

	const getResponsiveSize = (size: number) => {
		return RFValue(size);
	};

	const getResponsiveMargin = (margin: number) => {
		return RFValue(margin);
	};

	const isTablet = width >= 768;
	const isLandscape = width > height;

	return {
		RFValue,
		getResponsiveSize,
		getResponsiveMargin,
		isTablet,
		isLandscape,
		width,
		height,
	};
};
