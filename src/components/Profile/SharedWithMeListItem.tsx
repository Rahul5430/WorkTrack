import React from 'react';
import { Image, StyleSheet, Switch, Text, View } from 'react-native';

import { SharePermission } from '../../services/sync';
import { fonts } from '../../themes';
import { colors } from '../../themes/colors';
import ListItem from '../common/ListItem';

interface SharedWithMeListItemProps {
	share: SharePermission;
	onSetDefaultView: (userId: string) => void;
	isDefaultView: boolean;
	isHighlighted?: boolean;
}

const SharedWithMeListItem: React.FC<SharedWithMeListItemProps> = ({
	share,
	onSetDefaultView,
	isDefaultView,
	isHighlighted,
}) => {
	return (
		<ListItem
			key={share.ownerId}
			title={
				<View style={styles.titleContainer}>
					<Text style={styles.titleText}>
						{share.ownerName ?? share.sharedWithEmail}
					</Text>
					<View
						style={[
							styles.permissionBadge,
							share.permission === 'write'
								? styles.writeBadge
								: styles.readBadge,
						]}
					>
						<Text style={styles.permissionBadgeText}>
							{share.permission === 'write' ? 'Write' : 'Read'}
						</Text>
					</View>
				</View>
			}
			description={share.sharedWithEmail}
			leftComponent={
				share.ownerPhoto ? (
					<Image
						source={{ uri: share.ownerPhoto }}
						style={styles.ownerPhoto}
					/>
				) : (
					<View style={styles.ownerPhotoPlaceholder}>
						<Text style={styles.ownerPhotoPlaceholderText}>
							{(share.ownerName ??
								share.sharedWithEmail)[0].toUpperCase()}
						</Text>
					</View>
				)
			}
			rightComponent={
				<View style={styles.sharedWithMeActions}>
					<Switch
						value={isDefaultView}
						onValueChange={() => onSetDefaultView(share.ownerId)}
						trackColor={{
							false: colors.background.secondary,
							true: colors.office,
						}}
						thumbColor={colors.background.primary}
					/>
				</View>
			}
			style={isHighlighted ? styles.highlightedItem : undefined}
		/>
	);
};

const styles = StyleSheet.create({
	titleContainer: {
		flexDirection: 'row',
		alignItems: 'center',
		gap: 8,
	},
	titleText: {
		fontFamily: fonts.PoppinsMedium,
		fontSize: 16,
		color: colors.text.primary,
	},
	permissionBadge: {
		paddingHorizontal: 8,
		paddingVertical: 4,
		borderRadius: 4,
		position: 'relative',
		justifyContent: 'center',
		alignItems: 'center',
	},
	readBadge: {
		backgroundColor: colors.background.secondary,
	},
	writeBadge: {
		backgroundColor: colors.office + '15',
	},
	permissionBadgeText: {
		fontFamily: fonts.PoppinsMedium,
		fontSize: 12,
		color: colors.text.secondary,
	},
	sharedWithMeActions: {
		flexDirection: 'row',
		alignItems: 'center',
	},
	ownerPhoto: {
		width: 44,
		height: 44,
		borderRadius: 22,
	},
	ownerPhotoPlaceholder: {
		width: 44,
		height: 44,
		borderRadius: 22,
		backgroundColor: colors.ui.gray[200],
		justifyContent: 'center',
		alignItems: 'center',
	},
	ownerPhotoPlaceholderText: {
		fontFamily: fonts.PoppinsMedium,
		color: colors.text.secondary,
		fontSize: 18,
	},
	highlightedItem: {
		backgroundColor: colors.office + '15',
		borderRadius: 8,
	},
});

export default SharedWithMeListItem;
