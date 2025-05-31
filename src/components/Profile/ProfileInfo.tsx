import React from 'react';
import { Image, StyleSheet, Text, View } from 'react-native';

import { fonts } from '../../themes';
import { colors } from '../../themes/colors';

interface ProfileInfoProps {
	name?: string;
	email?: string;
	photo?: string;
}

const ProfileInfo: React.FC<ProfileInfoProps> = ({ name, email, photo }) => {
	return (
		<View style={styles.profileSection}>
			<View style={styles.profileImageContainer}>
				{photo ? (
					<Image
						source={{ uri: photo }}
						style={styles.profileImage}
					/>
				) : (
					<View style={styles.profilePlaceholder}>
						<Text style={styles.profilePlaceholderText}>
							{name?.[0]?.toUpperCase() ?? '?'}
						</Text>
					</View>
				)}
			</View>
			<Text style={styles.name}>{name}</Text>
			<Text style={styles.email}>{email}</Text>
		</View>
	);
};

const styles = StyleSheet.create({
	profileSection: {
		alignItems: 'center',
		paddingVertical: 24,
	},
	profileImageContainer: {
		width: 100,
		height: 100,
		borderRadius: 50,
		overflow: 'hidden',
		marginBottom: 16,
		backgroundColor: colors.background.primary,
		elevation: 4,
		shadowColor: colors.text.primary,
		shadowOffset: { width: 0, height: 2 },
		shadowOpacity: 0.2,
		shadowRadius: 4,
	},
	profileImage: {
		width: '100%',
		height: '100%',
	},
	profilePlaceholder: {
		width: '100%',
		height: '100%',
		backgroundColor: colors.office,
		alignItems: 'center',
		justifyContent: 'center',
	},
	profilePlaceholderText: {
		color: colors.background.primary,
		fontFamily: fonts.PoppinsSemiBold,
		fontSize: 40,
	},
	name: {
		fontFamily: fonts.PoppinsSemiBold,
		fontSize: 24,
		color: colors.text.primary,
		marginBottom: 4,
	},
	email: {
		fontFamily: fonts.PoppinsRegular,
		fontSize: 16,
		color: colors.text.secondary,
	},
});

export default ProfileInfo;
