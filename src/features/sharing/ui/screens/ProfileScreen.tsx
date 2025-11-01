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

import { MainStackScreenProps } from '@/app/navigation/types';
import { useDI } from '@/app/providers';
import {
	AppDispatch,
	clearUser,
	RootState,
	setWorkTrackLoading,
} from '@/app/store';
import { SharingServiceIdentifiers } from '@/features/sharing/di';
import { Permission } from '@/features/sharing/domain/entities/Permission';
import { Share } from '@/features/sharing/domain/entities/Share';
import {
	GetMySharesUseCase,
	GetSharedWithMeUseCase,
	ShareTrackerUseCase,
	UnshareTrackerUseCase,
	UpdatePermissionUseCase,
} from '@/features/sharing/domain/use-cases';
import ProfileInfo from '@/features/sharing/ui/components/ProfileInfo';
import ScreenHeader from '@/features/sharing/ui/components/ScreenHeader';
import SharedWithMeListItem from '@/features/sharing/ui/components/SharedWithMeListItem';
import ShareListItem from '@/features/sharing/ui/components/ShareListItem';
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

// Share validation utility
class ShareValidationUtils {
	static validateShareRequest(
		email: string,
		currentUserEmail?: string,
		existingShares: ShareListItemData[] = []
	): void {
		if (!email || email.trim().length === 0) {
			throw new Error('Email address is required');
		}

		const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
		if (!emailRegex.test(email)) {
			throw new Error('Please enter a valid email address');
		}

		if (email.toLowerCase() === currentUserEmail?.toLowerCase()) {
			throw new Error('You cannot share with yourself');
		}

		const normalizedEmail = email.toLowerCase().trim();
		const alreadyShared = existingShares.some(
			(share) => share.sharedWithEmail.toLowerCase() === normalizedEmail
		);

		if (alreadyShared) {
			throw new Error('You have already shared with this user');
		}
	}
}

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

const DEFAULT_VIEW_USER_ID_KEY = 'defaultViewUserId';

