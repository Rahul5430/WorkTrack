import { BottomSheetView } from '@gorhom/bottom-sheet';
import React, { useState } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { HelperText, Switch } from 'react-native-paper';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import {
	WORK_STATUS_COLORS,
	// WORK_STATUS_LABELS,
} from '@/shared/constants/workStatus';
// import { WORK_STATUS } from '@/shared/types/workStatus';
import { useResponsiveLayout } from '@/shared/ui/hooks/useResponsive';
import { colors, fonts } from '@/shared/ui/theme';
import { MarkedDayStatus } from '@/types';

type Props = {
	onSave: (status: MarkedDayStatus, isAdvisory: boolean) => void;
	selectedDate: string;
	onCancel?: () => void;
	initialStatus?: MarkedDayStatus;
	initialIsAdvisory?: boolean;
};

const DayMarkingBottomSheet: React.FC<Props> = ({
	onSave,
	selectedDate,
	onCancel,
	initialStatus,
	initialIsAdvisory = false,
}) => {
	const { RFValue, getResponsiveSize } = useResponsiveLayout();
	const insets = useSafeAreaInsets();
	const [status, setStatus] = useState<MarkedDayStatus | null>(
		initialStatus ?? null
	);
	const [isAdvisory, setIsAdvisory] = useState(initialIsAdvisory);
	const [error, setError] = useState<string | null>(null);
	const [isSaving, setIsSaving] = useState(false);

	// Calculate bottom padding for gesture bar
	// Use safe area inset if available, otherwise use a minimum of 24px for gesture bar clearance
	const bottomPadding = Math.max(insets.bottom || 0, 24);

	const formatDate = (dateString: string) => {
		const date = new Date(dateString);
		return date.toLocaleDateString('en-US', {
			weekday: 'long',
			year: 'numeric',
			month: 'long',
			day: 'numeric',
		});
	};

	const handleConfirm = async () => {
		if (!status) {
			setError('Please select a status');
			return;
		}

		setIsSaving(true);
		setError(null);

		try {
			await onSave(status, isAdvisory);
		} catch {
			setError('Failed to save status');
		} finally {
			setIsSaving(false);
		}
	};

	const handleCancel = () => {
		if (onCancel) {
			onCancel();
		}
	};

	const getStatusStyle = (type: MarkedDayStatus) => [
		styles.statusButton,
		{
			backgroundColor:
				status === type
					? WORK_STATUS_COLORS[type]
					: colors.ui.gray[200],
		},
	];

	const getStatusTextStyle = (type: MarkedDayStatus) => [
		styles.statusText,
		{
			color: status === type ? colors.text.light : colors.text.primary,
		},
	];

	return (
		<BottomSheetView
			style={[styles.container, { padding: getResponsiveSize(5).width }]}
		>
			<Text style={[styles.title, { fontSize: RFValue(16) }]}>
				Mark your status for {formatDate(selectedDate)}
			</Text>

			<View style={styles.advisoryContainer}>
				<Text style={[styles.advisoryLabel, { fontSize: RFValue(14) }]}>
					Advisory Day
				</Text>
				<View
					style={[
						styles.switchContainer,
						isAdvisory
							? styles.advisoryBorder
							: styles.normalBorder,
					]}
				>
					<Switch
						value={isAdvisory}
						onValueChange={setIsAdvisory}
						color={colors.forecast}
						trackColor={{
							false: '#E8D5F2', // Light lavender/purple
							true: colors.forecast + '40',
						}}
						thumbColor={
							isAdvisory ? colors.forecast : '#B19CD9' // Medium purple
						}
						ios_backgroundColor={
							isAdvisory ? colors.forecast + '20' : '#E8D5F2'
						}
					/>
				</View>
			</View>

			<View style={styles.statusOptions}>
				<View style={styles.statusRow}>
					<TouchableOpacity
						onPress={() => {
							setStatus('office');
							setError(null);
						}}
						style={[styles.statusButton, getStatusStyle('office')]}
						disabled={isSaving}
						testID='office-button'
					>
						<Text style={getStatusTextStyle('office')}>WFO</Text>
					</TouchableOpacity>
					<TouchableOpacity
						onPress={() => {
							setStatus('wfh');
							setError(null);
						}}
						style={[styles.statusButton, getStatusStyle('wfh')]}
						disabled={isSaving}
						testID='wfh-button'
					>
						<Text style={getStatusTextStyle('wfh')}>WFH</Text>
					</TouchableOpacity>
				</View>
				<View style={styles.statusRow}>
					<TouchableOpacity
						onPress={() => {
							setStatus('leave');
							setError(null);
						}}
						style={[styles.statusButton, getStatusStyle('leave')]}
						disabled={isSaving}
						testID='leave-button'
					>
						<Text style={getStatusTextStyle('leave')}>Leave</Text>
					</TouchableOpacity>
					<TouchableOpacity
						onPress={() => {
							setStatus('holiday');
							setError(null);
						}}
						style={[styles.statusButton, getStatusStyle('holiday')]}
						disabled={isSaving}
						testID='holiday-button'
					>
						<Text style={getStatusTextStyle('holiday')}>
							Holiday
						</Text>
					</TouchableOpacity>
				</View>
				{/* <View style={styles.statusRow}>
					<TouchableOpacity
						onPress={() => {
							setStatus('forecast');
							setError(null);
						}}
						style={[
							styles.statusButton,
							getStatusStyle('forecast'),
						]}
						disabled={isSaving}
						testID='forecast-button'
					>
						<Text style={getStatusTextStyle('forecast')}>
							{WORK_STATUS_LABELS[WORK_STATUS.FORECAST]}
						</Text>
					</TouchableOpacity>
					<TouchableOpacity
						onPress={() => {
							setStatus('advisory');
							setError(null);
						}}
						style={[
							styles.statusButton,
							getStatusStyle('advisory'),
						]}
						disabled={isSaving}
						testID='advisory-button'
					>
						<Text style={getStatusTextStyle('advisory')}>
							{WORK_STATUS_LABELS[WORK_STATUS.ADVISORY]}
						</Text>
					</TouchableOpacity>
				</View> */}
			</View>

			{error && (
				<HelperText
					type='error'
					visible={!!error}
					testID='error-message'
				>
					{error}
				</HelperText>
			)}

			{/* Spacer to push the button to the bottom */}
			<View style={styles.spacer} />

			<View
				style={[
					styles.buttonContainer,
					{ marginBottom: bottomPadding },
				]}
			>
				<TouchableOpacity
					style={[styles.cancelButton]}
					onPress={handleCancel}
					disabled={isSaving}
					testID='cancel-button'
				>
					<Text style={styles.cancelText}>Cancel</Text>
				</TouchableOpacity>
				<TouchableOpacity
					style={[
						styles.confirmButton,
						isSaving && styles.disabledButton,
					]}
					onPress={handleConfirm}
					disabled={!status || isSaving}
					testID='confirm-button'
				>
					<Text style={styles.confirmText}>
						{isSaving ? 'Saving...' : 'Confirm'}
					</Text>
				</TouchableOpacity>
			</View>
		</BottomSheetView>
	);
};

