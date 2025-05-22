import { useState } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

import { useResponsiveLayout } from '../hooks/useResponsive';
import { fonts } from '../themes';
import { MarkedDayStatus } from '../types/calendar';

type Props = {
	onSave: (status: MarkedDayStatus) => void;
	selectedDate: string;
	loading?: boolean;
};

const DayMarkingBottomSheet: React.FC<Props> = ({
	onSave,
	selectedDate,
	loading = false,
}) => {
	const { RFValue, getResponsiveSize } = useResponsiveLayout();
	const [status, setStatus] = useState<MarkedDayStatus | null>(null);

	const formatDate = (dateString: string) => {
		const date = new Date(dateString);
		return date.toLocaleDateString('en-US', {
			weekday: 'long',
			year: 'numeric',
			month: 'long',
			day: 'numeric',
		});
	};

	const handleConfirm = () => {
		if (status) {
			onSave(status);
		}
	};

	const getStatusStyle = (type: string) => [
		styles.statusButton,
		{
			backgroundColor: status === type ? '#2563EB' : '#E5E7EB',
		},
	];

	return (
		<View style={styles.container}>
			<Text style={[styles.title, { fontSize: RFValue(16) }]}>
				Mark your status for {formatDate(selectedDate)}
			</Text>

			<View style={styles.statusOptions}>
				<TouchableOpacity
					onPress={() => setStatus('OFFICE')}
					style={getStatusStyle('OFFICE')}
					disabled={loading}
				>
					<Text style={styles.statusText}>WFO</Text>
				</TouchableOpacity>
				<TouchableOpacity
					onPress={() => setStatus('WFH')}
					style={getStatusStyle('WFH')}
					disabled={loading}
				>
					<Text style={styles.statusText}>WFH</Text>
				</TouchableOpacity>
				<TouchableOpacity
					onPress={() => setStatus('HOLIDAY')}
					style={getStatusStyle('HOLIDAY')}
					disabled={loading}
				>
					<Text style={styles.statusText}>Leave</Text>
				</TouchableOpacity>
			</View>

			{/* Spacer to push the button to the bottom */}
			<View style={{ flex: 1 }} />

			<View style={styles.buttonContainer}>
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
		padding: 20,
		backgroundColor: 'white',
		flex: 1,
	},
	title: {
		fontFamily: fonts.PoppinsSemiBold,
		color: '#111827',
		marginBottom: 12,
	},
	statusOptions: {
		flexDirection: 'row',
		justifyContent: 'space-evenly',
		marginBottom: 16,
		gap: 12,
	},
	statusButton: {
		paddingVertical: 10,
		paddingHorizontal: 20,
		borderRadius: 8,
		marginRight: 12,
	},
	statusText: {
		color: '#1F2937',
		fontFamily: fonts.PoppinsRegular,
	},
	buttonContainer: {
		marginTop: 8,
		marginBottom: 8,
		alignItems: 'center',
	},
	confirmButton: {
		backgroundColor: '#2563EB',
		borderRadius: 8,
		alignItems: 'center',
		justifyContent: 'center',
		height: 48,
		minWidth: 160,
		paddingHorizontal: 32,
	},
	disabledButton: {
		backgroundColor: '#93C5FD',
	},
	confirmText: {
		color: 'white',
		fontFamily: fonts.PoppinsSemiBold,
		fontSize: 16,
	},
});

export default DayMarkingBottomSheet;
