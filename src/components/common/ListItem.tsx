import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { fonts } from '../../themes';
import { colors } from '../../themes/colors';

interface ListItemProps {
	title: string;
	description?: string;
	rightComponent?: React.ReactNode;
}

const ListItem: React.FC<ListItemProps> = ({
	title,
	description,
	rightComponent,
}) => {
	return (
		<View style={styles.listItem}>
			<View style={styles.listItemContent}>
				<Text style={styles.listItemTitle}>{title}</Text>
				{description && (
					<Text style={styles.listItemDescription}>
						{description}
					</Text>
				)}
			</View>
			{rightComponent && (
				<View style={styles.listItemActions}>{rightComponent}</View>
			)}
		</View>
	);
};

const styles = StyleSheet.create({
	listItem: {
		flexDirection: 'row',
		alignItems: 'center',
		justifyContent: 'space-between',
		paddingVertical: 12,
		borderBottomWidth: 1,
		borderBottomColor: colors.background.secondary,
	},
	listItemContent: {
		flex: 1,
	},
	listItemTitle: {
		fontFamily: fonts.PoppinsMedium,
		fontSize: 16,
		color: colors.text.primary,
	},
	listItemDescription: {
		fontFamily: fonts.PoppinsRegular,
		fontSize: 14,
		color: colors.text.secondary,
		marginTop: 2,
	},
	listItemActions: {
		flexDirection: 'row',
		alignItems: 'center',
	},
});

export default ListItem;
