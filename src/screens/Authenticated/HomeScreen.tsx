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

import CalendarComponent from '../../components/Calendar';
import CommonBottomSheet, {
	CommonBottomSheetRef,
} from '../../components/CommonBottomSheet';
import DayMarkingBottomSheet from '../../components/DayMarkingBottomSheet';
import FocusAwareStatusBar from '../../components/FocusAwareStatusBar';
import Label from '../../components/Label';
import Summary from '../../components/Summary';
import { SyncErrorBanner } from '../../components/SyncErrorBanner';
import { SyncStatusIndicator } from '../../components/SyncStatusIndicator';
import WorkTrackSwitcher from '../../components/WorkTrackSwitcher';
import { WorkTrack } from '../../db/watermelon';
import { useResponsiveLayout } from '../../hooks/useResponsive';
import { useSharedWorkTracks } from '../../hooks/useSharedWorkTracks';
import SyncService from '../../services/sync';
import WatermelonService from '../../services/watermelon';
import {
	addOrUpdateEntry,
	rollbackEntry,
	setError,
	setLoading,
	setWorkTrackData,
} from '../../store/reducers/workTrackSlice';
import { AppDispatch, RootState } from '../../store/store';
import { fonts } from '../../themes';
import { colors } from '../../themes/colors';
import { MarkedDayStatus } from '../../types/calendar';
import { AuthenticatedStackScreenProps } from '../../types/navigation';

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

	useEffect(() => {
		// Start periodic sync
		const syncService = SyncService.getInstance();
		syncService.startPeriodicSync();

		// Load initial work track - we'll set this properly in the data loading effect
		// Don't set currentWorkTrack here, let the data loading effect handle it
		console.log('HomeScreen: Initializing with user:', user?.id);

		return () => {
			syncService.stopPeriodicSync();
		};
	}, [user]);

	// Add a new effect to handle data loading when user changes
	useEffect(() => {
		const loadData = async () => {
			console.log('loadData - user ID:', user?.id);
			console.log('loadData - tracker:', workTrackData);
			if (!user?.id) return;

			dispatch(setLoading(true));
			try {
				// Add a small delay to ensure JSI bridge is ready
				await new Promise((resolve) => setTimeout(resolve, 100));

				// Check and fix any records without trackerId (from old schema)
				const watermelonService = WatermelonService.getInstance();
				try {
					await watermelonService.checkAndFixRecordsWithoutTrackerId();
				} catch (error) {
					console.warn(
						'Error checking records, continuing anyway:',
						error
					);
				}

				// FIRST: Sync from Firebase to get any existing trackers
				console.log('HomeScreen: Syncing from Firebase first...');
				try {
					await SyncService.getInstance().syncFromFirebase();
					console.log('HomeScreen: Firebase sync completed');
				} catch (syncError) {
					console.warn(
						'Firebase sync failed, continuing with local data:',
						syncError
					);
				}

				// SECOND: Now check for existing tracker after sync
				const tracker = await watermelonService.ensureUserHasTracker(
					user.id
				);

				if (tracker) {
					console.log(
						'HomeScreen: Found existing tracker after sync:',
						tracker.id
					);
					// Update currentWorkTrack with the correct tracker ID and name
					setCurrentWorkTrack({
						id: tracker.id,
						name: tracker.name,
					});

					// Get all entries for this tracker using the service
					const entries =
						await watermelonService.getEntriesForTracker(
							tracker.id
						);

					const workTrackData = entries.map((entry: WorkTrack) => ({
						date: entry.date,
						status: entry.status,
						isAdvisory: entry.isAdvisory,
					}));

					dispatch(setWorkTrackData(workTrackData));
				} else {
					console.log(
						'HomeScreen: Failed to ensure user has tracker'
					);
					dispatch(setError('Failed to load or create tracker'));
				}

				// Note: No need to call triggerSync() here since we already synced from Firebase
				// and any new tracker creation will be synced to Firebase on the next periodic sync
			} catch (error) {
				console.error('Error loading data:', error);
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
			console.error('Error switching worktrack:', error);
		}
	};

	const handleAddWorkTrack = () => {
		workTrackSwitcherRef.current?.close();
		navigation.navigate('ProfileScreen', {
			scrollToSection: 'sharedWithMe',
			highlightWorkTrackId: currentWorkTrack?.id,
		});
	};

	const onRefresh = useCallback(async () => {
		dispatch(setLoading(true));
		try {
			// Add a small delay to ensure JSI bridge is ready
			await new Promise((resolve) => setTimeout(resolve, 100));

			// Trigger sync to get latest data
			await SyncService.getInstance().triggerSync();

			// Reload data for current tracker
			if (currentWorkTrack?.id) {
				const watermelonService = WatermelonService.getInstance();
				const entries = await watermelonService.getEntriesForTracker(
					currentWorkTrack.id
				);

				const workTrackData = entries.map((entry: WorkTrack) => ({
					date: entry.date,
					status: entry.status,
					isAdvisory: entry.isAdvisory,
				}));

				dispatch(setWorkTrackData(workTrackData));
			} else if (user?.id) {
				// If currentWorkTrack is not set yet, try to load it
				const watermelonService = WatermelonService.getInstance();
				const tracker = await watermelonService.ensureUserHasTracker(
					user.id
				);
				if (tracker) {
					setCurrentWorkTrack({
						id: tracker.id,
						name: tracker.name,
					});

					const entries =
						await watermelonService.getEntriesForTracker(
							tracker.id
						);
					const workTrackData = entries.map((entry: WorkTrack) => ({
						date: entry.date,
						status: entry.status,
						isAdvisory: entry.isAdvisory,
					}));

					dispatch(setWorkTrackData(workTrackData));
				}
			}
		} catch (error) {
			console.error('Error syncing data:', error);
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

	const handleSave = async (status: MarkedDayStatus, isAdvisory: boolean) => {
		if (selectedDate === null || !currentWorkTrack?.id) {
			dispatch(setError('No date selected or no tracker available'));
			return;
		}

		try {
			dispatch(setLoading(true));
			dispatch(setError(null));

			// Optimistic update in Redux
			dispatch(
				addOrUpdateEntry({ date: selectedDate, status, isAdvisory })
			);
			console.log('handleSave - currentWorkTrack:', currentWorkTrack);

			// Ensure we have the correct tracker ID
			let trackerId = currentWorkTrack.id;
			let trackerName = currentWorkTrack.name;

			// If currentWorkTrack.id might be a user ID, try to get the actual tracker
			if (currentWorkTrack.id === user?.id) {
				console.log(
					'handleSave - currentWorkTrack.id is user ID, looking up tracker'
				);
				const watermelonService = WatermelonService.getInstance();
				const tracker = await watermelonService.getTrackerByOwnerId(
					currentWorkTrack.id
				);
				if (tracker) {
					trackerId = tracker.id;
					trackerName = tracker.name;
					console.log('handleSave - found tracker ID:', trackerId);

					// Update currentWorkTrack state with the correct tracker ID
					setCurrentWorkTrack({
						id: trackerId,
						name: trackerName,
					});
				} else {
					console.error(
						'handleSave - no tracker found for user ID:',
						currentWorkTrack.id
					);
					dispatch(setError('No tracker found for user'));
					return;
				}
			}

			// Save to WatermelonDB using the new service
			await WatermelonService.getInstance().createOrUpdateRecord({
				trackerId: trackerId,
				date: selectedDate,
				status,
				isAdvisory,
			});

			// Trigger sync to send to Firebase
			await SyncService.getInstance().triggerSync();

			dayMarkingSheetRef.current?.close();
		} catch (error) {
			console.error('Error saving work status:', error);
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
						<SyncStatusIndicator showText={false} />
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
									<Text style={styles.profilePlaceholderText}>
										{user?.name?.[0]?.toUpperCase() ?? '?'}
									</Text>
								</View>
							)}
						</Pressable>
					</View>
				</View>
				{error && <Text style={styles.errorText}>{error}</Text>}
				<CalendarComponent
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
				{selectedDate && (
					<DayMarkingBottomSheet
						selectedDate={selectedDate}
						onSave={handleSave}
						loading={loading}
						onCancel={() => dayMarkingSheetRef.current?.close()}
					/>
				)}
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
					onAddWorkTrack={handleAddWorkTrack}
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
	workTrackSwitcherScroll: {
		flex: 1,
	},
	headerActions: {
		flexDirection: 'row',
		alignItems: 'center',
	},
});

export default HomeScreen;
