import AsyncStorage from '@react-native-async-storage/async-storage';
import { getApp } from '@react-native-firebase/app';
import { getAuth } from '@react-native-firebase/auth';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
	Alert,
	Animated,
	Keyboard,
	Pressable,
	RefreshControl,
	ScrollView,
	StyleSheet,
	Text,
	TextInput,
	View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { useDispatch, useSelector } from 'react-redux';

import {
	Dialog,
	FocusAwareStatusBar,
	ProfileInfo,
	ScreenHeader,
	SharedWithMeListItem,
	ShareListItem,
} from '../../components';
import { database } from '../../db/watermelon';
import { useResponsiveLayout, useWorkTrackManager } from '../../hooks';
import { logger } from '../../logging';
import { AppDispatch, RootState } from '../../store';
import { logout } from '../../store/reducers/userSlice';
import { setLoading } from '../../store/reducers/workTrackSlice';
import { colors, fonts } from '../../themes';
import { AuthenticatedStackScreenProps } from '../../types';
import { type SharePermission } from '../../use-cases/shareReadUseCase';
import { clearAppData } from '../../utils/appDataManager';
import { ShareValidationUtils } from '../../utils/shareValidation';

const ProfileScreen: React.FC<
	AuthenticatedStackScreenProps<'ProfileScreen'>
