import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';

import { fonts } from '../../themes';
import { colors } from '../../themes/colors';

interface ScreenHeaderProps {
	title: string;
	onBackPress: () => void;
	rightComponent?: React.ReactNode;
}

const ScreenHeader: React.FC<ScreenHeaderProps> = ({
	title,
	onBackPress,
	rightComponent,
}) => {
	return (
		<View style={styles.header}>
			<TouchableOpacity
				onPress={onBackPress}
				style={styles.backButton}
				hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
				testID='back-button'
			>
				<MaterialCommunityIcons
					name='chevron-left'
					size={28}
					color={colors.text.primary}
				/>
			</TouchableOpacity>
			<Text style={styles.headerTitle}>{title}</Text>
			<View style={styles.headerRight}>{rightComponent}</View>
		</View>
	);
};

const styles = StyleSheet.create({
	header: {
		flexDirection: 'row',
		alignItems: 'center',
		justifyContent: 'space-between',
		height: 44,
		paddingHorizontal: 16,
		backgroundColor: colors.background.primary,
		borderBottomWidth: StyleSheet.hairlineWidth,
		borderBottomColor: colors.background.secondary,
	},
	backButton: {
		width: 44,
		height: 44,
		alignItems: 'center',
		justifyContent: 'center',
		marginLeft: -8,
		zIndex: 1,
	},
	headerTitle: {
		fontFamily: fonts.PoppinsSemiBold,
		fontSize: 23,
		color: colors.text.primary,
		textAlign: 'center',
		position: 'absolute',
		left: 0,
		right: 0,
	},
	headerRight: {
		width: 44,
		alignItems: 'flex-end',
	},
});

export default ScreenHeader;
