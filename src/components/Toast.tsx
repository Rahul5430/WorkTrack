import React, { useEffect, useRef } from 'react';
import { Animated, StyleSheet, Text, View } from 'react-native';

import { fonts } from '../themes';
import { colors } from '../themes/colors';

export type ToastType = 'success' | 'error' | 'info';
export type ToastPosition = 'top' | 'bottom';

interface ToastProps {
	visible: boolean;
	message: string;
	type?: ToastType;
	duration?: number;
	position?: ToastPosition;
	onHide?: () => void;
}

export const Toast: React.FC<ToastProps> = ({
	visible,
	message,
	type = 'info',
	duration = 3000,
	position = 'bottom',
	onHide,
}) => {
	const fadeAnim = useRef(new Animated.Value(0)).current;
	const slideAnim = useRef(
		new Animated.Value(position === 'top' ? -50 : 50)
	).current;

	useEffect(() => {
		if (visible) {
			// Show animation
			Animated.parallel([
				Animated.timing(fadeAnim, {
					toValue: 1,
					duration: 300,
					useNativeDriver: true,
				}),
				Animated.timing(slideAnim, {
					toValue: 0,
					duration: 300,
					useNativeDriver: true,
				}),
			]).start();

			// Auto-hide after duration
			const timer = setTimeout(() => {
				hideToast();
			}, duration);

			return () => clearTimeout(timer);
		}
		return undefined;
	}, [visible, duration]);

	const hideToast = () => {
		Animated.parallel([
			Animated.timing(fadeAnim, {
				toValue: 0,
				duration: 300,
				useNativeDriver: true,
			}),
			Animated.timing(slideAnim, {
				toValue: position === 'top' ? -50 : 50,
				duration: 300,
				useNativeDriver: true,
			}),
		]).start(() => {
			onHide?.();
		});
	};

	const getToastStyle = () => {
		switch (type) {
			case 'success':
				return {
					backgroundColor: colors.wfh,
					borderLeftColor: colors.wfh,
				};
			case 'error':
				return {
					backgroundColor: colors.error,
					borderLeftColor: colors.error,
				};
			default:
				return {
					backgroundColor: colors.button.primary,
					borderLeftColor: colors.button.primary,
				};
		}
	};

	const getIcon = () => {
		switch (type) {
			case 'success':
				return '✓';
			case 'error':
				return '✕';
			default:
				return 'ℹ';
		}
	};

	if (!visible) return null;

	return (
		<Animated.View
			style={[
				styles.container,
				position === 'top'
					? styles.containerTop
					: styles.containerBottom,
				{
					opacity: fadeAnim,
					transform: [{ translateY: slideAnim }],
				},
			]}
		>
			<View style={[styles.toast, getToastStyle()]}>
				<Text style={styles.icon}>{getIcon()}</Text>
				<Text style={styles.message}>{message}</Text>
			</View>
		</Animated.View>
	);
};

const styles = StyleSheet.create({
	container: {
		position: 'absolute',
		left: 20,
		right: 20,
		zIndex: 1001,
	},
	containerTop: {
		top: 60, // Below status bar
	},
	containerBottom: {
		bottom: 60, // Above bottom safe area
	},
	toast: {
		flexDirection: 'row',
		alignItems: 'center',
		paddingHorizontal: 16,
		paddingVertical: 12,
		borderRadius: 8,
		borderLeftWidth: 4,
		shadowColor: '#000',
		shadowOffset: {
			width: 0,
			height: 2,
		},
		shadowOpacity: 0.25,
		shadowRadius: 3.84,
		elevation: 5,
	},
	icon: {
		fontSize: 16,
		marginRight: 8,
		color: colors.text.light,
	},
	message: {
		flex: 1,
		fontSize: 14,
		fontFamily: fonts.PoppinsMedium,
		color: colors.text.light,
	},
});
