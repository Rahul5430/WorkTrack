import { useMemo } from 'react';
import { Platform, StatusBar, useWindowDimensions } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const BASE_SCREEN_HEIGHT = 680;

export const useResponsiveLayout = () => {
	const { width, height } = useWindowDimensions();
	const insets = useSafeAreaInsets();

	const isPortrait = height >= width;
	const isTablet = width >= 768;
	const isMobile = width < 768;
	const isLandscape = width > height;

	const offset = useMemo(() => {
		if (!isPortrait) return 0;
		if (Platform.OS === 'ios') return insets.top || 78;
		return StatusBar.currentHeight ?? 0;
	}, [isPortrait, insets.top]);

	const deviceHeight = useMemo(() => {
		const standardLength = Math.max(width, height);
		return standardLength - offset;
	}, [height, width, offset]);

	const RFPercentage = (percent: number) =>
		Math.round((percent * deviceHeight) / 100);

	const RFValue = (fontSize: number, baseHeight = BASE_SCREEN_HEIGHT) =>
		Math.round((fontSize * deviceHeight) / baseHeight);

	const getResponsiveSize = (
		percentOrSize: number,
		percentHeight?: number
	) => {
		// If only one argument provided, return scaled size (for backward compatibility with current usage)
		if (percentHeight === undefined) {
			return RFValue(percentOrSize);
		}
		// If two arguments provided, return object with width/height percentages (V1 behavior)
		return {
			width: (width * percentOrSize) / 100,
			height: (height * percentHeight) / 100,
		};
	};

	const getResponsiveMargin = (marginPercent: number) =>
		Math.floor((width * marginPercent) / 100);

	const autoScaleImage = ({
		imageWidth,
		imageHeight,
		requiredWidth,
		requiredHeight,
	}: {
		imageWidth: number;
		imageHeight: number;
		requiredWidth?: number;
		requiredHeight?: number;
	}) => {
		const aspectRatio = imageWidth / imageHeight;

		if (requiredWidth && !requiredHeight) {
			return {
				width: requiredWidth,
				height: requiredWidth / aspectRatio,
			};
		}

		if (requiredHeight && !requiredWidth) {
			return {
				width: requiredHeight * aspectRatio,
				height: requiredHeight,
			};
		}

		// If neither or both are provided, return default
		return {
			width: imageWidth,
			height: imageHeight,
		};
	};

	return {
		width,
		height,
		isPortrait,
		isLandscape,
		isTablet,
		isMobile,
		offset,
		deviceHeight,
		RFPercentage,
		RFValue,
		getResponsiveSize,
		getResponsiveMargin,
		autoScaleImage,
	};
};
