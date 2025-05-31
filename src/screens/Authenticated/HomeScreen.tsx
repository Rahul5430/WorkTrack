import BottomSheet, {
	BottomSheetBackdrop,
	BottomSheetView,
} from '@gorhom/bottom-sheet';
import { useCallback, useEffect, useRef, useState } from 'react';
import {
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

import CalendarComponent from '../../components/Calendar';
import DayMarkingBottomSheet from '../../components/DayMarkingBottomSheet';
import FocusAwareStatusBar from '../../components/FocusAwareStatusBar';
import Label from '../../components/Label';
import Summary from '../../components/Summary';
import {
	addMarkedDay,
	loadWorkTrackDataFromDB,
} from '../../db/watermelon/worktrack/load';
import { useResponsiveLayout } from '../../hooks/useResponsive';
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

	const bottomSheetRef = useRef<BottomSheet>(null);
	const [selectedDate, setSelectedDate] = useState<string | null>(null);

	useEffect(() => {
		// Start periodic sync
		const syncService = SyncService.getInstance();
		syncService.startPeriodicSync();

		return () => {
			syncService.stopPeriodicSync();
		};
	}, []);

	const handleSheetChanges = useCallback((index: number) => {
		if (index === -1) {
			setSelectedDate(null);
		}
	}, []);

	const onDatePress = useCallback((date: string) => {
		// Update state and bottom sheet in a single render cycle
		requestAnimationFrame(() => {
			setSelectedDate(date);
			bottomSheetRef.current?.expand();
		});
	}, []);

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

			bottomSheetRef.current?.close();
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
					<Text
						style={[
							styles.headerText,
							{
								fontSize: RFValue(20),
							},
						]}
					>
						WorkTrack
					</Text>
					<Pressable
						onPress={() => navigation.navigate('ProfileScreen')}
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
				<CalendarComponent onDatePress={onDatePress} />
				<Label />
				<Summary />
			</ScrollView>
			<BottomSheet
				ref={bottomSheetRef}
				onChange={handleSheetChanges}
				index={-1}
				snapPoints={['40%']}
				enablePanDownToClose
				backdropComponent={(props) => (
					<BottomSheetBackdrop
						{...props}
						disappearsOnIndex={-1}
						appearsOnIndex={0}
						opacity={0.7}
						pressBehavior='close'
					/>
				)}
			>
				<BottomSheetView style={[styles.sheetContent, { flex: 1 }]}>
					{selectedDate && (
						<DayMarkingBottomSheet
							selectedDate={selectedDate}
							onSave={handleSave}
							loading={loading}
							onCancel={() => bottomSheetRef.current?.close()}
							initialStatus={
								workTrackData.find(
									(entry: MarkedDay) =>
										entry.date === selectedDate
								)?.status
							}
							initialIsAdvisory={
								workTrackData.find(
									(entry: MarkedDay) =>
										entry.date === selectedDate
								)?.isAdvisory
							}
						/>
					)}
				</BottomSheetView>
			</BottomSheet>
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
		alignItems: 'center',
		justifyContent: 'space-between',
		paddingHorizontal: 20,
		marginVertical: 16,
	},
	headerText: {
		fontFamily: fonts.PoppinsSemiBold,
		color: colors.text.primary,
	},
	profileButton: {
		width: 32,
		height: 32,
		borderRadius: 16,
		overflow: 'hidden',
		backgroundColor: colors.background.primary,
		elevation: 2,
		shadowColor: colors.text.primary,
		shadowOffset: { width: 0, height: 1 },
		shadowOpacity: 0.1,
		shadowRadius: 2,
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
		fontSize: 16,
	},
	sheetContent: {
		backgroundColor: colors.background.primary,
		overflow: 'hidden',
	},
	errorText: {
		color: colors.error,
		fontFamily: fonts.PoppinsRegular,
		paddingHorizontal: 20,
		marginBottom: 10,
	},
});

export default HomeScreen;
