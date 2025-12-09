// migrated to V2 structure
import MaterialDesignIcons from '@react-native-vector-icons/material-design-icons';
import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { useResponsiveLayout } from '@/shared/ui/hooks/useResponsive';
import { colors, fonts } from '@/shared/ui/theme';

interface SharedWithMeListItemProps {
	share: {
		ownerId: string;
		ownerName: string;
		ownerEmail: string;
		permission: 'read' | 'write';
	};
	onSetDefaultView: (userId: string) => void;
	isDefaultView: boolean;
	isHighlighted?: boolean;
}

const SharedWithMeListItem: React.FC<SharedWithMeListItemProps> = ({
	share,
	onSetDefaultView,
	isDefaultView,
	isHighlighted = false,
}) => {
	const { RFValue } = useResponsiveLayout();

	return (
		<Pressable
			style={({ pressed }) => [
				styles.container,
				isHighlighted && styles.highlighted,
				{ opacity: pressed ? 0.8 : 1 },
			]}
			onPress={() => onSetDefaultView(share.ownerId)}
		>
			<View style={styles.content}>
				<View style={styles.info}>
					<Text style={[styles.name, { fontSize: RFValue(16) }]}>
						{share.ownerName}
					</Text>
					<Text style={[styles.email, { fontSize: RFValue(14) }]}>
						{share.ownerEmail}
					</Text>
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
					{isDefaultView && (
						<View style={styles.defaultBadge}>
							<MaterialDesignIcons
								name='star'
								size={16}
								color={colors.office}
							/>
							<Text style={styles.defaultText}>Default</Text>
						</View>
					)}
				</View>
			</View>
		</Pressable>
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
	highlighted: {
		borderColor: colors.office,
		backgroundColor: colors.office + '10',
	},
	content: {
		flexDirection: 'row',
		justifyContent: 'space-between',
		alignItems: 'center',
	},
	info: {
		flex: 1,
	},
	name: {
		fontFamily: fonts.PoppinsMedium,
		color: colors.text.primary,
		marginBottom: 4,
	},
	email: {
		fontFamily: fonts.PoppinsRegular,
		color: colors.text.secondary,
	},
	actions: {
		flexDirection: 'row',
		alignItems: 'center',
		gap: 8,
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
	defaultBadge: {
		flexDirection: 'row',
		alignItems: 'center',
		paddingHorizontal: 8,
		paddingVertical: 4,
		borderRadius: 4,
		backgroundColor: colors.office + '15',
		gap: 4,
	},
	defaultText: {
		fontFamily: fonts.PoppinsMedium,
		fontSize: 12,
		color: colors.office,
	},
});

export default SharedWithMeListItem;
