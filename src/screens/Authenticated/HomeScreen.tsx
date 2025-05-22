import BottomSheet, {
	BottomSheetBackdrop,
	BottomSheetView,
} from '@gorhom/bottom-sheet';
import { useCallback, useEffect, useRef, useState } from 'react';
import { ScrollView, StatusBar, StyleSheet, Text } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useDispatch, useSelector } from 'react-redux';

import CalendarComponent from '../../components/Calendar';
import DayMarkingBottomSheet from '../../components/DayMarkingBottomSheet';
import Label from '../../components/Label';
import Summary from '../../components/Summary';
import { addMarkedDay } from '../../db/watermelon/worktrack/load';
import { useResponsiveLayout } from '../../hooks/useResponsive';
import { SyncService } from '../../services/sync';
import {
	addOrUpdateEntry,
	rollbackEntry,
	setError,
	setLoading,
} from '../../store/reducers/workTrackSlice';
import { AppDispatch, RootState } from '../../store/store';
import { fonts } from '../../themes';
import { MarkedDayStatus } from '../../types/calendar';

const HomeScreen: () => React.JSX.Element = () => {
	const { RFValue, getResponsiveSize } = useResponsiveLayout();
	const dispatch = useDispatch<AppDispatch>();
	const { error, loading } = useSelector(
		(state: RootState) => state.workTrack
	);

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
		StatusBar.setBarStyle(index === 0 ? 'light-content' : 'dark-content');
		if (index === -1) {
			setSelectedDate(null);
		}
	}, []);

	const onDatePress = (date: string) => {
		setSelectedDate(date);
		bottomSheetRef.current?.expand();
	};

	const handleSave = async (status: MarkedDayStatus) => {
		if (selectedDate === null) {
			dispatch(setError('No date selected'));
			return;
		}

		try {
			dispatch(setLoading(true));
			dispatch(setError(null));

			// Optimistic update in Redux
			dispatch(
				addOrUpdateEntry({
					date: selectedDate,
					status,
				})
			);

			// Save to WatermelonDB
			await addMarkedDay({ date: selectedDate, status });

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
		<SafeAreaView style={[styles.screen]}>
			<ScrollView
				style={styles.scrollView}
				contentContainerStyle={styles.scrollContent}
				scrollEnabled={!selectedDate}
			>
				<Text
					style={[
						styles.headerText,
						{
							fontSize: RFValue(20),
							paddingHorizontal: getResponsiveSize(5).width,
						},
					]}
				>
					WorkTrack
				</Text>
				{error && <Text style={styles.errorText}>{error}</Text>}
				<CalendarComponent onDatePress={onDatePress} />
				<Label />
				<Summary />
			</ScrollView>
			<BottomSheet
				ref={bottomSheetRef}
				onChange={handleSheetChanges}
				index={-1}
				snapPoints={['30%']}
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
		backgroundColor: '#fff',
	},
	scrollView: {
		flex: 1,
	},
	scrollContent: {
		flexGrow: 1,
	},
	headerText: {
		fontFamily: fonts.PoppinsSemiBold,
		color: '#111827',
		marginVertical: 16,
	},
	sheetContent: {
		backgroundColor: 'white',
		overflow: 'hidden',
	},
	errorText: {
		color: '#EF4444',
		fontFamily: fonts.PoppinsRegular,
		paddingHorizontal: 20,
		marginBottom: 10,
	},
});

export default HomeScreen;