> = ({ navigation, route }) => {
	const { RFValue } = useResponsiveLayout();
	const dispatch = useDispatch<AppDispatch>();
	const user = useSelector((state: RootState) => state.user.user);
	const { loading } = useSelector((state: RootState) => state.workTrack);
	const [myShares, setMyShares] = useState<SharePermission[]>([]);
	const [sharedWithMe, setSharedWithMe] = useState<SharePermission[]>([]);
	const [defaultViewUserId, setDefaultViewUserId] = useState<string | null>(
		null
	);
	const [isShareDialogVisible, setIsShareDialogVisible] = useState(false);
	const [isEditDialogVisible, setIsEditDialogVisible] = useState(false);
	const [editingShare, setEditingShare] = useState<SharePermission | null>(
		null
	);
	const [shareEmail, setShareEmail] = useState('');
	const [sharePermission, setSharePermission] = useState<'read' | 'write'>(
		'read'
	);
	const [isAlertVisible, setIsAlertVisible] = useState(false);
	const [pressAnim] = useState(new Animated.Value(1));
	const [isKeyboardVisible, setIsKeyboardVisible] = useState(false);
	const [isRefreshing, setIsRefreshing] = useState(false);
	const scrollViewRef = useRef<ScrollView>(null);
	const [highlightedWorkTrackId, setHighlightedWorkTrackId] = useState<
		string | null
	>(null);
	const manager = useWorkTrackManager();
	const sharedWithMeSectionRef = useRef<View>(null);

	useEffect(() => {
		loadShares();
		const keyboardDidShowListener = Keyboard.addListener(
			'keyboardDidShow',
			() => {
				setIsKeyboardVisible(true);
			}
		);
		const keyboardDidHideListener = Keyboard.addListener(
			'keyboardDidHide',
			() => {
				setIsKeyboardVisible(false);
			}
		);

		return () => {
			keyboardDidShowListener.remove();
			keyboardDidHideListener.remove();
		};
	}, []);

	useEffect(() => {
		const loadDefaultView = async () => {
			try {
				const userId =
					await manager.userManagement.getDefaultViewUserId();
				setDefaultViewUserId(userId);
			} catch (error) {
				logger.error('Failed to load default view user ID', { error });
			}
		};
		loadDefaultView();
	}, [manager.userManagement]);

	useEffect(() => {
		const params = route.params as
			| { scrollToSection?: string; highlightWorkTrackId?: string }
			| undefined;
		if (
			params?.scrollToSection === 'sharedWithMe' &&
			sharedWithMeSectionRef.current
		) {
			// Wait for layout to complete
			setTimeout(() => {
				sharedWithMeSectionRef.current?.measureLayout(
					scrollViewRef.current?.getInnerViewNode() as number,
					(_x, y) => {
						scrollViewRef.current?.scrollTo({ y, animated: true });
					},
					() => {}
				);
			}, 100);
		}
		if (params?.highlightWorkTrackId) {
			setHighlightedWorkTrackId(params.highlightWorkTrackId);
			// Remove highlight after 2 seconds
			setTimeout(() => setHighlightedWorkTrackId(null), 2000);
		}
	}, [route.params]);

	const loadShares = async () => {
		try {
			const [mySharesData, sharedWithMeData] = await Promise.all([
				manager.shareRead.getMyShares(),
				manager.shareRead.getSharedWithMe(),
			]);
			setMyShares(mySharesData);
			setSharedWithMe(sharedWithMeData);
		} catch (error) {
			logger.error('Failed to load shares', { error });
		}
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

	useEffect(() => {
		if (!isShareDialogVisible) {
			setShareEmail('');
		}
	}, [isShareDialogVisible]);

	const handleShare = async () => {
		if (!shareEmail) {
			showAlert('Error', 'Please enter an email address');
			return;
		}

		try {
			// Comprehensive validation
			ShareValidationUtils.validateShareRequest(
				shareEmail,
				user?.email,
				myShares
			);
		} catch (error) {
			const errorMessage =
				error instanceof Error ? error.message : 'Validation failed';
			showAlert('Validation Error', errorMessage, () =>
				setShareEmail('')
			);
			return;
		}

		try {
			dispatch(setLoading(true));
			await manager.share(shareEmail.toLowerCase(), sharePermission);
			showAlert('Success', 'Tracker shared successfully');
			setShareEmail('');
			setIsShareDialogVisible(false);
			await loadShares();
		} catch (error: unknown) {
			if (
				error &&
				typeof error === 'object' &&
				'code' in error &&
				error.code === 'permission-denied'
			) {
				showAlert(
					'Permission Denied',
					'You do not have permission to share trackers. Please try logging out and logging back in.',
					() => setShareEmail('')
				);
			} else {
				const errorMessage =
					error instanceof Error
						? error.message
						: 'Failed to share tracker';
				showAlert('Error', errorMessage);
			}
		} finally {
			dispatch(setLoading(false));
		}
	};

	const handleRemoveShare = async (sharedWithId: string) => {
		const share = myShares.find((s) => s.sharedWithId === sharedWithId);
		if (!share) return;

		Alert.alert(
			'Remove Share',
			`Are you sure you want to remove sharing with ${share.ownerName ?? share.sharedWithEmail}?`,
			[
				{
					text: 'Cancel',
					style: 'cancel',
				},
				{
					text: 'Remove',
					style: 'destructive',
					onPress: async () => {
						try {
							await manager.shareRead.removeShare(sharedWithId);
							loadShares();
						} catch (error) {
							logger.error('Error removing share:', { error });
							showAlert(
								'Error',
								'Failed to remove share. Please try again.'
							);
						}
					},
				},
			]
		);
	};

	const handleSetDefaultView = async (userId: string) => {
		try {
			const currentDefaultView =
				await manager.userManagement.getDefaultViewUserId();
			const newDefaultView =
				currentDefaultView === userId ? null : userId;
			await manager.userManagement.setDefaultViewUserId(newDefaultView);
			setDefaultViewUserId(newDefaultView);
		} catch (error) {
			logger.error('Error setting default view:', { error });
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
			await AsyncStorage.removeItem('user');
			await manager.userManagement.setDefaultViewUserId(null);
			await database.write(async () => {
				await database.unsafeResetDatabase();
			});
			dispatch(logout());
		} catch (error) {
			logger.error('Logout error:', { error });
			await AsyncStorage.removeItem('user');
			await manager.userManagement.setDefaultViewUserId(null);
			await database.write(async () => {
				await database.unsafeResetDatabase();
			});
			dispatch(logout());
		}
	};

	const onRefresh = useCallback(async () => {
		setIsRefreshing(true);
		try {
			await loadShares();
		} catch (error) {
			logger.error('Error refreshing:', { error });
		} finally {
			setIsRefreshing(false);
		}
	}, []);

	const handleEditPermission = async (share: SharePermission) => {
		setEditingShare(share);
		setSharePermission(share.permission);
		setIsEditDialogVisible(true);
	};

	const handleUpdatePermission = async () => {
		if (!editingShare) return;

		try {
			dispatch(setLoading(true));
			await manager.updateSharePermission(
				editingShare.sharedWithId,
				sharePermission
			);
			showAlert('Success', 'Permission updated successfully');
			setIsEditDialogVisible(false);
			await loadShares();
		} catch (error: unknown) {
			const errorMessage =
				error instanceof Error
					? error.message
					: 'Failed to update permission';
			showAlert('Error', errorMessage);
		} finally {
			dispatch(setLoading(false));
		}
	};

	const renderShareDialog = () => (
		<Dialog
			isVisible={isShareDialogVisible}
			onBackdropPress={() => {
				if (isKeyboardVisible) {
					Keyboard.dismiss();
				} else {
					setIsShareDialogVisible(false);
				}
			}}
			title='Share Trackers'
			loading={loading}
			onDismiss={() => setIsShareDialogVisible(false)}
			onConfirm={handleShare}
			confirmText='Share'
		>
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
					placeholderTextColor={colors.text.secondary}
					selectTextOnFocus={false}
					returnKeyType='done'
				/>
			</View>
			<View style={styles.permissionContainer}>
				<Text style={styles.permissionLabel}>Permission:</Text>
				<View style={styles.permissionButtons}>
					<Pressable
						onPress={() => {
							Keyboard.dismiss();
							setSharePermission('read');
						}}
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
								sharePermission === 'read' &&
									styles.permissionButtonTextActive,
							]}
						>
							Read
						</Text>
					</Pressable>
					<Pressable
						onPress={() => {
							Keyboard.dismiss();
							setSharePermission('write');
						}}
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
								sharePermission === 'write' &&
									styles.permissionButtonTextActive,
							]}
						>
							Write
						</Text>
					</Pressable>
				</View>
			</View>
		</Dialog>
	);

	const renderEditDialog = () => (
		<Dialog
			isVisible={isEditDialogVisible}
			onBackdropPress={() => {
				if (isKeyboardVisible) {
					Keyboard.dismiss();
				} else {
					setIsEditDialogVisible(false);
				}
			}}
			title='Edit Permission'
			subtitle={editingShare?.sharedWithEmail}
			loading={loading}
			onDismiss={() => setIsEditDialogVisible(false)}
			onConfirm={handleUpdatePermission}
			confirmText='Update'
		>
			<View style={styles.permissionContainer}>
				<Text style={styles.permissionLabel}>Permission:</Text>
				<View style={styles.permissionButtons}>
					<Pressable
						onPress={() => {
							Keyboard.dismiss();
							setSharePermission('read');
						}}
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
								sharePermission === 'read' &&
									styles.permissionButtonTextActive,
							]}
						>
							Read
						</Text>
					</Pressable>
					<Pressable
						onPress={() => {
							Keyboard.dismiss();
							setSharePermission('write');
						}}
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
								sharePermission === 'write' &&
									styles.permissionButtonTextActive,
							]}
						>
							Write
						</Text>
					</Pressable>
				</View>
			</View>
		</Dialog>
	);

	return (
		<SafeAreaView style={styles.screen}>
			<FocusAwareStatusBar
				barStyle='dark-content'
				translucent
				backgroundColor='transparent'
			/>
			<ScreenHeader
				title='Profile'
				onBackPress={() => navigation.goBack()}
			/>
			<ScrollView
				ref={scrollViewRef}
				style={styles.scrollView}
				contentContainerStyle={styles.scrollViewContent}
				refreshControl={
					<RefreshControl
						refreshing={isRefreshing}
						onRefresh={() => {
							void onRefresh();
						}}
						tintColor={colors.office}
						colors={[colors.office]}
					/>
				}
			>
				<ProfileInfo
					name={user?.name}
					email={user?.email}
					photo={user?.photo}
				/>

				<View style={styles.contentSection}>
					<Text
						style={[styles.sectionTitle, { fontSize: RFValue(18) }]}
					>
						My Trackers
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
					<View style={{ gap: 16 }}>
						{myShares.map((share) => (
							<ShareListItem
								key={share.sharedWithId}
								share={share}
								onEditPermission={handleEditPermission}
								onRemoveShare={handleRemoveShare}
							/>
						))}
					</View>
				</View>

				<View
					style={styles.contentSection}
					ref={sharedWithMeSectionRef}
				>
					<Text
						style={[styles.sectionTitle, { fontSize: RFValue(18) }]}
					>
						Shared With Me
					</Text>
					<View style={styles.sectionNote}>
						<MaterialCommunityIcons
							name='information-outline'
							size={16}
							color={colors.text.secondary}
						/>
						<Text style={styles.sectionNoteText}>
							If no tracker is set as default, your own tracker
							will be shown by default
						</Text>
					</View>
					<View style={{ gap: 16 }}>
						{sharedWithMe.map((share) => (
							<SharedWithMeListItem
								key={share.ownerId}
								share={share}
								onSetDefaultView={handleSetDefaultView}
								isDefaultView={
									share.ownerId === defaultViewUserId
								}
								isHighlighted={
									share.ownerId === highlightedWorkTrackId
								}
							/>
						))}
					</View>
				</View>

				<View style={styles.contentSection}>
					<Pressable
						onPress={() => {
							Alert.alert(
								'Clear App Data',
								'Are you sure you want to clear all app data? This action cannot be undone.',
								[
									{
										text: 'Cancel',
										style: 'cancel',
									},
									{
										text: 'Clear',
										style: 'destructive',
										onPress: () => {
											void clearAppData()
												.then(() => {
													Alert.alert(
														'Success',
														'App data cleared successfully'
													);
												})
												.catch(() => {
													Alert.alert(
														'Error',
														'Failed to clear app data'
													);
												});
										},
									},
								]
							);
						}}
						style={({ pressed }) => [
							styles.clearDataButton,
							{ opacity: pressed ? 0.8 : 1 },
						]}
					>
						<Text style={styles.clearDataButtonText}>
							Clear App Data
						</Text>
					</Pressable>
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
										onPress: () => {
											void handleLogout();
										},
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
			</ScrollView>

			{renderShareDialog()}
			{editingShare && renderEditDialog()}
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
	scrollViewContent: {
		paddingTop: 16,
	},
	contentSection: {
		padding: 20,
	},
	sectionTitle: {
		fontFamily: fonts.PoppinsSemiBold,
		color: colors.text.primary,
		marginBottom: 16,
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
	permissionContainer: {
		marginTop: 8,
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
	clearDataButton: {
		backgroundColor: colors.wfh,
		padding: 12,
		borderRadius: 8,
		alignItems: 'center',
		marginTop: 20,
	},
	clearDataButtonText: {
		color: colors.background.primary,
		fontFamily: fonts.PoppinsMedium,
		fontSize: 16,
	},
	sectionNote: {
		flexDirection: 'row',
		alignItems: 'center',
		gap: 8,
		padding: 12,
		backgroundColor: colors.background.secondary,
		borderRadius: 8,
		marginBottom: 16,
	},
	sectionNoteText: {
		fontFamily: fonts.PoppinsRegular,
		fontSize: 12,
		color: colors.text.secondary,
		flex: 1,
	},
});

export default ProfileScreen;
