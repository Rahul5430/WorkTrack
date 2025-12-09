// migrated to V2 structure
import MaterialDesignIcons from '@react-native-vector-icons/material-design-icons';
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { useResponsiveLayout } from '@/shared/ui/hooks/useResponsive';
import { colors, fonts } from '@/shared/ui/theme';

interface OfflineIndicatorProps {
	isVisible?: boolean;
}

const OfflineIndicator: React.FC<OfflineIndicatorProps> = ({
	isVisible = false,
}) => {
	const { RFValue } = useResponsiveLayout();

	if (!isVisible) {
		return null;
	}

	return (
		<View style={styles.container}>
			<MaterialDesignIcons
				name='wifi-off'
				size={16}
				color={colors.text.light}
			/>
			<Text style={[styles.text, { fontSize: RFValue(12) }]}>
				You&apos;re offline
			</Text>
		</View>
	);
};

const styles = StyleSheet.create({
	container: {
		flexDirection: 'row',
		alignItems: 'center',
		backgroundColor: colors.error,
		paddingHorizontal: 12,
		paddingVertical: 8,
		borderRadius: 6,
		gap: 6,
	},
	text: {
		fontFamily: fonts.PoppinsMedium,
		color: colors.text.light,
	},
});

export default OfflineIndicator;
