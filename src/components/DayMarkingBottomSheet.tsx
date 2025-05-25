import { useState } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { HelperText } from 'react-native-paper';

import { WORK_STATUS_COLORS } from '../constants/workStatus';
import { useResponsiveLayout } from '../hooks/useResponsive';
import { fonts } from '../themes';
import { colors } from '../themes/colors';
import { MarkedDayStatus } from '../types/calendar';

type Props = {
	onSave: (status: MarkedDayStatus) => void;
	selectedDate: string;
	loading?: boolean;
	onCancel?: () => void;
};

const DayMarkingBottomSheet: React.FC<Props> = ({
	onSave,
	selectedDate,
	loading = false,
	onCancel,
}) => {
	const { RFValue, getResponsiveSize } = useResponsiveLayout();
	const [status, setStatus] = useState<MarkedDayStatus | null>(null);
	const [error, setError] = useState<string | null>(null);

	const formatDate = (dateString: string) => {
		const date = new Date(dateString);
		return date.toLocaleDateString('en-US', {
			weekday: 'long',
			year: 'numeric',
			month: 'long',
			day: 'numeric',
		});
	};

	const validateDate = (dateString: string) => {
		const selectedDate = new Date(dateString);
		const today = new Date();
		today.setHours(0, 0, 0, 0);

		if (selectedDate > today) {
			setError('Cannot mark future dates');
			return false;
		}
		setError(null);
		return true;
	};

	const handleConfirm = () => {
		if (!status) {
			setError('Please select a status');
			return;
		}

		if (!validateDate(selectedDate)) {
			return;
		}

		onSave(status);
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
		<View
			style={[styles.container, { padding: getResponsiveSize(5).width }]}
		>
			<Text style={[styles.title, { fontSize: RFValue(16) }]}>
				Mark your status for {formatDate(selectedDate)}
			</Text>

			<View
				style={[
					styles.statusOptions,
					{ paddingHorizontal: getResponsiveSize(2).width },
				]}
			>
				<TouchableOpacity
					onPress={() => {
						setStatus('office');
						setError(null);
					}}
					style={[styles.statusButton, getStatusStyle('office')]}
					disabled={loading}
				>
					<Text style={getStatusTextStyle('office')}>WFO</Text>
				</TouchableOpacity>
				<TouchableOpacity
					onPress={() => {
						setStatus('wfh');
						setError(null);
					}}
					style={[styles.statusButton, getStatusStyle('wfh')]}
					disabled={loading}
				>
					<Text style={getStatusTextStyle('wfh')}>WFH</Text>
				</TouchableOpacity>
				<TouchableOpacity
					onPress={() => {
						setStatus('holiday');
						setError(null);
					}}
					style={[styles.statusButton, getStatusStyle('holiday')]}
					disabled={loading}
				>
					<Text style={getStatusTextStyle('holiday')}>Leave</Text>
				</TouchableOpacity>
			</View>

			{error && (
				<HelperText type='error' visible={!!error}>
					{error}
				</HelperText>
			)}

			{/* Spacer to push the button to the bottom */}
			<View style={{ flex: 1 }} />

			<View
				style={[
					styles.buttonContainer,
					{ paddingHorizontal: getResponsiveSize(2).width },
				]}
			>
				<TouchableOpacity
					style={[styles.cancelButton]}
					onPress={handleCancel}
					disabled={loading}
				>
					<Text style={styles.cancelText}>Cancel</Text>
				</TouchableOpacity>
				<TouchableOpacity
					style={[
						styles.confirmButton,
						loading && styles.disabledButton,
					]}
					onPress={handleConfirm}
					disabled={!status || loading}
				>
					<Text style={styles.confirmText}>
						{loading ? 'Saving...' : 'Confirm'}
					</Text>
				</TouchableOpacity>
			</View>
		</View>
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
	statusOptions: {
		flexDirection: 'row',
		justifyContent: 'space-between',
		marginBottom: 16,
	},
	statusButton: {
		paddingVertical: 10,
		paddingHorizontal: 20,
		borderRadius: 8,
		flex: 1,
		marginHorizontal: 4,
		alignItems: 'center',
	},
	statusText: {
		fontFamily: fonts.PoppinsMedium,
		fontSize: 14,
	},
	buttonContainer: {
		marginTop: 8,
		marginBottom: 8,
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
});

export default DayMarkingBottomSheet;
