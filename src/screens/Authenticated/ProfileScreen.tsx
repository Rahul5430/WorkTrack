import AsyncStorage from '@react-native-async-storage/async-storage';
import { getApp } from '@react-native-firebase/app';
import { getAuth } from '@react-native-firebase/auth';
import React, { useCallback, useEffect, useState } from 'react';
import {
	ActivityIndicator,
	Alert,
	Animated,
	Image,
	Pressable,
	ScrollView,
	StyleSheet,
	Switch,
	Text,
	TextInput,
	TouchableOpacity,
	View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useDispatch, useSelector } from 'react-redux';

import { database } from '../../db/watermelon';
import { useResponsiveLayout } from '../../hooks/useResponsive';
import SyncService, { SharePermission } from '../../services/sync';
import { logout } from '../../store/reducers/userSlice';
import { setLoading } from '../../store/reducers/workTrackSlice';
import { AppDispatch, RootState } from '../../store/store';
import { fonts } from '../../themes';
import { colors } from '../../themes/colors';

const ProfileScreen = () => {
	const { RFValue } = useResponsiveLayout();
	const dispatch = useDispatch<AppDispatch>();
	const user = useSelector((state: RootState) => state.user.user);
	const [myShares, setMyShares] = useState<SharePermission[]>([]);
	const [sharedWithMe, setSharedWithMe] = useState<SharePermission[]>([]);
	const [isShareDialogVisible, setIsShareDialogVisible] = useState(false);
	const [shareEmail, setShareEmail] = useState('');
	const [localEmail, setLocalEmail] = useState('');
	const [sharePermission, setSharePermission] = useState<'read' | 'write'>(
		'read'
	);
	const [isLoading, setIsLoading] = useState(false);
	const [isAlertVisible, setIsAlertVisible] = useState(false);
	const [pressAnim] = useState(new Animated.Value(1));

	useEffect(() => {
		loadShares();
	}, []);

	const loadShares = async () => {
		const syncService = SyncService.getInstance();
		const [mySharesData, sharedWithMeData] = await Promise.all([
			syncService.getMyShares(),
			syncService.getSharedWithMe(),
		]);
		setMyShares(mySharesData);
		setSharedWithMe(sharedWithMeData);
	};

	const showAlert = (
		title: string,
		message: string,
		onPress?: () => void
	) => {
		if (isAlertVisible) return;
		setIsAlertVisible(true);
		Alert.alert(
			title,
			message,
			[
				{
					text: 'OK',
					onPress: () => {
						setIsAlertVisible(false);
						onPress?.();
					},
				},
			],
			{ cancelable: false }
		);
	};

	const handleEmailChange = useCallback((text: string) => {
		setLocalEmail(text);
		// Debounce the actual state update
		const timeoutId = setTimeout(() => {
			setShareEmail(text);
		}, 0);
		return () => clearTimeout(timeoutId);
	}, []);

	// Reset local email when dialog closes
	useEffect(() => {
		if (!isShareDialogVisible) {
			setLocalEmail('');
		}
	}, [isShareDialogVisible]);

	const handleShare = async () => {
		if (!shareEmail) {
			showAlert('Error', 'Please enter an email address');
			return;
		}

		if (shareEmail.toLowerCase() === user?.email?.toLowerCase()) {
			showAlert(
				'Invalid Share',
				'You cannot share your WorkTrack with yourself.',
				() => setShareEmail('')
			);
			return;
		}

		try {
			dispatch(setLoading(true));
			await SyncService.getInstance().shareWorkTrack(
				shareEmail.toLowerCase(),
				sharePermission
			);
			showAlert('Success', 'WorkTrack shared successfully');
			setShareEmail('');
			setIsShareDialogVisible(false);
			await loadShares();
		} catch (error: any) {
			if (error.code === 'USER_NOT_FOUND') {
				showAlert(
					'User Not Found',
					'This user has not created an account yet. Please ask them to create an account first.',
					() => setShareEmail('')
				);
			} else if (error.code === 'permission-denied') {
				showAlert(
					'Permission Denied',
					'You do not have permission to share WorkTracks. Please try logging out and logging back in.',
					() => setShareEmail('')
				);
			} else {
				showAlert(
					'Error',
					error.message ?? 'Failed to share WorkTrack'
				);
			}
		} finally {
			dispatch(setLoading(false));
		}
	};

	const handleRemoveShare = async (sharedWithId: string) => {
		try {
			const syncService = SyncService.getInstance();
			await syncService.removeShare(sharedWithId);
			await loadShares();
		} catch (error) {
			console.error('Error removing share:', error);
		}
	};

	const handleSetDefaultView = async (userId: string) => {
		try {
			const syncService = SyncService.getInstance();
			syncService.setDefaultViewUserId(userId);
			// You might want to trigger a refresh of the calendar view here
		} catch (error) {
			console.error('Error setting default view:', error);
		}
	};

	const animatePress = (pressed: boolean) => {
		Animated.spring(pressAnim, {
			toValue: pressed ? 0.95 : 1,
			useNativeDriver: true,
		}).start();
	};

	const handleLogout = async () => {
		try {
			const auth = getAuth(getApp());
			const currentUser = auth.currentUser;
			if (currentUser) {
				await auth.signOut();
			}
			// Clear AsyncStorage
			await AsyncStorage.removeItem('user');
			// Clear local database
			await database.write(async () => {
				await database.unsafeResetDatabase();
			});
			// Clear Redux state
			dispatch(logout());
		} catch (error) {
			console.error('Logout error:', error);
			// Still clear storage and state even if Firebase signOut fails
			await AsyncStorage.removeItem('user');
			await database.write(async () => {
				await database.unsafeResetDatabase();
			});
			dispatch(logout());
		}
	};

	return (
		<SafeAreaView style={styles.screen} edges={['left', 'right', 'bottom']}>
			<ScrollView style={styles.scrollView}>
				<View style={styles.profileSection}>
					<View style={styles.profileImageContainer}>
						{user?.photo ? (
							<Image
								source={{ uri: user.photo }}
								style={styles.profileImage}
							/>
						) : (
							<View style={styles.profilePlaceholder}>
								<Text style={styles.profilePlaceholderText}>
									{user?.name?.[0]?.toUpperCase() ?? '?'}
								</Text>
							</View>
						)}
					</View>
					<Text style={styles.name}>{user?.name}</Text>
					<Text style={styles.email}>{user?.email}</Text>
				</View>

				<View style={styles.contentSection}>
					<Text
						style={[styles.sectionTitle, { fontSize: RFValue(18) }]}
					>
						My Work Tracks
					</Text>
					<Pressable
						onPress={() => setIsShareDialogVisible(true)}
						onPressIn={() => animatePress(true)}
						onPressOut={() => animatePress(false)}
					>
						<Animated.View
							style={[
								styles.shareButton,
								{ transform: [{ scale: pressAnim }] },
							]}
						>
							<Text style={styles.shareButtonText}>
								Share with Others
							</Text>
						</Animated.View>
					</Pressable>
				</View>

				<View style={styles.contentSection}>
					<Text
						style={[styles.sectionTitle, { fontSize: RFValue(18) }]}
					>
						Shared With Others
					</Text>
					{myShares.map((share) => (
						<View key={share.sharedWithId} style={styles.listItem}>
							<View style={styles.listItemContent}>
								<Text style={styles.listItemTitle}>
									{share.sharedWithId}
								</Text>
								<Text style={styles.listItemDescription}>
									Permission: {share.permission}
								</Text>
							</View>
							<TouchableOpacity
								onPress={() =>
									handleRemoveShare(share.sharedWithId)
								}
								style={styles.removeButton}
							>
								<Text style={styles.removeButtonText}>
									Remove
								</Text>
							</TouchableOpacity>
						</View>
					))}
				</View>

				<View style={styles.contentSection}>
					<Text
						style={[styles.sectionTitle, { fontSize: RFValue(18) }]}
					>
						Shared With Me
					</Text>
					{sharedWithMe.map((share) => (
						<View key={share.ownerId} style={styles.listItem}>
							<View style={styles.listItemContent}>
								<Text style={styles.listItemTitle}>
									{share.ownerId}
								</Text>
								<Text style={styles.listItemDescription}>
									Permission: {share.permission}
								</Text>
							</View>
							<Switch
								value={
									share.ownerId ===
									SyncService.getInstance().getDefaultViewUserId()
								}
								onValueChange={() =>
									handleSetDefaultView(share.ownerId)
								}
								trackColor={{
									false: colors.background.secondary,
									true: colors.office,
								}}
								thumbColor={colors.background.primary}
							/>
						</View>
					))}
				</View>

				<View style={styles.contentSection}>
					<Pressable
						onPress={() => {
							Alert.alert(
								'Logout',
								'Are you sure you want to logout?',
								[
									{
										text: 'Cancel',
										style: 'cancel',
									},
									{
										text: 'Logout',
										style: 'destructive',
										onPress: handleLogout,
									},
								]
							);
						}}
						style={({ pressed }) => [
							styles.logoutButton,
							{ opacity: pressed ? 0.8 : 1 },
						]}
					>
						<Text style={styles.logoutButtonText}>Logout</Text>
					</Pressable>
				</View>

				{isShareDialogVisible && (
					<View style={styles.dialogOverlay}>
						<Pressable
							style={styles.dialogBackdrop}
							onPress={() => setIsShareDialogVisible(false)}
						/>
						<View style={styles.dialog}>
							<Text style={styles.dialogTitle}>
								Share Work Tracks
							</Text>
							<View style={styles.dialogContent}>
								<View style={styles.inputContainer}>
									<Text style={styles.inputLabel}>Email</Text>
									<TextInput
										value={shareEmail}
										onChangeText={setShareEmail}
										style={styles.input}
										autoFocus
										keyboardType='email-address'
										autoCapitalize='none'
										autoComplete='email'
										autoCorrect={false}
										textContentType='emailAddress'
										placeholder='Enter email address'
										placeholderTextColor={
											colors.text.secondary
										}
										selectTextOnFocus={false}
										returnKeyType='done'
									/>
								</View>
								<View style={styles.permissionContainer}>
									<Text style={styles.permissionLabel}>
										Permission:
									</Text>
									<View style={styles.permissionButtons}>
										<Pressable
											onPress={() =>
												setSharePermission('read')
											}
											style={({ pressed }) => [
												styles.permissionButton,
												sharePermission === 'read' &&
													styles.permissionButtonActive,
												{ opacity: pressed ? 0.8 : 1 },
											]}
										>
											<Text
												style={[
													styles.permissionButtonText,
													sharePermission ===
														'read' &&
														styles.permissionButtonTextActive,
												]}
											>
												Read
											</Text>
										</Pressable>
										<Pressable
											onPress={() =>
												setSharePermission('write')
											}
											style={({ pressed }) => [
												styles.permissionButton,
												sharePermission === 'write' &&
													styles.permissionButtonActive,
												{ opacity: pressed ? 0.8 : 1 },
											]}
										>
											<Text
												style={[
													styles.permissionButtonText,
													sharePermission ===
														'write' &&
														styles.permissionButtonTextActive,
												]}
											>
												Write
											</Text>
										</Pressable>
									</View>
								</View>
							</View>
							<View style={styles.dialogActions}>
								<Pressable
									onPress={() =>
										setIsShareDialogVisible(false)
									}
									style={({ pressed }) => [
										styles.dialogButton,
										{ opacity: pressed ? 0.8 : 1 },
									]}
								>
									<Text style={styles.dialogButtonText}>
										Cancel
									</Text>
								</Pressable>
								<Pressable
									onPress={handleShare}
									disabled={isLoading || !shareEmail}
									style={({ pressed }) => [
										styles.dialogButton,
										styles.dialogButtonPrimary,
										{ opacity: pressed ? 0.8 : 1 },
									]}
								>
									{isLoading ? (
										<ActivityIndicator
											color={colors.background.primary}
										/>
									) : (
										<Text
											style={[
												styles.dialogButtonText,
												styles.dialogButtonTextPrimary,
											]}
										>
											Share
										</Text>
									)}
								</Pressable>
							</View>
						</View>
					</View>
				)}
			</ScrollView>
		</SafeAreaView>
	);
};

