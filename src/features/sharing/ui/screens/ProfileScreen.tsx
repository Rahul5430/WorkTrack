import { Database, Q } from '@nozbe/watermelondb';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getApp } from '@react-native-firebase/app';
import { getAuth } from '@react-native-firebase/auth';
import React, {
	useCallback,
	useEffect,
	useMemo,
	useRef,
	useState,
} from 'react';
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

import { MainStackScreenProps } from '@/app/navigation/types';
import { useDI as useContainer } from '@/app/providers/DIProvider';
import { AppDispatch, clearUser, RootState } from '@/app/store';
import { ServiceIdentifiers } from '@/di/registry';
import TrackerModel from '@/features/attendance/data/models/TrackerModel';
import { AttendanceServiceIdentifiers } from '@/features/attendance/di';
import { ITrackerRepository } from '@/features/attendance/domain/ports/ITrackerRepository';
import { useWorkTrackManager } from '@/features/attendance/ui/hooks';
import { AuthServiceIdentifiers } from '@/features/auth/di';
import { IAuthRepository } from '@/features/auth/domain/ports/IAuthRepository';
import { Share } from '@/features/sharing/domain/entities/Share';
import ProfileInfo from '@/features/sharing/ui/components/ProfileInfo';
import ScreenHeader from '@/features/sharing/ui/components/ScreenHeader';
import SharedWithMeListItem from '@/features/sharing/ui/components/SharedWithMeListItem';
import ShareListItem from '@/features/sharing/ui/components/ShareListItem';
import {
	useDefaultView,
	useShares,
	useSharing,
} from '@/features/sharing/ui/hooks';
import { database } from '@/shared/data/database';
import ConfirmDialog from '@/shared/ui/components/dialogs/ConfirmDialog';
import Dialog from '@/shared/ui/components/dialogs/Dialog';
import FocusAwareStatusBar from '@/shared/ui/components/FocusAwareStatusBar';
import { useResponsiveLayout } from '@/shared/ui/hooks/useResponsive';
import { colors, fonts } from '@/shared/ui/theme';
import { logger } from '@/shared/utils/logging';

// Type for component-compatible share format
type ShareListItemData = {
	sharedWithId: string;
	sharedWithEmail: string;
	ownerName?: string;
	permission: 'read' | 'write';
};

type SharedWithMeListItemData = {
	ownerId: string;
	ownerName: string;
	ownerEmail: string;
	permission: 'read' | 'write';
};

// Clear app data utility
const clearAppData = async (): Promise<void> => {
	try {
		await AsyncStorage.clear();
		await database.write(async () => {
			await database.unsafeResetDatabase();
		});
	} catch (error) {
		logger.error('Error clearing app data:', { error });
		throw error;
	}
};

