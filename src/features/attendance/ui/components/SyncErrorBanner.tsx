// Sync error banner component
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

interface SyncErrorBannerProps {
	error: string;
	onRetry: () => void;
}

export const SyncErrorBanner: React.FC<SyncErrorBannerProps> = ({
	error,
	onRetry,
}) => {
	return (
		<View style={styles.container}>
			<Text style={styles.errorText}>Sync Error: {error}</Text>
			<TouchableOpacity onPress={onRetry} style={styles.retryButton}>
				<Text style={styles.retryLabel}>Retry</Text>
			</TouchableOpacity>
		</View>
	);
};

const styles = StyleSheet.create({
	container: { padding: 16, backgroundColor: '#ffebee' },
	errorText: { color: '#c62828', marginBottom: 8 },
	retryButton: { backgroundColor: '#1976d2', padding: 8 },
	retryLabel: { color: 'white', textAlign: 'center' },
});
