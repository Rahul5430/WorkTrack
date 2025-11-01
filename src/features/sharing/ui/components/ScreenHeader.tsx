// migrated to V2 structure
import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';

import { useResponsiveLayout } from '@/shared/ui/hooks/useResponsive';
import { colors, fonts } from '@/shared/ui/theme';

interface ScreenHeaderProps {
	title: string;
	onBackPress?: () => void;
	rightComponent?: React.ReactNode;
}

const ScreenHeader: React.FC<ScreenHeaderProps> = ({
	title,
	onBackPress,
	rightComponent,
}) => {
	const { RFValue } = useResponsiveLayout();

	return (
		<View style={styles.container}>
			<View style={styles.leftContainer}>
				{onBackPress && (
					<Pressable
						style={({ pressed }) => [
							styles.backButton,
							{ opacity: pressed ? 0.7 : 1 },
						]}
						onPress={onBackPress}
					>
						<MaterialCommunityIcons
							name='arrow-left'
							size={24}
							color={colors.text.primary}
						/>
					</Pressable>
				)}
				<Text style={[styles.title, { fontSize: RFValue(18) }]}>
					{title}
				</Text>
			</View>
			{rightComponent && (
				<View style={styles.rightContainer}>{rightComponent}</View>
			)}
		</View>
	);
};

const styles = StyleSheet.create({
	container: {
		flexDirection: 'row',
		alignItems: 'center',
		justifyContent: 'space-between',
		paddingHorizontal: 20,
		paddingVertical: 16,
		backgroundColor: colors.background.primary,
		borderBottomWidth: 1,
		borderBottomColor: colors.ui.gray[200],
	},
	leftContainer: {
		flexDirection: 'row',
		alignItems: 'center',
		flex: 1,
	},
	backButton: {
		marginRight: 12,
		padding: 4,
	},
	title: {
		fontFamily: fonts.PoppinsSemiBold,
		color: colors.text.primary,
	},
	rightContainer: {
		alignItems: 'center',
		justifyContent: 'center',
	},
});

export default ScreenHeader;
