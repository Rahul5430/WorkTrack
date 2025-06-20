import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
	Animated,
	StyleSheet,
	Text,
	TextStyle,
	TouchableOpacity,
	View,
	ViewStyle,
} from 'react-native';

import { useToast } from '../hooks/useToast';
import SyncService from '../services/sync';
import { fonts } from '../themes';
import { colors } from '../themes/colors';

interface SyncStatusIndicatorProps {
	onPress?: () => void;
	showText?: boolean;
	style?: ViewStyle;
	textStyle?: TextStyle;
}

export const SyncStatusIndicator: React.FC<SyncStatusIndicatorProps> = ({
	onPress,
	showText = true,
	style,
	textStyle,
}) => {
	const [syncStatus, setSyncStatus] = useState<{
		isSyncing: boolean;
		isOnline: boolean;
		lastSyncTime?: number;
	}>({
		isSyncing: false,
		isOnline: true,
	});

	const rotateAnim = useRef(new Animated.Value(0)).current;

	const { show } = useToast();

	const updateStatus = useCallback(async () => {
		const status = await SyncService.getInstance().getSyncStatus();
		setSyncStatus(status);
	}, []);

	// Handle rotating animation for syncing state
	useEffect(() => {
		if (syncStatus.isSyncing) {
			// Start continuous rotation
			const startRotation = () => {
				rotateAnim.setValue(0);
				Animated.timing(rotateAnim, {
					toValue: 1,
					duration: 1000,
					useNativeDriver: true,
				}).start(() => {
					if (syncStatus.isSyncing) {
						startRotation(); // Continue rotating while syncing
					}
				});
			};
			startRotation();
		} else {
			// Stop rotation
			rotateAnim.stopAnimation();
		}
	}, [syncStatus.isSyncing, rotateAnim]);

	useEffect(() => {
		updateStatus();
		const interval = setInterval(updateStatus, 5000); // Update every 5 seconds
		return () => clearInterval(interval);
	}, [updateStatus]);

	const handlePress = async () => {
		if (onPress) {
			onPress();
		} else {
			// Default behavior: trigger manual sync
			if (syncStatus.isSyncing) {
				show('Sync already in progress...', 'info');
				return;
			}

			if (!syncStatus.isOnline) {
				show('No network connection available', 'error');
				return;
			}

			try {
				show('Starting manual sync...', 'info');
				const success = await SyncService.getInstance().manualSync();
				if (success) {
					show('Manual sync completed!', 'success');
				} else {
					show('Manual sync failed', 'error');
				}
			} catch (error) {
				console.error('Manual sync error:', error);
				show('Manual sync failed', 'error');
			}
		}
	};

	const getStatusColor = () => {
		if (syncStatus.isSyncing) return colors.button.primary;
		if (!syncStatus.isOnline) return colors.error;
		return colors.wfh; // Green for online and synced
	};

	const getStatusText = () => {
		if (syncStatus.isSyncing) return 'Syncing...';
		if (!syncStatus.isOnline) return 'Offline';
		return 'Synced';
	};

	const getStatusIcon = () => {
		if (syncStatus.isSyncing) return '🔄';
		if (!syncStatus.isOnline) return '📡';
		return '✓';
	};

	const getAccessibilityLabel = () => {
		const status = getStatusText();
		const time = formatLastSyncTime();
		return `${status}. Last sync: ${time}. Tap to manually sync.`;
	};

	const formatLastSyncTime = () => {
		if (!syncStatus.lastSyncTime) return 'Never';

		const now = Date.now();
		const diff = now - syncStatus.lastSyncTime;
		const minutes = Math.floor(diff / (1000 * 60));

		if (minutes < 1) return 'Just now';
		if (minutes < 60) return `${minutes}m ago`;

		const hours = Math.floor(minutes / 60);
		if (hours < 24) return `${hours}h ago`;

		const days = Math.floor(hours / 24);
		return `${days}d ago`;
	};

	return (
		<TouchableOpacity
			style={[
				styles.container,
				(onPress || !syncStatus.isSyncing) && styles.clickable,
				style,
			]}
			onPress={handlePress}
			disabled={syncStatus.isSyncing}
			accessibilityLabel={getAccessibilityLabel()}
			accessibilityRole='button'
			accessibilityState={{ disabled: syncStatus.isSyncing }}
		>
			<View
				style={[
					styles.indicator,
					{ backgroundColor: getStatusColor() },
				]}
			>
				<Animated.Text
					style={[
						styles.icon,
						syncStatus.isSyncing && {
							transform: [
								{
									rotate: rotateAnim.interpolate({
										inputRange: [0, 1],
										outputRange: ['0deg', '360deg'],
									}),
								},
							],
						},
					]}
				>
					{getStatusIcon()}
				</Animated.Text>
			</View>
			{showText && (
				<View style={styles.textContainer}>
					<Text style={[styles.statusText, textStyle]}>
						{getStatusText()}
					</Text>
					<Text style={[styles.timeText, textStyle]}>
						Last sync: {formatLastSyncTime()}
					</Text>
				</View>
			)}
		</TouchableOpacity>
	);
};

const styles = StyleSheet.create({
	container: {
		flexDirection: 'row',
		alignItems: 'center',
		padding: 8,
	},
	clickable: {
		opacity: 0.8,
	},
	indicator: {
		width: 24,
		height: 24,
		borderRadius: 12,
		justifyContent: 'center',
		alignItems: 'center',
		marginRight: 8,
	},
	icon: {
		fontSize: 12,
		color: colors.text.light,
	},
	textContainer: {
		flex: 1,
	},
	statusText: {
		fontSize: 12,
		fontFamily: fonts.PoppinsMedium,
		color: colors.text.primary,
	},
	timeText: {
		fontSize: 10,
		fontFamily: fonts.PoppinsRegular,
		color: colors.text.secondary,
	},
});
