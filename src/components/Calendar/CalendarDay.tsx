import React, { useCallback, useEffect, useMemo } from 'react';
import { Pressable, StyleSheet, Text, View, ViewStyle } from 'react-native';
import Animated, {
	useAnimatedStyle,
	useSharedValue,
	withSpring,
	withTiming,
} from 'react-native-reanimated';

import {
	WORK_STATUS,
	WORK_STATUS_COLORS,
	WORK_STATUS_PRESSED_COLORS,
} from '../../constants/workStatus';
import { useResponsiveLayout } from '../../hooks/useResponsive';
import { fonts } from '../../themes';
import { colors } from '../../themes/colors';
import { MarkedDayStatus } from '../../types/calendar';

type CalendarDayProps = {
	day: number;
	dateString: string;
	onPress: (date: string) => void;
	type?: MarkedDayStatus;
	isAdvisory?: boolean;
	isToday?: boolean;
	isCurrentMonth?: boolean;
};

type DayColors = {
	background: string;
	text: string;
	pressed: string;
};

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

const CalendarDay: React.FC<CalendarDayProps> = ({
	day,
	dateString,
	onPress,
	type,
	isAdvisory,
	isToday = false,
	isCurrentMonth = true,
}) => {
	const { getResponsiveSize } = useResponsiveLayout();
	const scale = useSharedValue(1);
	const opacity = useSharedValue(1);
	const backgroundColor = useSharedValue('transparent');
	const shadowOpacity = useSharedValue(0.1);

	const dayColors = useMemo<DayColors>(() => {
		if (isToday) {
			return {
				background: colors.ui.blue[100],
				text: colors.ui.blue[600],
				pressed: colors.ui.blue[200],
			};
		}

		if (type === WORK_STATUS.HOLIDAY) {
			return {
				background: colors.background.holiday,
				text: colors.text.secondary,
				pressed: colors.background.holiday + '80',
			};
		}

		if (type === WORK_STATUS.LEAVE) {
			return {
				background: colors.error,
				text: colors.text.light,
				pressed: colors.background.error + '80',
			};
		}

		if (type) {
			return {
				background: WORK_STATUS_COLORS[type],
				text: colors.text.light,
				pressed: WORK_STATUS_PRESSED_COLORS[type],
			};
		}

		if (!isCurrentMonth) {
			return {
				background: colors.ui.gray[100],
				text: colors.text.secondary,
				pressed: colors.ui.gray[200],
			};
		}

		return {
			background: isAdvisory
				? colors.forecast + '40'
				: colors.ui.gray[100],
			text: isAdvisory ? colors.forecast : colors.text.primary,
			pressed: isAdvisory ? colors.forecast + '60' : colors.ui.gray[200],
		};
	}, [isToday, type, isCurrentMonth, dateString, isAdvisory]);

	// Update background color when type changes
	useEffect(() => {
		backgroundColor.value = dayColors.background;
	}, [dayColors.background]);

	const animatedStyle = useAnimatedStyle(() => {
		return {
			transform: [{ scale: scale.value }],
			opacity: opacity.value,
			backgroundColor: backgroundColor.value,
			borderWidth: isToday ? 2 : 0,
			borderColor: isToday ? colors.ui.blue[400] : undefined,
			shadowColor: colors.text.primary,
			shadowOffset: {
				width: 0,
				height: 2,
			},
			shadowOpacity: shadowOpacity.value,
			shadowRadius: 3,
			elevation: 2,
		};
	});

	const handlePress = useCallback(() => {
		onPress(dateString);
	}, [onPress, dateString]);

	const handlePressIn = useCallback(() => {
		scale.value = withSpring(0.92, { damping: 12 });
		opacity.value = withTiming(0.8, { duration: 100 });
		backgroundColor.value = withTiming(dayColors.pressed, {
			duration: 200,
		});
		shadowOpacity.value = withTiming(0.05, { duration: 100 });
	}, [dayColors.pressed]);

	const handlePressOut = useCallback(() => {
		scale.value = withSpring(1, { damping: 12 });
		opacity.value = withTiming(1, { duration: 100 });
		backgroundColor.value = withTiming(dayColors.background, {
			duration: 200,
		});
		shadowOpacity.value = withTiming(0.1, { duration: 100 });
	}, [dayColors.background]);

	const containerStyle = useMemo(
		() => [
			styles.pressable,
			{
				width: getResponsiveSize(40),
				height: getResponsiveSize(40),
			},
			animatedStyle,
		],
		[getResponsiveSize, animatedStyle]
	);

	const dayStyle = useMemo(
		() =>
			[
				styles.dayStyle,
				{
					fontSize: getResponsiveSize(14),
					lineHeight: getResponsiveSize(20),
				},
				!isCurrentMonth && styles.otherMonthDay,
				isToday && styles.today,
				type === WORK_STATUS.HOLIDAY && styles.holiday,
				type === WORK_STATUS.LEAVE && styles.leave,
				type === WORK_STATUS.WFH && styles.workFromHome,
				type === WORK_STATUS.OFFICE && styles.workFromOffice,
			] as ViewStyle[],
		[getResponsiveSize, isCurrentMonth, isToday, type]
	);

	return (
		<AnimatedPressable
			style={containerStyle}
			onPress={handlePress}
			onPressIn={handlePressIn}
			onPressOut={handlePressOut}
		>
			<Animated.View style={dayStyle}>
				{isAdvisory ? (
					<View style={styles.circleContainer}>
						<Text
							style={[
								styles.dayTextStyle,
								{ color: dayColors.text },
							]}
						>
							{day}
						</Text>
					</View>
				) : (
					<Text
						style={[styles.dayTextStyle, { color: dayColors.text }]}
					>
						{day}
					</Text>
				)}
			</Animated.View>
		</AnimatedPressable>
	);
};

const styles = StyleSheet.create({
	pressable: {
		borderRadius: 8,
		margin: 2,
	},
	dayStyle: {
		borderRadius: 8,
		width: 43,
		height: 43,
		justifyContent: 'center',
		alignItems: 'center',
	},
	circleContainer: {
		width: 32,
		height: 32,
		borderRadius: 16,
		backgroundColor: colors.forecast + '80',
		justifyContent: 'center',
		alignItems: 'center',
	},
	otherMonthDay: {
		shadowOpacity: 0,
		elevation: 0,
	},
	dayTextStyle: {
		fontFamily: fonts.PoppinsMedium,
	},
	today: {
		color: colors.ui.blue[600],
		fontWeight: '600',
	},
	holiday: {
		color: colors.text.secondary,
	},
	leave: {
		color: colors.text.primary,
	},
	workFromHome: {
		color: colors.text.light,
	},
	workFromOffice: {
		color: colors.text.light,
	},
});

export default React.memo(CalendarDay);
