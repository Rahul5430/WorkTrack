import React from 'react';
import { StyleSheet, Text, View, ViewProps } from 'react-native';

import { colors, fonts } from '../../themes';

interface ListItemProps extends ViewProps {
	title: string | React.ReactNode;
	description?: string;
	leftComponent?: React.ReactNode;
	rightComponent?: React.ReactNode;
}

const ListItem: React.FC<ListItemProps> = ({
	title,
	description,
	leftComponent,
	rightComponent,
	style,
	...props
}) => {
	return (
		<View style={[styles.container, style]} {...props}>
			{leftComponent && (
				<View style={styles.leftComponent}>{leftComponent}</View>
			)}
			<View style={styles.content}>
				{typeof title === 'string' ? (
					<Text style={styles.title}>{title}</Text>
				) : (
					title
				)}
				{description && (
					<Text style={styles.description}>{description}</Text>
				)}
			</View>
			{rightComponent && (
				<View style={styles.rightComponent}>{rightComponent}</View>
			)}
		</View>
	);
};

const styles = StyleSheet.create({
	container: {
		flexDirection: 'row',
		alignItems: 'center',
		backgroundColor: colors.background.primary,
	},
	leftComponent: {
		marginRight: 12,
	},
	content: {
		flex: 1,
	},
	title: {
		fontFamily: fonts.PoppinsMedium,
		fontSize: 16,
		color: colors.text.primary,
	},
	description: {
		fontFamily: fonts.PoppinsRegular,
		fontSize: 14,
		color: colors.text.secondary,
		marginTop: 2,
	},
	rightComponent: {
		marginLeft: 12,
	},
});

export default ListItem;
