import BottomSheet, {
	BottomSheetBackdrop,
	BottomSheetView,
} from '@gorhom/bottom-sheet';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useCallback, useEffect, useRef, useState } from 'react';
import {
	Image,
	Pressable,
	ScrollView,
	StatusBar,
	StyleSheet,
	Text,
	View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useDispatch, useSelector } from 'react-redux';

import CalendarComponent from '../../components/Calendar';
import DayMarkingBottomSheet from '../../components/DayMarkingBottomSheet';
import Label from '../../components/Label';
import Summary from '../../components/Summary';
import { addMarkedDay } from '../../db/watermelon/worktrack/load';
import { useResponsiveLayout } from '../../hooks/useResponsive';
import SyncService from '../../services/sync';
import {
	addOrUpdateEntry,
	rollbackEntry,
	setError,
	setLoading,
} from '../../store/reducers/workTrackSlice';
import { AppDispatch, RootState } from '../../store/store';
import { fonts } from '../../themes';
import { colors } from '../../themes/colors';
import { MarkedDayStatus } from '../../types/calendar';
import { AuthenticatedStackParamList } from '../../types/navigation';

type HomeScreenNavigationProp =
	NativeStackNavigationProp<AuthenticatedStackParamList>;

const HomeScreen = () => {
	const { RFValue } = useResponsiveLayout();
	const dispatch = useDispatch<AppDispatch>();
	const navigation = useNavigation<HomeScreenNavigationProp>();
	const { error, loading } = useSelector(
		(state: RootState) => state.workTrack
	);
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
			dispatch(addOrUpdateEntry({ date: selectedDate, status }));

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
		<SafeAreaView style={styles.screen}>
			<ScrollView
				style={styles.scrollView}
				contentContainerStyle={styles.scrollContent}
				scrollEnabled={!selectedDate}
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
							onCancel={() => bottomSheetRef.current?.close()}
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
