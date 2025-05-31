import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

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
			<TouchableOpacity onPress={onBackPress} style={styles.backButton}>
				<View style={styles.backIcon} />
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
		width: 40,
		height: 40,
		alignItems: 'center',
		justifyContent: 'center',
		marginLeft: -8,
	},
	backIcon: {
		width: 12,
		height: 12,
		borderLeftWidth: 2,
		borderBottomWidth: 2,
		borderColor: colors.office,
		transform: [{ rotate: '45deg' }],
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
		width: 40,
		alignItems: 'flex-end',
	},
});

export default ScreenHeader;
