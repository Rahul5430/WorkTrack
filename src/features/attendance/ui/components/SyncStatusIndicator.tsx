// Sync status indicator component
import React from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';

interface SyncStatusIndicatorProps {
	isSyncing: boolean;
	lastSyncTime?: Date;
}

export const SyncStatusIndicator: React.FC<SyncStatusIndicatorProps> = ({
	isSyncing,
	lastSyncTime,
}) => {
	return (
		<View style={styles.wrapper}>
			{isSyncing ? (
				<ActivityIndicator size='small' color='#1976d2' />
			) : (
				<View style={styles.indicator} />
			)}
			<Text style={styles.label}>
				{isSyncing
					? 'Syncing...'
					: `Last sync: ${lastSyncTime?.toLocaleTimeString() || 'Never'}`}
			</Text>
		</View>
	);
};

const styles = StyleSheet.create({
	wrapper: { flexDirection: 'row', alignItems: 'center', padding: 8 },
	indicator: {
		width: 16,
		height: 16,
		backgroundColor: '#4caf50',
		borderRadius: 8,
	},
	label: { marginLeft: 8, fontSize: 12 },
});