const styles = StyleSheet.create({
	screen: {
		flex: 1,
		backgroundColor: colors.background.primary,
	},
	scrollView: {
		flex: 1,
	},
	profileSection: {
		alignItems: 'center',
		paddingVertical: 24,
		paddingTop: 32,
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
	contentSection: {
		padding: 20,
	},
	sectionTitle: {
		fontFamily: fonts.PoppinsSemiBold,
		color: colors.text.primary,
		marginBottom: 16,
	},
	inputContainer: {
		marginBottom: 16,
	},
	inputLabel: {
		fontFamily: fonts.PoppinsMedium,
		fontSize: 14,
		color: colors.text.primary,
		marginBottom: 4,
	},
	input: {
		backgroundColor: colors.background.secondary,
		borderRadius: 8,
		padding: 12,
		fontFamily: fonts.PoppinsRegular,
		fontSize: 16,
		color: colors.text.primary,
	},
	shareButton: {
		backgroundColor: colors.office,
		padding: 12,
		borderRadius: 8,
		alignItems: 'center',
	},
	shareButtonText: {
		color: colors.background.primary,
		fontFamily: fonts.PoppinsMedium,
		fontSize: 16,
	},
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
	removeButton: {
		padding: 8,
	},
	removeButtonText: {
		color: colors.error,
		fontFamily: fonts.PoppinsMedium,
		fontSize: 14,
	},
	dialogOverlay: {
		position: 'absolute',
		top: 0,
		left: 0,
		right: 0,
		bottom: 0,
		justifyContent: 'center',
		alignItems: 'center',
	},
	dialogBackdrop: {
		position: 'absolute',
		top: 0,
		left: 0,
		right: 0,
		bottom: 0,
		backgroundColor: 'rgba(0, 0, 0, 0.5)',
	},
	dialog: {
		backgroundColor: colors.background.primary,
		borderRadius: 12,
		width: '90%',
		maxWidth: 400,
		padding: 20,
		zIndex: 1,
	},
	dialogTitle: {
		fontFamily: fonts.PoppinsSemiBold,
		fontSize: 20,
		color: colors.text.primary,
		marginBottom: 16,
	},
	dialogContent: {
		marginBottom: 20,
	},
	permissionLabel: {
		fontFamily: fonts.PoppinsMedium,
		fontSize: 14,
		color: colors.text.primary,
		marginBottom: 8,
	},
	permissionButtons: {
		flexDirection: 'row',
		marginTop: 8,
	},
	permissionButton: {
		paddingVertical: 8,
		paddingHorizontal: 16,
		borderRadius: 8,
		borderWidth: 1,
		borderColor: colors.office,
		marginRight: 8,
	},
	permissionButtonActive: {
		backgroundColor: colors.office,
	},
	permissionButtonText: {
		fontFamily: fonts.PoppinsMedium,
		fontSize: 14,
		color: colors.office,
	},
	permissionButtonTextActive: {
		color: colors.background.primary,
	},
	dialogActions: {
		flexDirection: 'row',
		justifyContent: 'flex-end',
	},
	dialogButton: {
		paddingVertical: 8,
		paddingHorizontal: 16,
		borderRadius: 8,
		marginLeft: 8,
	},
	dialogButtonPrimary: {
		backgroundColor: colors.office,
	},
	dialogButtonText: {
		fontFamily: fonts.PoppinsMedium,
		fontSize: 14,
		color: colors.text.primary,
	},
	dialogButtonTextPrimary: {
		color: colors.background.primary,
	},
	permissionContainer: {
		marginTop: 8,
	},
	logoutButton: {
		backgroundColor: colors.error,
		padding: 12,
		borderRadius: 8,
		alignItems: 'center',
		marginTop: 20,
	},
	logoutButtonText: {
		color: colors.background.primary,
		fontFamily: fonts.PoppinsMedium,
		fontSize: 16,
	},
});

export default ProfileScreen;
