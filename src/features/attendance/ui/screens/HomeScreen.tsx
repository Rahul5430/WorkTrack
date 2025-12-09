import MaterialDesignIcons from '@react-native-vector-icons/material-design-icons';
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

const syncWithTimeout = async (
	manager: { triggerSync: () => Promise<void> },
	isInitialSync: boolean = false
) => {
	const timeoutMs = isInitialSync ? 60000 : 30000;
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
	const [dayMarkingSheetIndex, setDayMarkingSheetIndex] = useState(-1);
	const [workTrackSwitcherIndex, setWorkTrackSwitcherIndex] = useState(-1);
	const rotateAnim = useRef(new Animated.Value(0)).current;
	const manager = useWorkTrackManager();
	const isInitialMount = useRef(true);
	const sheetInteractionRef = useRef<'idle' | 'opening' | 'closing'>('idle');
	const lastSelectedDateRef = useRef<string | null>(null);

	useEffect(() => {
		const initializeUser = async () => {
			if (!user?.id) return;

			logger.info('Initializing user', { userId: user.id });
			dispatch(setLoading(true));

			try {
				const tracker = await manager.userManagement.initializeUserData(
					user.id
				);

				await syncWithTimeout(manager, true);

				logger.info('User initialized successfully', {
					trackerId: tracker.id,
				});

				setCurrentWorkTrack({
					id: tracker.id,
					name: tracker.name,
				});

				const entries = await manager.entry.getEntriesForTracker(
					tracker.id
				);
				const mappedEntries = entries.map((entry) => ({
					date: entry.date,
					status: entry.status as MarkedDayStatus,
					isAdvisory: Boolean(entry.isAdvisory),
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

	useEffect(() => {
		const loadDefaultView = async () => {
			if (!defaultViewUserId || !currentWorkTrack?.id) return;

			if (currentWorkTrack.id !== defaultViewUserId) {
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
					isAdvisory: Boolean(entry.isAdvisory),
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

	const handlePressIn = useCallback(() => {
		Animated.timing(rotateAnim, {
			toValue: 1,
			duration: 400,
			useNativeDriver: true,
			easing: Easing.bezier(0.4, 0.0, 0.2, 1),
		}).start();
	}, [rotateAnim]);

	const handleCloseAnimation = useCallback(() => {
		setWorkTrackSwitcherIndex(-1);
		Animated.timing(rotateAnim, {
			toValue: 0,
			duration: 400,
			useNativeDriver: true,
			easing: Easing.bezier(0.4, 0.0, 0.2, 1),
		}).start();
	}, [rotateAnim]);

	const handleDayMarkingSheetChanges = useCallback((index: number) => {
		setDayMarkingSheetIndex(index);
		setIsBottomSheetOpen(index !== -1);

		if (index === -1) {
			if (sheetInteractionRef.current !== 'opening') {
				sheetInteractionRef.current = 'closing';
				setTimeout(() => {
					if (sheetInteractionRef.current === 'closing') {
						setSelectedDate((prevDate) => {
							if (
								prevDate !== null &&
								prevDate === lastSelectedDateRef.current
							) {
								lastSelectedDateRef.current = null;
								sheetInteractionRef.current = 'idle';
								return null;
							}
							sheetInteractionRef.current = 'idle';
							return prevDate;
						});
					}
				}, 100);
			}
		} else {
			sheetInteractionRef.current = 'idle';
		}
	}, []);

	const handleWorkTrackSwitcherChanges = useCallback(
		(index: number) => {
			setWorkTrackSwitcherIndex(index);
			if (index === -1) {
				handleCloseAnimation();
			}
		},
		[handleCloseAnimation]
	);

	useEffect(() => {
		const interactionState = sheetInteractionRef.current;

		if (interactionState === 'closing') {
			return;
		}

		if (selectedDate) {
			const isNewDate = lastSelectedDateRef.current !== selectedDate;

			if (isNewDate) {
				lastSelectedDateRef.current = selectedDate;
			}

			if (dayMarkingSheetIndex === -1 || isNewDate) {
				sheetInteractionRef.current = 'opening';
				setDayMarkingSheetIndex(0);
			}
		} else {
			if (dayMarkingSheetIndex !== -1) {
				setDayMarkingSheetIndex(-1);
			}
			lastSelectedDateRef.current = null;
		}
	}, [selectedDate, dayMarkingSheetIndex]);

	const onDatePress = useCallback((date: string) => {
		sheetInteractionRef.current = 'opening';
		lastSelectedDateRef.current = date;
		setSelectedDate(date);
		setDayMarkingSheetIndex(0);
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
				setWorkTrackSwitcherIndex(-1);
			}
		} catch (switchError) {
			logger.error('Error switching worktrack:', { error: switchError });
		}
	};

	const onRefresh = useCallback(async () => {
		dispatch(setLoading(true));
		try {
			await new Promise((resolve) => setTimeout(resolve, 100));

			await syncWithTimeout(manager, false);

			if (user?.id) {
				const tracker =
					await manager.userManagement.ensureUserHasTracker(user.id);

				if (tracker) {
					if (
						!currentWorkTrack?.id ||
						currentWorkTrack.id !== tracker.id
					) {
						setCurrentWorkTrack({
							id: tracker.id,
							name: tracker.name,
						});
					}

					const entries = await manager.entry.getEntriesForTracker(
						tracker.id
					);

					const refreshEntries = entries.map((entry) => ({
						date: entry.date,
						status: entry.status as MarkedDayStatus,
						isAdvisory: Boolean(entry.isAdvisory),
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

			logger.warn('Sync failed during refresh:', { error: refreshError });
		} finally {
			dispatch(setLoading(false));
		}
	}, [dispatch, currentWorkTrack?.id, user?.id, manager]);

	const resolveTrackerId = async (): Promise<string> => {
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

		if (currentWorkTrack.id === user?.id) {
			const tracker = await manager.userManagement.getTrackerByOwnerId(
				currentWorkTrack.id
			);
			if (!tracker) {
				throw new Error('No tracker found for user');
			}

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

			dispatch(
				addOrUpdateEntry({ date: selectedDate, status, isAdvisory })
			);

			setSelectedDate(null);
			setDayMarkingSheetIndex(-1);

			const trackerId = await resolveTrackerId();

			await manager.entry.createOrUpdateEntry({
				trackerId,
				date: selectedDate,
				status,
				isAdvisory,
			});

			manager.triggerSync().catch((syncError) => {
				logger.error('Background sync failed:', { syncError });
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
						onPress={() => setWorkTrackSwitcherIndex(0)}
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
											true
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
								<MaterialDesignIcons
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
				index={dayMarkingSheetIndex}
				onChange={handleDayMarkingSheetChanges}
				snapPoints={['45%']}
				onBackdropPress={() => {
					setSelectedDate(null);
					setDayMarkingSheetIndex(-1);
				}}
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
								onCancel={() => {
									setSelectedDate(null);
									setDayMarkingSheetIndex(-1);
								}}
								initialStatus={entry?.status}
								initialIsAdvisory={entry?.isAdvisory ?? false}
							/>
						);
					})()}
			</CommonBottomSheet>

			<CommonBottomSheet
				ref={workTrackSwitcherRef}
				index={workTrackSwitcherIndex}
				onChange={handleWorkTrackSwitcherChanges}
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