const styles = StyleSheet.create({
	container: {
		backgroundColor: colors.background.primary,
		flex: 1,
	},
	title: {
		fontFamily: fonts.PoppinsSemiBold,
		color: colors.text.primary,
		marginBottom: 12,
	},
	advisoryContainer: {
		flexDirection: 'row',
		alignItems: 'center',
		justifyContent: 'space-between',
		marginBottom: 16,
	},
	advisoryLabel: {
		fontFamily: fonts.PoppinsMedium,
		color: colors.text.primary,
	},
	switchContainer: {
		borderWidth: 1.5,
		borderRadius: 20,
	},
	statusOptions: {
		flexDirection: 'column',
		gap: 8,
		marginBottom: 16,
	},
	statusRow: {
		flexDirection: 'row',
		justifyContent: 'space-between',
		gap: 8,
	},
	statusButton: {
		paddingVertical: 10,
		paddingHorizontal: 20,
		borderRadius: 8,
		flex: 1,
		alignItems: 'center',
	},
	statusText: {
		fontFamily: fonts.PoppinsMedium,
		fontSize: 14,
	},
	buttonContainer: {
		marginTop: 8,
		flexDirection: 'row',
		justifyContent: 'space-between',
		gap: 12,
	},
	confirmButton: {
		backgroundColor: colors.button.primary,
		borderRadius: 8,
		alignItems: 'center',
		justifyContent: 'center',
		height: 48,
		flex: 1,
	},
	cancelButton: {
		backgroundColor: colors.button.secondary,
		borderRadius: 8,
		alignItems: 'center',
		justifyContent: 'center',
		height: 48,
		flex: 1,
	},
	disabledButton: {
		backgroundColor: colors.button.disabled,
	},
	confirmText: {
		color: colors.text.light,
		fontFamily: fonts.PoppinsSemiBold,
		fontSize: 16,
	},
	cancelText: {
		color: colors.text.secondary,
		fontFamily: fonts.PoppinsSemiBold,
		fontSize: 16,
	},
	spacer: {
		flex: 1,
	},
	advisoryBorder: {
		borderColor: colors.forecast,
	},
	normalBorder: {
		borderColor: '#D1C4E9',
	},
});

export default DayMarkingBottomSheet;
