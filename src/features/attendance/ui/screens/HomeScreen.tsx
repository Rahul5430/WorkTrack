import { useCallback, useEffect, useRef, useState } from 'react';
import {
	Animated,
	Easing,
	Image,
	Pressable,
	RefreshControl,
	ScrollView,
	StyleSheet,
	Text,
	View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { useDispatch, useSelector } from 'react-redux';

import { MainStackScreenProps } from '@/app/navigation/types';
import { AppDispatch, RootState } from '@/app/store';
import {
	addOrUpdateEntry,
	rollbackEntry,
	setError,
	setLoading,
	setWorkTrackData,
} from '@/app/store/reducers/workTrackSlice';
import type { CommonBottomSheetRef } from '@/features/attendance/ui/components';
import {
	Calendar,
	CommonBottomSheet,
	DayMarkingBottomSheet,
	Label,
	Summary,
	SyncErrorBanner,
	SyncStatusIndicator,
	WorkTrackSwitcher,
} from '@/features/attendance/ui/components';
import {
	useResponsiveLayout,
	useSharedWorkTracks,
	useWorkTrackManager,
} from '@/features/attendance/ui/hooks';
import { useDefaultView } from '@/features/sharing/ui/hooks';
import FocusAwareStatusBar from '@/shared/ui/components/FocusAwareStatusBar';
import { colors, fonts } from '@/shared/ui/theme';
import { logger } from '@/shared/utils/logging';
import { MarkedDayStatus } from '@/types';

const getDisplayName = (name: string, isOwnWorkTrack: boolean) => {
	if (isOwnWorkTrack) return 'My WorkTrack';
	const firstName = name.split(' ')[0];
	return `${firstName}'s WorkTrack`;
};

// Helper function to handle sync with appropriate timeout
const syncWithTimeout = async (
	manager: { triggerSync: () => Promise<void> },
	isInitialSync: boolean = false
) => {
	const timeoutMs = isInitialSync ? 60000 : 30000; // 60s for initial, 30s for manual
	const timeoutName = isInitialSync ? 'Initial sync' : 'Manual sync';

	logger.info(`Starting ${timeoutName.toLowerCase()}...`);
	const syncPromise = manager.triggerSync();
	const timeoutPromise = new Promise((_, reject) =>
		setTimeout(
			() =>
				reject(
					new Error(
						`${timeoutName} timeout after ${timeoutMs / 1000} seconds`
					)
				),
			timeoutMs
		)
	);

	await Promise.race([syncPromise, timeoutPromise]);
	logger.info(`${timeoutName} completed successfully`);
};

const HomeScreen: React.FC<MainStackScreenProps<'HomeScreen'>> = ({
	navigation,
}) => {
	const { RFValue } = useResponsiveLayout();
	const dispatch = useDispatch<AppDispatch>();
	const {
		error,
		loading,
		data: workTrackData,
	} = useSelector((state: RootState) => state.workTrack);
	const user = useSelector((state: RootState) => state.user.user);
	const { sharedWorkTracks, loading: sharedWorkTracksLoading } =
		useSharedWorkTracks();
	const { defaultViewUserId } = useDefaultView();
	const [currentWorkTrack, setCurrentWorkTrack] = useState<{
		id: string;
		name: string;
	} | null>(null);
	const dayMarkingSheetRef = useRef<CommonBottomSheetRef>(null);
	const workTrackSwitcherRef = useRef<CommonBottomSheetRef>(null);
	const [selectedDate, setSelectedDate] = useState<string | null>(null);
	const [selectedMonth, setSelectedMonth] = useState(new Date());
	const [isBottomSheetOpen, setIsBottomSheetOpen] = useState(false);
	const rotateAnim = useRef(new Animated.Value(0)).current;
	const manager = useWorkTrackManager();
	const isInitialMount = useRef(true);

	useEffect(() => {
		const initializeUser = async () => {
			if (!user?.id) return;

			logger.info('Initializing user', { userId: user.id });
			dispatch(setLoading(true));

			try {
				// Initialize user data - this handles new vs returning users properly
				const tracker = await manager.userManagement.initializeUserData(
					user.id
				);

				// Trigger sync to get latest data from remote with timeout
				await syncWithTimeout(manager, true);

				logger.info('User initialized successfully', {
					trackerId: tracker.id,
				});

				// Update currentWorkTrack with the tracker info
				setCurrentWorkTrack({
					id: tracker.id,
					name: tracker.name,
				});

				// Load entries for this tracker
				const entries = await manager.entry.getEntriesForTracker(
					tracker.id
				);
				const mappedEntries = entries.map((entry) => ({
					date: entry.date,
					status: entry.status as MarkedDayStatus,
					isAdvisory: entry.isAdvisory,
				}));

				dispatch(setWorkTrackData(mappedEntries));

				logger.info('User data loaded successfully', {
					trackerId: tracker.id,
					entryCount: entries.length,
				});
			} catch (initError) {
				logger.error('Failed to initialize user:', {
					error: initError,
				});
				dispatch(
					setError(
						initError instanceof Error
							? initError.message
							: 'Failed to initialize user'
					)
				);
			} finally {
				dispatch(setLoading(false));
				isInitialMount.current = false;
			}
		};

		initializeUser();
	}, [user?.id, dispatch, manager]);

	// Handle default view switching after initial load
	useEffect(() => {
		const loadDefaultView = async () => {
			if (!defaultViewUserId || !currentWorkTrack?.id) return;

			// Only switch if different from current and defaultViewUserId is a valid tracker
			if (currentWorkTrack.id !== defaultViewUserId) {
				// Check if defaultViewUserId corresponds to a shared tracker
				const defaultTrack = sharedWorkTracks.find(
					(track) => track.id === defaultViewUserId
				);
				if (defaultTrack) {
					setCurrentWorkTrack({
						id: defaultTrack.id,
						name: defaultTrack.ownerName,
					});
					logger.info('Switched to default view', {
						trackerId: defaultTrack.id,
					});
				}
			}
		};

		loadDefaultView();
	}, [defaultViewUserId, currentWorkTrack?.id, sharedWorkTracks]);

	// Load entries when currentWorkTrack changes (after initial mount)
	useEffect(() => {
		const loadCurrentTrackerEntries = async () => {
			if (isInitialMount.current || !currentWorkTrack?.id) return;

			try {
				const entries = await manager.entry.getEntriesForTracker(
					currentWorkTrack.id
				);
				const mappedEntries = entries.map((entry) => ({
					date: entry.date,
					status: entry.status as MarkedDayStatus,
					isAdvisory: entry.isAdvisory,
				}));

				dispatch(setWorkTrackData(mappedEntries));
				logger.info('Loaded entries for tracker', {
					trackerId: currentWorkTrack.id,
					entryCount: entries.length,
				});
			} catch (entriesError) {
				logger.error('Failed to load tracker entries:', {
					error: entriesError,
				});
			}
		};

		loadCurrentTrackerEntries();
	}, [currentWorkTrack?.id, manager, dispatch]);

	const handleDayMarkingSheetChanges = useCallback((index: number) => {
		setIsBottomSheetOpen(index !== -1);
		if (index === -1) {
			setSelectedDate(null);
		}
	}, []);

	const handlePressIn = useCallback(() => {
		// Animate on press for opening
		Animated.timing(rotateAnim, {
			toValue: 1,
			duration: 400,
			useNativeDriver: true,
			easing: Easing.bezier(0.4, 0.0, 0.2, 1),
		}).start();
	}, [rotateAnim]);

	const handleCloseAnimation = useCallback(() => {
		// Animate when closing
		Animated.timing(rotateAnim, {
			toValue: 0,
			duration: 400,
			useNativeDriver: true,
			easing: Easing.bezier(0.4, 0.0, 0.2, 1),
		}).start();
	}, [rotateAnim]);

	const onDatePress = useCallback((date: string) => {
		// Update state and bottom sheet in a single render cycle
		requestAnimationFrame(() => {
			setSelectedDate(date);
			dayMarkingSheetRef.current?.expand();
		});
	}, []);

	const handleWorkTrackSelect = async (workTrackId: string) => {
		try {
			const workTrack = sharedWorkTracks.find(
				(track) => track.id === workTrackId
			);
			if (workTrack) {
				setCurrentWorkTrack({
					id: workTrack.id,
					name: workTrack.ownerName,
				});
				workTrackSwitcherRef.current?.close();
			}
		} catch (switchError) {
			logger.error('Error switching worktrack:', { error: switchError });
		}
	};

	const onRefresh = useCallback(async () => {
		dispatch(setLoading(true));
		try {
			// Add a small delay to ensure JSI bridge is ready
			await new Promise((resolve) => setTimeout(resolve, 100));

			// Trigger sync to get latest data with timeout
			await syncWithTimeout(manager, false);

			// Always ensure we have the current tracker and load its data
			if (user?.id) {
				const tracker =
					await manager.userManagement.ensureUserHasTracker(user.id);

				if (tracker) {
					// Update currentWorkTrack if it's not set or different
					if (
						!currentWorkTrack?.id ||
						currentWorkTrack.id !== tracker.id
					) {
						setCurrentWorkTrack({
							id: tracker.id,
							name: tracker.name,
						});
					}

					// Load entries for this tracker
					const entries = await manager.entry.getEntriesForTracker(
						tracker.id
					);

					const refreshEntries = entries.map((entry) => ({
						date: entry.date,
						status: entry.status as MarkedDayStatus,
						isAdvisory: entry.isAdvisory,
					}));

					dispatch(setWorkTrackData(refreshEntries));
				} else {
					dispatch(setError('Failed to load tracker'));
				}
			}
		} catch (refreshError) {
			logger.error('Error syncing data:', { error: refreshError });
			const errorMessage =
				refreshError instanceof Error
					? refreshError.message
					: 'Failed to sync data';

			dispatch(setError(errorMessage));

			// Show error toast for better user feedback
			logger.warn('Sync failed during refresh:', { error: refreshError });
		} finally {
			// Always ensure loading state is cleared
			dispatch(setLoading(false));
		}
	}, [dispatch, currentWorkTrack?.id, user?.id, manager]);

	const resolveTrackerId = async (): Promise<string> => {
		// If no tracker is loaded yet, ensure we have one
		if (!currentWorkTrack?.id && user?.id) {
			const tracker = await manager.userManagement.ensureUserHasTracker(
				user.id
			);
			setCurrentWorkTrack({
				id: tracker.id,
				name: tracker.name,
			});
			return tracker.id;
		}

		if (!currentWorkTrack?.id) {
			throw new Error('No tracker available');
		}

		// If currentWorkTrack.id is a user ID, resolve to actual tracker
		if (currentWorkTrack.id === user?.id) {
			const tracker = await manager.userManagement.getTrackerByOwnerId(
				currentWorkTrack.id
			);
			if (!tracker) {
				throw new Error('No tracker found for user');
			}

			// Update state with resolved tracker info
			setCurrentWorkTrack({
				id: tracker.id,
				name: tracker.name,
			});

			return tracker.id;
		}

		return currentWorkTrack.id;
	};

	const handleSave = async (status: MarkedDayStatus, isAdvisory: boolean) => {
		if (selectedDate === null) {
			dispatch(setError('No date selected'));
			return;
		}

		try {
			dispatch(setError(null));

			// Optimistic update in Redux
			dispatch(
				addOrUpdateEntry({ date: selectedDate, status, isAdvisory })
			);

			// Close the sheet immediately for better UX
			dayMarkingSheetRef.current?.close();

			// Handle async operations in the background
			const trackerId = await resolveTrackerId();

			// Save to WatermelonDB using the new service
			await manager.entry.createOrUpdateEntry({
				trackerId,
				date: selectedDate,
				status,
				isAdvisory,
			});

			// Trigger sync to send to Firebase (non-blocking)
			manager.triggerSync().catch((syncError) => {
				logger.error('Background sync failed:', { syncError });
				// Optionally show a non-blocking error indicator
			});
		} catch (saveError) {
			logger.error('Error saving work status:', { error: saveError });
			dispatch(
				setError(
					saveError instanceof Error
						? saveError.message
						: 'Failed to save work status'
				)
			);
			dispatch(rollbackEntry(selectedDate));
		}
	};

	const handleMonthChange = useCallback((date: Date) => {
		setSelectedMonth(date);
	}, []);

	return (
		<SafeAreaView style={styles.screen}>
			<SyncErrorBanner onSyncComplete={onRefresh} />
			<FocusAwareStatusBar
				barStyle='dark-content'
				translucent
				backgroundColor='transparent'
			/>
			<ScrollView
				style={styles.scrollView}
				contentContainerStyle={styles.scrollContent}
				scrollEnabled={!isBottomSheetOpen}
				refreshControl={
					<RefreshControl
						refreshing={loading}
						onRefresh={onRefresh}
						colors={[colors.office]}
						tintColor={colors.office}
					/>
				}
			>
				<View style={styles.header}>
					<Pressable
						onPress={() => workTrackSwitcherRef.current?.expand()}
						onPressIn={handlePressIn}
						style={({ pressed }) => [
							styles.titleContainer,
							pressed && styles.titleContainerPressed,
						]}
					>
						<View style={styles.titleContent}>
							<Text
								style={[
									styles.headerText,
									{
										fontSize: RFValue(20),
									},
								]}
							>
								{currentWorkTrack?.name
									? getDisplayName(
											currentWorkTrack.name,
											true // Always show as own work track for now, can be enhanced later for shared trackers
										)
									: 'My WorkTrack'}
							</Text>
							<Animated.View
								style={[
									styles.chevronContainer,
									{
										transform: [
											{
												rotate: rotateAnim.interpolate({
													inputRange: [0, 1],
													outputRange: [
														'0deg',
														'180deg',
													],
												}),
											},
										],
									},
								]}
							>
								<MaterialCommunityIcons
									name='chevron-down'
									size={24}
									color={colors.text.primary}
									style={styles.chevronIcon}
								/>
							</Animated.View>
						</View>
					</Pressable>

					<View style={styles.headerActions}>
						<View style={styles.profileButtonContainer}>
							<Pressable
								onPress={() =>
									navigation.navigate('ProfileScreen', {})
								}
								style={({ pressed }) => [
									styles.profileButton,
									pressed && { opacity: 0.8 },
								]}
							>
								{user?.photo ? (
									<Image
										source={{ uri: user.photo }}
										style={styles.profileImage}
									/>
								) : (
									<View style={styles.profilePlaceholder}>
										<Text
											style={
												styles.profilePlaceholderText
											}
										>
											{user?.name?.[0]?.toUpperCase() ??
												'?'}
										</Text>
									</View>
								)}
							</Pressable>
							<View
								style={styles.syncBadgeContainer}
								pointerEvents='none'
							>
								<View style={styles.syncBadge}>
									<SyncStatusIndicator isSyncing={loading} />
								</View>
							</View>
						</View>
					</View>
				</View>
				{error && <Text style={styles.errorText}>{error}</Text>}
				<Calendar
					onDatePress={onDatePress}
					onMonthChange={handleMonthChange}
				/>
				<Label />
				<Summary selectedMonth={selectedMonth} />
			</ScrollView>

			<CommonBottomSheet
				ref={dayMarkingSheetRef}
				onChange={handleDayMarkingSheetChanges}
				snapPoints={['40%']}
			>
				{selectedDate &&
					(() => {
						const items = workTrackData as Array<{
							date: string;
							status: MarkedDayStatus;
							isAdvisory?: boolean;
						}>;
						const entry = items.find(
							(e) => e.date === selectedDate
						);
						return (
							<DayMarkingBottomSheet
								selectedDate={selectedDate}
								onSave={handleSave}
								onCancel={() =>
									dayMarkingSheetRef.current?.close()
								}
								initialStatus={entry?.status}
								initialIsAdvisory={entry?.isAdvisory ?? false}
							/>
						);
					})()}
			</CommonBottomSheet>

			<CommonBottomSheet
				ref={workTrackSwitcherRef}
				snapPoints={['50%']}
				onBackdropPress={handleCloseAnimation}
				onClose={handleCloseAnimation}
			>
				<WorkTrackSwitcher
					sharedWorkTracks={sharedWorkTracks}
					loading={sharedWorkTracksLoading}
					onWorkTrackSelect={handleWorkTrackSelect}
					currentWorkTrackId={currentWorkTrack?.id}
					defaultWorkTrackId={user?.id}
				/>
			</CommonBottomSheet>
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
	scrollContent: {
		flexGrow: 1,
	},
	header: {
		flexDirection: 'row',
		justifyContent: 'space-between',
		alignItems: 'center',
		paddingHorizontal: 20,
		paddingVertical: 10,
	},
	titleContainer: {
		flexDirection: 'row',
		alignItems: 'center',
	},
	titleContent: {
		flexDirection: 'row',
		alignItems: 'center',
	},
	titleContainerPressed: {
		opacity: 0.7,
	},
	headerText: {
		fontFamily: fonts.PoppinsMedium,
		color: colors.text.primary,
	},
	chevronContainer: {
		width: 24,
		height: 24,
		justifyContent: 'center',
		alignItems: 'center',
		transform: [{ translateX: -12 }],
	},
	chevronIcon: {
		width: 24,
		height: 24,
		textAlign: 'center',
		textAlignVertical: 'center',
	},
	profileButton: {
		width: 40,
		height: 40,
		borderRadius: 20,
		overflow: 'hidden',
	},
	profileImage: {
		width: '100%',
		height: '100%',
	},
	profilePlaceholder: {
		width: '100%',
		height: '100%',
		backgroundColor: colors.ui.gray[200],
		justifyContent: 'center',
		alignItems: 'center',
	},
	profilePlaceholderText: {
		fontFamily: fonts.PoppinsMedium,
		color: colors.text.secondary,
		fontSize: 18,
	},
	errorText: {
		color: colors.error,
		fontFamily: fonts.PoppinsMedium,
		textAlign: 'center',
		marginVertical: 10,
	},
	headerActions: {
		flexDirection: 'row',
		alignItems: 'center',
	},
	syncBadgeContainer: {
		position: 'absolute',
		left: -6,
		bottom: -6,
		zIndex: 10,
	},
	syncBadge: {
		width: 22,
		height: 22,
		borderRadius: 11,
		alignItems: 'center',
		justifyContent: 'center',
		backgroundColor: 'white',
		borderWidth: 2,
		borderColor: 'white',
		padding: 0,
	},
	profileButtonContainer: {
		position: 'relative',
		width: 40,
		height: 40,
	},
});

export default HomeScreen;
