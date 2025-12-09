// migrated to V2 structure
import MaterialDesignIcons from '@react-native-vector-icons/material-design-icons';
import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { useResponsiveLayout } from '@/shared/ui/hooks/useResponsive';
import { colors, fonts } from '@/shared/ui/theme';

export type ShareListItemData = {
	sharedWithId: string;
	sharedWithEmail: string;
	ownerName?: string;
	permission: 'read' | 'write';
};

interface ShareListItemProps {
	share: ShareListItemData;
	onEditPermission: (share: ShareListItemData) => void;
	onRemoveShare: (sharedWithId: string) => void;
}

const ShareListItem: React.FC<ShareListItemProps> = ({
	share,
	onEditPermission,
	onRemoveShare,
}) => {
	const { RFValue } = useResponsiveLayout();

	return (
		<View style={styles.container}>
			<View style={styles.content}>
				<View style={styles.info}>
					<Text style={[styles.email, { fontSize: RFValue(16) }]}>
						{share.sharedWithEmail}
					</Text>
					{share.ownerName && (
						<Text style={[styles.name, { fontSize: RFValue(14) }]}>
							{share.ownerName}
						</Text>
					)}
				</View>
				<View style={styles.actions}>
					<View
						style={[
							styles.permissionBadge,
							share.permission === 'write'
								? styles.writeBadge
								: styles.readBadge,
						]}
					>
						<Text style={styles.permissionText}>
							{share.permission === 'write' ? 'Write' : 'Read'}
						</Text>
					</View>
				</View>
			</View>
			<View style={styles.buttonContainer}>
				<Pressable
					style={({ pressed }) => [
						styles.actionButton,
						styles.editButton,
						{ opacity: pressed ? 0.8 : 1 },
					]}
					onPress={() => onEditPermission(share)}
				>
					<MaterialDesignIcons
						name='pencil'
						size={16}
						color={colors.office}
					/>
					<Text style={styles.buttonText}>Edit</Text>
				</Pressable>
				<Pressable
					style={({ pressed }) => [
						styles.actionButton,
						styles.removeButton,
						{ opacity: pressed ? 0.8 : 1 },
					]}
					onPress={() => onRemoveShare(share.sharedWithId)}
				>
					<MaterialDesignIcons
						name='delete'
						size={16}
						color={colors.error}
					/>
					<Text style={[styles.buttonText, styles.removeText]}>
						Remove
					</Text>
				</Pressable>
			</View>
		</View>
	);
};

const styles = StyleSheet.create({
	container: {
		backgroundColor: colors.background.secondary,
		borderRadius: 12,
		padding: 16,
		marginBottom: 8,
		borderWidth: 1,
		borderColor: colors.ui.gray[200],
	},
	content: {
		flexDirection: 'row',
		justifyContent: 'space-between',
		alignItems: 'center',
		marginBottom: 12,
	},
	info: {
		flex: 1,
	},
	email: {
		fontFamily: fonts.PoppinsMedium,
		color: colors.text.primary,
		marginBottom: 4,
	},
	name: {
		fontFamily: fonts.PoppinsRegular,
		color: colors.text.secondary,
	},
	actions: {
		flexDirection: 'row',
		alignItems: 'center',
	},
	permissionBadge: {
		paddingHorizontal: 8,
		paddingVertical: 4,
		borderRadius: 4,
	},
	readBadge: {
		backgroundColor: colors.ui.gray[200],
	},
	writeBadge: {
		backgroundColor: colors.office + '15',
	},
	permissionText: {
		fontFamily: fonts.PoppinsMedium,
		fontSize: 12,
		color: colors.text.secondary,
	},
	buttonContainer: {
		flexDirection: 'row',
		gap: 8,
	},
	actionButton: {
		flexDirection: 'row',
		alignItems: 'center',
		paddingHorizontal: 12,
		paddingVertical: 8,
		borderRadius: 6,
		gap: 4,
	},
	editButton: {
		backgroundColor: colors.office + '15',
		borderWidth: 1,
		borderColor: colors.office,
	},
	removeButton: {
		backgroundColor: colors.error + '15',
		borderWidth: 1,
		borderColor: colors.error,
	},
	buttonText: {
		fontFamily: fonts.PoppinsMedium,
		fontSize: 12,
		color: colors.office,
	},
	removeText: {
		color: colors.error,
	},
});

export default ShareListItem;