const ProfileScreen: React.FC<MainStackScreenProps<'ProfileScreen'>> = ({
	navigation,
	route,
}) => {
	const { RFValue } = useResponsiveLayout();
	const dispatch = useDispatch<AppDispatch>();
	const user = useSelector((state: RootState) => state.user.user);

	// Use V2 hooks
	const { defaultViewUserId, setDefaultView, clearDefaultView } =
		useDefaultView();
	const { myShares, sharedWithMe, loadShares } = useShares();
	const {
		isLoading: isSharingLoading,
		shareTracker,
		updatePermission,
		removeShare,
	} = useSharing();
	const manager = useWorkTrackManager();
	const container = useContainer();

	// Resolve dependencies for user lookups
	const trackerRepository = useMemo(
		() =>
			container.resolve<ITrackerRepository>(
				AttendanceServiceIdentifiers.TRACKER_REPOSITORY
			),
		[container]
	);

	const authRepository = useMemo(
		() =>
			container.resolve<IAuthRepository>(
				AuthServiceIdentifiers.AUTH_REPOSITORY
			),
		[container]
	);

	const watermelonDb = useMemo(
		() => container.resolve<Database>(ServiceIdentifiers.WATERMELON_DB),
		[container]
	);

	// UI state
	const [mySharesData, setMySharesData] = useState<ShareListItemData[]>([]);
	const [sharedWithMeData, setSharedWithMeData] = useState<
		SharedWithMeListItemData[]
	>([]);
	const [isShareDialogVisible, setIsShareDialogVisible] = useState(false);
	const [isEditDialogVisible, setIsEditDialogVisible] = useState(false);
	const [editingShare, setEditingShare] = useState<ShareListItemData | null>(
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
	const sharedWithMeSectionRef = useRef<View>(null);

	// Confirmation dialog state
	const [confirmDialog, setConfirmDialog] = useState<{
		visible: boolean;
		title: string;
		message: string;
		confirmText: string;
		cancelText?: string;
		confirmStyle?: 'default' | 'destructive';
		onConfirm: () => void | Promise<void>;
	} | null>(null);

	// Convert Share entities to component-compatible format
	const convertShareToListItemData = (share: Share): ShareListItemData => {
		return {
			sharedWithId: share.sharedWithUserId,
			sharedWithEmail: share.sharedWithUserId,
			permission: share.permission.value,
		};
	};

	// Load shares data
	useEffect(() => {
		if (user?.id) {
			loadShares(user.id);
		}
	}, [user?.id, loadShares]);

	// Convert domain shares to UI data with proper user lookups
	useEffect(() => {
		const convertShares = async () => {
			const mySharesList = myShares.map(convertShareToListItemData);

			const sharedWithMeList = await Promise.all(
				sharedWithMe.map(async (share) => {
					try {
						const tracker = await trackerRepository.getById(
							share.trackerId
						);
						if (!tracker) {
							return {
								ownerId: share.trackerId,
								ownerName: 'Unknown User',
								ownerEmail: share.sharedWithUserId,
								permission: share.permission.value,
							};
						}

						const trackerCollection =
							watermelonDb.get<TrackerModel>('trackers');
						const trackerModels = await trackerCollection
							.query(Q.where('id', tracker.id))
							.fetch();
						const trackerModel = trackerModels[0];
						const ownerUserId = trackerModel?.userId || null;

						if (!ownerUserId) {
							logger.warn('Tracker owner userId not found', {
								trackerId: tracker.id,
							});
							return {
								ownerId: share.trackerId,
								ownerName: 'Unknown User',
								ownerEmail: share.sharedWithUserId,
								permission: share.permission.value,
							};
						}

						const ownerUser =
							await authRepository.getUserById(ownerUserId);
						if (!ownerUser) {
							logger.warn('Owner user not found', {
								ownerUserId,
							});
							return {
								ownerId: share.trackerId,
								ownerName: 'Unknown User',
								ownerEmail: share.sharedWithUserId,
								permission: share.permission.value,
							};
						}

						return {
							ownerId: share.trackerId,
							ownerName: ownerUser.name,
							ownerEmail: ownerUser.email.value,
							permission: share.permission.value,
						};
					} catch (error) {
						logger.error('Error loading shared with me data:', {
							error,
							shareId: share.id,
						});
						return {
							ownerId: share.trackerId,
							ownerName: 'Unknown User',
							ownerEmail: share.sharedWithUserId,
							permission: share.permission.value,
						};
					}
				})
			);

			setMySharesData(mySharesList);
			setSharedWithMeData(sharedWithMeList);
		};

		convertShares();
	}, [
		myShares,
		sharedWithMe,
		trackerRepository,
		authRepository,
		watermelonDb,
	]);

	useEffect(() => {
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
		const params = route.params as
			| { scrollToSection?: string; highlightWorkTrackId?: string }
			| undefined;
		if (
			params?.scrollToSection === 'sharedWithMe' &&
			sharedWithMeSectionRef.current
		) {
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
			setTimeout(() => setHighlightedWorkTrackId(null), 2000);
		}
	}, [route.params]);

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
		if (!shareEmail || !user?.id) {
			showAlert('Error', 'Please enter an email address');
			return;
		}

		try {
			const tracker = await manager.userManagement.getTrackerByOwnerId(
				user.id
			);
			if (!tracker) {
				showAlert(
					'Error',
					'No tracker found. Please ensure you have a valid tracker.'
				);
				return;
			}

			await shareTracker({
				trackerId: tracker.id,
				email: shareEmail,
				permission: sharePermission,
				userEmail: user.email,
				existingShareEmails: mySharesData.map((s) => s.sharedWithEmail),
			});

			showAlert('Success', 'Tracker shared successfully');
			setShareEmail('');
			setIsShareDialogVisible(false);
			if (user.id) {
				await loadShares(user.id);
			}
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
		}
	};

	const handleRemoveShare = (sharedWithId: string) => {
		const share = mySharesData.find((s) => s.sharedWithId === sharedWithId);
		if (!share) return;

		setConfirmDialog({
			visible: true,
			title: 'Remove Share',
			message: `Are you sure you want to remove sharing with ${share.ownerName ?? share.sharedWithEmail}?`,
			confirmText: 'Remove',
			confirmStyle: 'destructive',
			onConfirm: async () => {
				try {
					await removeShare(sharedWithId);
					if (user?.id) {
						await loadShares(user.id);
					}
					setConfirmDialog(null);
				} catch (error) {
					logger.error('Error removing share:', { error });
					setConfirmDialog(null);
					showAlert(
						'Error',
						'Failed to remove share. Please try again.'
					);
				}
			},
		});
	};

	const handleSetDefaultView = async (userId: string) => {
		try {
			await setDefaultView(userId);
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
			await clearDefaultView();
			await database.write(async () => {
				await database.unsafeResetDatabase();
			});
			dispatch(clearUser());
		} catch (error) {
			logger.error('Logout error:', { error });
			await AsyncStorage.removeItem('user');
			await clearDefaultView();
			await database.write(async () => {
				await database.unsafeResetDatabase();
			});
			dispatch(clearUser());
		}
	};

	const onRefresh = useCallback(async () => {
		setIsRefreshing(true);
		try {
			if (user?.id) {
				await loadShares(user.id);
			}
		} catch (error) {
			logger.error('Error refreshing:', { error });
		} finally {
			setIsRefreshing(false);
		}
	}, [loadShares, user?.id]);

	const handleEditPermission = (share: unknown) => {
		const shareData = share as ShareListItemData;
		setEditingShare(shareData);
		setSharePermission(shareData.permission);
		setIsEditDialogVisible(true);
	};

	const handleUpdatePermission = async () => {
		if (!editingShare) return;

		try {
			await updatePermission(editingShare.sharedWithId, sharePermission);
			showAlert('Success', 'Permission updated successfully');
			setIsEditDialogVisible(false);
			if (user?.id) {
				await loadShares(user.id);
			}
		} catch (error: unknown) {
			const errorMessage =
				error instanceof Error
					? error.message
					: 'Failed to update permission';
			showAlert('Error', errorMessage);
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
			loading={isSharingLoading}
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
			loading={isSharingLoading}
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
						onRefresh={onRefresh}
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
					<View style={styles.gapContainer}>
						{mySharesData.map((share) => (
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
					<View style={styles.gapContainer}>
						{sharedWithMeData.map((share) => (
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
							setConfirmDialog({
								visible: true,
								title: 'Clear App Data',
								message:
									'Are you sure you want to clear all app data? This action cannot be undone.',
								confirmText: 'Clear',
								confirmStyle: 'destructive',
								onConfirm: async () => {
									try {
										await clearAppData();
										setConfirmDialog(null);
										Alert.alert(
											'Success',
											'App data cleared successfully'
										);
									} catch {
										setConfirmDialog(null);
										Alert.alert(
											'Error',
											'Failed to clear app data'
										);
									}
								},
							});
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
							setConfirmDialog({
								visible: true,
								title: 'Logout',
								message: 'Are you sure you want to logout?',
								confirmText: 'Logout',
								confirmStyle: 'destructive',
								onConfirm: async () => {
									setConfirmDialog(null);
									await handleLogout();
								},
							});
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
			{confirmDialog && (
				<ConfirmDialog
					visible={confirmDialog.visible}
					title={confirmDialog.title}
					message={confirmDialog.message}
					confirmText={confirmDialog.confirmText}
					cancelText={confirmDialog.cancelText}
					confirmStyle={confirmDialog.confirmStyle}
					onCancel={() => setConfirmDialog(null)}
					onConfirm={confirmDialog.onConfirm}
				/>
			)}
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
	gapContainer: {
		gap: 16,
	},
});

export default ProfileScreen;
