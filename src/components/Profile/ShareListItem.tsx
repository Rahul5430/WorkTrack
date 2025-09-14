import React from 'react';
import { Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';

import { fonts } from '../../themes';
import { colors } from '../../themes/colors';
import { SharePermission } from '../../use-cases/shareReadUseCase';
import ListItem from '../common/ListItem';

interface ShareListItemProps {
	share: SharePermission;
	onEditPermission: (share: SharePermission) => void;
	onRemoveShare: (sharedWithId: string) => void;
}

const ShareListItem: React.FC<ShareListItemProps> = ({
	share,
	onEditPermission,
	onRemoveShare,
}) => {
	return (
		<ListItem
			key={share.sharedWithId}
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
				<View style={styles.listItemActions}>
					<TouchableOpacity
						onPress={() => onEditPermission(share)}
						style={[styles.iconButton, styles.editButton]}
					>
						<MaterialCommunityIcons
							name='pencil'
							size={20}
							color={colors.office}
						/>
					</TouchableOpacity>
					<TouchableOpacity
						onPress={() => onRemoveShare(share.sharedWithId)}
						style={[styles.iconButton, styles.removeButton]}
					>
						<MaterialCommunityIcons
							name='delete'
							size={20}
							color={colors.error}
						/>
					</TouchableOpacity>
				</View>
			}
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
	listItemActions: {
		flexDirection: 'row',
		alignItems: 'center',
		gap: 8,
	},
	iconButton: {
		padding: 6,
		borderRadius: 6,
	},
	editButton: {
		backgroundColor: colors.office + '15',
	},
	removeButton: {
		backgroundColor: colors.error + '15',
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
});

export default ShareListItem;
