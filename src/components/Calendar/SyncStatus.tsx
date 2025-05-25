import { StyleSheet, Text, View } from 'react-native';
import { ActivityIndicator } from 'react-native-paper';

import { useResponsiveLayout } from '../../hooks/useResponsive';
import { fonts } from '../../themes';
import { colors } from '../../themes/colors';

type SyncStatusProps = {
	status: {
		isSyncing: boolean;
		isOnline: boolean;
		lastSyncTime?: number;
		error?: string;
		pendingSyncs: number;
	};
};

const SyncStatus = ({ status }: SyncStatusProps) => {
	const { RFValue } = useResponsiveLayout();

	// Only show status if there's an issue or pending syncs
	if (!status.error && status.isOnline && status.pendingSyncs === 0) {
		return null;
	}

	const getStatusText = () => {
		if (!status.isOnline) return 'Offline - Changes will sync when online';
		if (status.error) return 'Syncing...'; // Simplified error message
		if (status.pendingSyncs > 0)
			return `${status.pendingSyncs} changes pending sync`;
		return '';
	};

	const getStatusColor = () => {
		if (!status.isOnline) return colors.text.secondary;
		if (status.error) return colors.text.secondary;
		if (status.pendingSyncs > 0) return colors.text.secondary;
		return colors.text.secondary;
	};

	const formatLastSyncTime = (timestamp?: number) => {
		if (!timestamp) return '';
		const date = new Date(timestamp);
		return `Last sync: ${date.toLocaleTimeString()}`;
	};

	return (
		<View style={styles.container}>
			<View style={styles.statusContainer}>
				{status.isSyncing && (
					<ActivityIndicator
						size='small'
						color={colors.text.secondary}
					/>
				)}
				<Text
					style={[
						styles.statusText,
						{ fontSize: RFValue(12), color: getStatusColor() },
					]}
				>
					{getStatusText()}
				</Text>
			</View>
			{status.lastSyncTime && (
				<Text style={[styles.lastSyncText, { fontSize: RFValue(10) }]}>
					{formatLastSyncTime(status.lastSyncTime)}
				</Text>
			)}
		</View>
	);
};

const styles = StyleSheet.create({
	container: {
		flexDirection: 'row',
		justifyContent: 'space-between',
		alignItems: 'center',
		marginBottom: 8,
	},
	statusContainer: {
		flexDirection: 'row',
		alignItems: 'center',
		gap: 4,
	},
	statusText: {
		fontFamily: fonts.PoppinsRegular,
	},
	lastSyncText: {
		fontFamily: fonts.PoppinsRegular,
		color: colors.text.secondary,
	},
});

export default SyncStatus;
