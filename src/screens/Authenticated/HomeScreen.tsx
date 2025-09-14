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

import type { CommonBottomSheetRef } from '../../components';
import {
	Calendar,
	CommonBottomSheet,
	DayMarkingBottomSheet,
	FocusAwareStatusBar,
	Label,
	Summary,
	SyncErrorBanner,
	SyncStatusIndicator,
	WorkTrackSwitcher,
} from '../../components';
import {
	useResponsiveLayout,
	useSharedWorkTracks,
	useWorkTrackManager,
} from '../../hooks';
import { logger } from '../../logging';
import { AppDispatch, RootState } from '../../store';
import {
	addOrUpdateEntry,
	rollbackEntry,
	setError,
	setLoading,
	setWorkTrackData,
} from '../../store/reducers/workTrackSlice';
import { colors, fonts } from '../../themes';
import { AuthenticatedStackScreenProps, MarkedDayStatus } from '../../types';

const getDisplayName = (name: string, isOwnWorkTrack: boolean) => {
	if (isOwnWorkTrack) return 'My WorkTrack';
	const firstName = name.split(' ')[0];
	return `${firstName}'s WorkTrack`;
};

const HomeScreen: React.FC<AuthenticatedStackScreenProps<'HomeScreen'>> = ({
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
	const [currentWorkTrack, setCurrentWorkTrack] = useState<{
		id: string;
		name: string;
	} | null>(null);
	const dayMarkingSheetRef = useRef<CommonBottomSheetRef>(null);
	const workTrackSwitcherRef = useRef<CommonBottomSheetRef>(null);
	const [selectedDate, setSelectedDate] = useState<string | null>(null);
	const [selectedMonth, setSelectedMonth] = useState(new Date());
	const rotateAnim = useRef(new Animated.Value(0)).current;
	const manager = useWorkTrackManager();

	useEffect(() => {
		const loadData = async () => {
			logger.debug('loadData - user ID:', { userId: user?.id });
			logger.debug('loadData - tracker:', { workTrackData });
			if (!user?.id) return;

			dispatch(setLoading(true));
			try {
				// Check and fix any records without trackerId (from old schema)
				try {
					await manager.userManagement.checkAndFixRecordsWithoutTrackerId();
				} catch (error) {
					logger.warn('Error checking records, continuing anyway:', {
						error,
					});
				}

				// FIRST: Sync from Firebase to get any existing trackers
				logger.info('HomeScreen: Syncing from Firebase first...');
				try {
					await manager.syncFromRemote();
					logger.info('HomeScreen: Firebase sync completed');
				} catch (syncError) {
					logger.warn(
						'Firebase sync failed, continuing with local data:',
						{ syncError }
					);
				}

				// SECOND: Now check for existing tracker after sync
				const tracker =
					await manager.userManagement.ensureUserHasTracker(user.id);

				if (tracker) {
					logger.info(
						'HomeScreen: Found existing tracker after sync:',
						{ trackerId: tracker.id }
					);
					// Update currentWorkTrack with the correct tracker ID and name
					setCurrentWorkTrack({
						id: tracker.id,
						name: tracker.name,
					});

					// Get all entries for this tracker using the service
					const entries = await manager.entry.getEntriesForTracker(
						tracker.id
					);

					const workTrackData = entries.map((entry) => ({
						date: entry.date,
						status: entry.status as MarkedDayStatus,
						isAdvisory: entry.isAdvisory,
					}));

					dispatch(setWorkTrackData(workTrackData));
				} else {
					logger.warn(
						'HomeScreen: Failed to ensure user has tracker'
					);
					dispatch(setError('Failed to load or create tracker'));
				}

				// Note: No need to call triggerSync() here since we already synced from Firebase
				// and any new tracker creation will be synced to Firebase on the next periodic sync
			} catch (error) {
				logger.error('Error loading data:', { error });
				dispatch(
					setError(
						error instanceof Error
							? error.message
							: 'Failed to load data'
					)
				);
			} finally {
				dispatch(setLoading(false));
			}
		};

		loadData();
	}, [user?.id, dispatch]);

	const handleDayMarkingSheetChanges = useCallback((index: number) => {
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
		} catch (error) {
			logger.error('Error switching worktrack:', { error });
		}
	};

	const onRefresh = useCallback(async () => {
		dispatch(setLoading(true));
		try {
			// Add a small delay to ensure JSI bridge is ready
			await new Promise((resolve) => setTimeout(resolve, 100));

			// Trigger sync to get latest data
			await manager.triggerSync();

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

					const workTrackData = entries.map((entry) => ({
						date: entry.date,
						status: entry.status as MarkedDayStatus,
						isAdvisory: entry.isAdvisory,
					}));

					dispatch(setWorkTrackData(workTrackData));
				} else {
					dispatch(setError('Failed to load tracker'));
				}
			}
		} catch (error) {
			logger.error('Error syncing data:', { error });
			dispatch(
				setError(
					error instanceof Error
						? error.message
						: 'Failed to sync data'
				)
			);
		} finally {
			dispatch(setLoading(false));
		}
	}, [dispatch, currentWorkTrack?.id, user?.id]);

	const resolveTrackerId = async (): Promise<string> => {
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
			dispatch(setLoading(true));
			dispatch(setError(null));

			// Optimistic update in Redux
			dispatch(
				addOrUpdateEntry({ date: selectedDate, status, isAdvisory })
			);

			// Resolve tracker ID
			const trackerId = await resolveTrackerId();

			// Save to WatermelonDB using the new service
			await manager.entry.createOrUpdateEntry({
				trackerId,
				date: selectedDate,
				status,
				isAdvisory,
			});

			// Trigger sync to send to Firebase
			await manager.triggerSync();

			dayMarkingSheetRef.current?.close();
		} catch (error) {
			logger.error('Error saving work status:', { error });
			dispatch(
				setError(
					error instanceof Error
						? error.message
						: 'Failed to save work status'
				)
			);
			dispatch(rollbackEntry(selectedDate));
		} finally {
			dispatch(setLoading(false));
		}
	};

	const handleMonthChange = useCallback((date: Date) => {
		setSelectedMonth(date);
	}, []);

	return (
		<SafeAreaView style={styles.screen}>
			<SyncErrorBanner />
			<FocusAwareStatusBar
				barStyle='dark-content'
				translucent
				backgroundColor='transparent'
			/>
			<ScrollView
				style={styles.scrollView}
				contentContainerStyle={styles.scrollContent}
				scrollEnabled={!selectedDate}
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
						<View
							style={{
								position: 'relative',
								width: 40,
								height: 40,
							}}
						>
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
								<SyncStatusIndicator style={styles.syncBadge} />
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
						const entry = workTrackData.find(
							(e) => e.date === selectedDate
						);
						return (
							<DayMarkingBottomSheet
								selectedDate={selectedDate}
								onSave={handleSave}
								loading={loading}
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
});

export default HomeScreen;
