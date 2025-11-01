// Sync status indicator component
import React from 'react';
import { StyleSheet, View } from 'react-native';

interface SyncStatusIndicatorProps {
	isSyncing: boolean;
}

export const SyncStatusIndicator: React.FC<SyncStatusIndicatorProps> = ({
	isSyncing,
}) => {
	return (
		<View style={styles.container}>
			{isSyncing && <View style={styles.syncDot} />}
		</View>
	);
};

const styles = StyleSheet.create({
	container: {
		width: 8,
		height: 8,
	},
	syncDot: {
		width: 8,
		height: 8,
		borderRadius: 4,
		backgroundColor: '#4CAF50',
	},
});
