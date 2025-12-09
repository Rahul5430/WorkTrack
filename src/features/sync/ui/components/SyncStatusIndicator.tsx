import MaterialDesignIcons, {
	type MaterialDesignIconsIconName,
} from '@react-native-vector-icons/material-design-icons';
import React, { useCallback, useEffect, useState } from 'react';
import { StyleSheet, View, ViewStyle } from 'react-native';
import Animated, {
	Easing,
	useAnimatedStyle,
	useSharedValue,
	withRepeat,
	withTiming,
} from 'react-native-reanimated';

import { useWorkTrackManager } from '@/hooks';
import { colors } from '@/shared/ui/theme';

interface SyncStatusIndicatorProps {
	style?: ViewStyle;
}

export const SyncStatusIndicator: React.FC<SyncStatusIndicatorProps> = ({
	style,
}) => {
	const manager = useWorkTrackManager();
	const [syncStatus, setSyncStatus] = useState<{
		isSyncing: boolean;
		isOnline: boolean;
		lastSyncTime?: number;
	}>({
		isSyncing: false,
		isOnline: true,
	});

	const rotation = useSharedValue(0);

	const updateStatus = useCallback(async () => {
		try {
			const status = await manager.getSyncStatus();
			setSyncStatus(status);
		} catch {
			// If sync status check fails, assume we're not syncing
			setSyncStatus((prev) => ({ ...prev, isSyncing: false }));
		}
	}, [manager]);

	// Handle rotating animation for syncing state
	useEffect(() => {
		if (syncStatus?.isSyncing) {
			rotation.value = withRepeat(
				withTiming(360, { duration: 1000, easing: Easing.linear }),
				-1,
				false
			);
		} else {
			rotation.value = 0;
		}
	}, [rotation, syncStatus?.isSyncing]);

	const animatedStyle = useAnimatedStyle(() => ({
		transform: [{ rotate: `${-rotation.value}deg` }],
	}));

	useEffect(() => {
		// Update immediately on mount
		updateStatus();
		// Then update every 500ms for very responsive UI
		const interval = setInterval(updateStatus, 500);
		return () => clearInterval(interval);
	}, [updateStatus]);

	const getStatusIconProps = (): {
		name: MaterialDesignIconsIconName;
		color: string;
		rotate: boolean;
	} => {
		if (syncStatus?.isSyncing) {
			return { name: 'sync', color: colors.wfh, rotate: true };
		}
		if (!syncStatus?.isOnline) {
			return {
				name: 'cloud-off-outline',
				color: colors.error,
				rotate: false,
			};
		}
		return {
			name: 'check-circle-outline',
			color: colors.wfh,
			rotate: false,
		};
	};

	return (
		<View style={[styles.container, style]}>
			<View>
				{syncStatus?.isSyncing ? (
					<Animated.View style={animatedStyle}>
						<MaterialDesignIcons
							name={getStatusIconProps().name}
							size={16}
							color={getStatusIconProps().color}
							style={{
								transform: [
									{
										rotate: getStatusIconProps().rotate
											? '0deg'
											: '0deg',
									},
								],
							}}
						/>
					</Animated.View>
				) : (
					<MaterialDesignIcons
						name={getStatusIconProps().name}
						size={16}
						color={getStatusIconProps().color}
					/>
				)}
			</View>
		</View>
	);
};

const styles = StyleSheet.create({
	container: {
		flexDirection: 'row',
		alignItems: 'center',
	},
});

export default SyncStatusIndicator;
