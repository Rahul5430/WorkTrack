// migrated to V2 structure
import React from 'react';
import { Image, StyleSheet, Text, View } from 'react-native';

import { useResponsiveLayout } from '@/shared/ui/hooks/useResponsive';
import { colors, fonts } from '@/shared/ui/theme';

interface ProfileInfoProps {
	name?: string;
	email?: string;
	photo?: string;
}

const ProfileInfo: React.FC<ProfileInfoProps> = ({ name, email, photo }) => {
	const { RFValue } = useResponsiveLayout();

	return (
		<View style={styles.container}>
			<View style={styles.avatarContainer}>
				{photo ? (
					<Image source={{ uri: photo }} style={styles.avatar} />
				) : (
					<View style={styles.avatarPlaceholder}>
						<Text style={styles.avatarText}>
							{name?.[0]?.toUpperCase() || '?'}
						</Text>
					</View>
				)}
			</View>
			<View style={styles.infoContainer}>
				<Text style={[styles.name, { fontSize: RFValue(18) }]}>
					{name || 'Unknown User'}
				</Text>
				<Text style={[styles.email, { fontSize: RFValue(14) }]}>
					{email || 'No email provided'}
				</Text>
			</View>
		</View>
	);
};

const styles = StyleSheet.create({
	container: {
		flexDirection: 'row',
		alignItems: 'center',
		padding: 20,
		backgroundColor: colors.background.secondary,
		borderRadius: 12,
		marginBottom: 16,
	},
	avatarContainer: {
		marginRight: 16,
	},
	avatar: {
		width: 60,
		height: 60,
		borderRadius: 30,
	},
	avatarPlaceholder: {
		width: 60,
		height: 60,
		borderRadius: 30,
		backgroundColor: colors.office + '15',
		justifyContent: 'center',
		alignItems: 'center',
	},
	avatarText: {
		fontFamily: fonts.PoppinsMedium,
		fontSize: 24,
		color: colors.office,
	},
	infoContainer: {
		flex: 1,
	},
	name: {
		fontFamily: fonts.PoppinsSemiBold,
		color: colors.text.primary,
		marginBottom: 4,
	},
	email: {
		fontFamily: fonts.PoppinsRegular,
		color: colors.text.secondary,
	},
});

export default ProfileInfo;