const ProfileScreen: React.FC<MainStackScreenProps<'ProfileScreen'>> = ({
	navigation,
	route,
}) => {
	const { RFValue } = useResponsiveLayout();
	const dispatch = useDispatch<AppDispatch>();
	const container = useDI();
	const user = useSelector((state: RootState) => state.user.user);
	const { loading } = useSelector((state: RootState) => state.workTrack);

	const [mySharesData, setMySharesData] = useState<ShareListItemData[]>([]);
	const [sharedWithMeData, setSharedWithMeData] = useState<
		SharedWithMeListItemData[]
	>([]);
	const [defaultViewUserId, setDefaultViewUserId] = useState<string | null>(
		null
	);
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

	// Get use cases from DI container
	const getMySharesUseCase = container.resolve<GetMySharesUseCase>(
		SharingServiceIdentifiers.GET_MY_SHARES
	);
	const getSharedWithMeUseCase = container.resolve<GetSharedWithMeUseCase>(
		SharingServiceIdentifiers.GET_SHARED_WITH_ME
	);
	const shareTrackerUseCase = container.resolve<ShareTrackerUseCase>(
		SharingServiceIdentifiers.SHARE_TRACKER
	);
	const updatePermissionUseCase = container.resolve<UpdatePermissionUseCase>(
		SharingServiceIdentifiers.UPDATE_PERMISSION
	);
	const unshareTrackerUseCase = container.resolve<UnshareTrackerUseCase>(
		SharingServiceIdentifiers.UNSHARE_TRACKER
	);

	// Convert Share entities to component-compatible format
	const convertShareToListItemData = (
		share: Share,
		userEmail?: string
	): ShareListItemData => {
		return {
			sharedWithId: share.sharedWithUserId,
			sharedWithEmail: userEmail || share.sharedWithUserId,
			permission: share.permission.value,
		};
	};

	const convertShareToSharedWithMeData = (
		share: Share,
		ownerName: string,
		ownerEmail: string
	): SharedWithMeListItemData => {
		return {
			ownerId: share.trackerId, // Tracker ID represents the owner's tracker
			ownerName,
			ownerEmail,
			permission: share.permission.value,
		};
	};

	const loadShares = useCallback(async () => {
		if (!user?.id) return;

		try {
			const [myShares, sharedWithMe] = await Promise.all([
				getMySharesUseCase.execute(user.id),
				getSharedWithMeUseCase.execute(user.id),
			]);

			// Convert to component format
			const mySharesList = myShares.map((share) =>
				convertShareToListItemData(share)
			);

			// For shared with me, we need owner info - for now using IDs
			// This would ideally come from user repository or share repository
			const sharedWithMeList = sharedWithMe.map((share, index) =>
				convertShareToSharedWithMeData(
					share,
					`User ${index + 1}`, // Placeholder - would need owner lookup
					share.sharedWithUserId // Placeholder
				)
			);

			setMySharesData(mySharesList);
			setSharedWithMeData(sharedWithMeList);
		} catch (error) {
			logger.error('Failed to load shares', { error });
		}
	}, [user?.id, getMySharesUseCase, getSharedWithMeUseCase]);

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
	}, [loadShares]);

	useEffect(() => {
		const loadDefaultView = async () => {
			try {
				const userId = await AsyncStorage.getItem(
					DEFAULT_VIEW_USER_ID_KEY
				);
				setDefaultViewUserId(userId);
			} catch (error) {
				logger.error('Failed to load default view user ID', { error });
			}
		};
		loadDefaultView();
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
			ShareValidationUtils.validateShareRequest(
				shareEmail,
				user.email,
				mySharesData
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
			dispatch(setWorkTrackLoading(true));

			// Create a Share entity
			// Note: We need the tracker ID - for now using user's tracker
			// This should come from useWorkTrackManager once it's implemented
			const trackerId = user.id; // Placeholder - should get actual tracker ID

			const share = new Share(
				'', // ID will be generated by repository
				trackerId,
				shareEmail.toLowerCase(),
				new Permission(sharePermission)
			);

			await shareTrackerUseCase.execute(share);
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
			dispatch(setWorkTrackLoading(false));
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
					await unshareTrackerUseCase.execute(sharedWithId);
					loadShares();
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
			const currentDefaultView = await AsyncStorage.getItem(
				DEFAULT_VIEW_USER_ID_KEY
			);
			const newDefaultView =
				currentDefaultView === userId ? null : userId;

			if (newDefaultView) {
				await AsyncStorage.setItem(
					DEFAULT_VIEW_USER_ID_KEY,
					newDefaultView
				);
			} else {
				await AsyncStorage.removeItem(DEFAULT_VIEW_USER_ID_KEY);
			}

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
			await AsyncStorage.removeItem(DEFAULT_VIEW_USER_ID_KEY);
			await database.write(async () => {
				await database.unsafeResetDatabase();
			});
			dispatch(clearUser());
		} catch (error) {
			logger.error('Logout error:', { error });
			await AsyncStorage.removeItem('user');
			await AsyncStorage.removeItem(DEFAULT_VIEW_USER_ID_KEY);
			await database.write(async () => {
				await database.unsafeResetDatabase();
			});
			dispatch(clearUser());
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
	}, [loadShares]);

	const handleEditPermission = (share: unknown) => {
		const shareData = share as ShareListItemData;
		setEditingShare(shareData);
		setSharePermission(shareData.permission);
		setIsEditDialogVisible(true);
	};

	const handleUpdatePermission = async () => {
		if (!editingShare) return;

		try {
			dispatch(setWorkTrackLoading(true));
			await updatePermissionUseCase.execute(
				editingShare.sharedWithId,
				new Permission(sharePermission)
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
			dispatch(setWorkTrackLoading(false));
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
