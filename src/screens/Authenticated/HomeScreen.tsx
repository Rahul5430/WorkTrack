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
import WorkTrackSwitcher from '../../components/WorkTrackSwitcher';
import {
	addMarkedDay,
	loadWorkTrackDataFromDB,
} from '../../db/watermelon/worktrack/load';
import { useResponsiveLayout } from '../../hooks/useResponsive';
import { useSharedWorkTracks } from '../../hooks/useSharedWorkTracks';
import FirebaseService from '../../services/firebase';
import SyncService from '../../services/sync';
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
import { MarkedDay, MarkedDayStatus } from '../../types/calendar';
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
	const [isWorkTrackSwitcherOpen, setIsWorkTrackSwitcherOpen] =
		useState(false);
	const dayMarkingSheetRef = useRef<CommonBottomSheetRef>(null);
	const workTrackSwitcherRef = useRef<CommonBottomSheetRef>(null);
	const [selectedDate, setSelectedDate] = useState<string | null>(null);
	const [selectedMonth, setSelectedMonth] = useState(new Date());
	const rotateAnim = useRef(new Animated.Value(0)).current;
	const isAnimating = useRef(false);

	useEffect(() => {
		// Start periodic sync
		const syncService = SyncService.getInstance();
		syncService.startPeriodicSync();

		// Load initial work track
		const defaultViewUserId = syncService.getDefaultViewUserId();
		if (defaultViewUserId) {
			const workTrack = sharedWorkTracks.find(
				(track) => track.id === defaultViewUserId
			);
			if (workTrack) {
				setCurrentWorkTrack({
					id: workTrack.id,
					name: workTrack.ownerName,
				});
			}
		} else {
			setCurrentWorkTrack({
				id: user?.id ?? '',
				name: user?.name ?? 'My WorkTrack',
			});
		}

		return () => {
			syncService.stopPeriodicSync();
		};
	}, [user, sharedWorkTracks]);

	// Add a new effect to handle data loading when currentWorkTrack changes
	useEffect(() => {
		const loadData = async () => {
			if (!currentWorkTrack?.id) return;

			dispatch(setLoading(true));
			try {
				// Sync data from Firestore to local database
				await FirebaseService.getInstance().syncWorkTrackData();

				// Load updated data from local database
				const updatedData = await loadWorkTrackDataFromDB();
				dispatch(setWorkTrackData(updatedData));
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
		};

		loadData();
	}, [currentWorkTrack?.id, dispatch]);

	// Add effect to sync with default view changes
	useEffect(() => {
		const syncService = SyncService.getInstance();
		const defaultViewUserId = syncService.getDefaultViewUserId();

		if (defaultViewUserId && defaultViewUserId !== currentWorkTrack?.id) {
			const workTrack = sharedWorkTracks.find(
				(track) => track.id === defaultViewUserId
			);
			if (workTrack) {
				setCurrentWorkTrack({
					id: workTrack.id,
					name: workTrack.ownerName,
				});
			}
		}
	}, [sharedWorkTracks]);

	const handleDayMarkingSheetChanges = useCallback((index: number) => {
		if (index === -1) {
			setSelectedDate(null);
		}
	}, []);

	const handleWorkTrackSwitcherChanges = useCallback((index: number) => {
		const isOpen = index > -1;
		setIsWorkTrackSwitcherOpen(isOpen);
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
			// Sync data from Firestore to local database
			await FirebaseService.getInstance().syncWorkTrackData();

			// Load updated data from local database
			const updatedData = await loadWorkTrackDataFromDB();
			dispatch(setWorkTrackData(updatedData));
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
	}, [dispatch]);

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

			// Save to WatermelonDB
			await addMarkedDay({ date: selectedDate, status, isAdvisory });

			// Queue for sync
			const syncService = SyncService.getInstance();
			await syncService.queueSync(selectedDate);

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
											currentWorkTrack.id === user?.id
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
					<Pressable
						onPress={() => navigation.navigate('ProfileScreen', {})}
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
				onChange={handleWorkTrackSwitcherChanges}
				onBackdropPress={handleCloseAnimation}
				onClose={handleCloseAnimation}
			>
				<WorkTrackSwitcher
					sharedWorkTracks={sharedWorkTracks}
					loading={sharedWorkTracksLoading}
					onWorkTrackSelect={handleWorkTrackSelect}
					onAddWorkTrack={handleAddWorkTrack}
					currentWorkTrackId={currentWorkTrack?.id}
					defaultWorkTrackId={
						SyncService.getInstance().getDefaultViewUserId() ??
						undefined
					}
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
});

export default HomeScreen;
