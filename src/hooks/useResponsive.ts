// Temporary stub for migration - will be replaced with actual implementation
export const useResponsiveLayout = () => {
	return {
		RFValue: (size: number) => size,
		getResponsiveSize: (size: number) => ({ width: size, height: size }),
		getResponsiveMargin: (size: number) => size,
	};
};
