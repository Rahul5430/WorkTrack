import React, { useCallback, useEffect, useMemo } from 'react';
import { Pressable, StyleSheet, Text, ViewStyle } from 'react-native';
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
	isToday?: boolean;
	isCurrentMonth?: boolean;
};

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

const CalendarDay: React.FC<CalendarDayProps> = ({
	day,
	dateString,
	onPress,
	type,
	isToday = false,
	isCurrentMonth = true,
}) => {
	const { getResponsiveSize } = useResponsiveLayout();
	const scale = useSharedValue(1);
	const opacity = useSharedValue(1);
	const backgroundColor = useSharedValue('transparent');
	const shadowOpacity = useSharedValue(0.1);

	const getBackgroundColor = () => {
		if (!isCurrentMonth) return colors.ui.gray[100];
		if (isToday) return colors.ui.blue[100];
		if (!type) return colors.background.primary;
		if (type === WORK_STATUS.HOLIDAY) return colors.weekend;
		if (type === WORK_STATUS.LEAVE) return colors.leave;
		return WORK_STATUS_COLORS[type];
	};

	const getTextColor = () => {
		if (!isCurrentMonth) return colors.text.secondary;
		if (isToday) return colors.ui.blue[600];
		if (!type) return colors.text.primary;
		if (type === WORK_STATUS.HOLIDAY) return colors.text.secondary;
		return type === WORK_STATUS.LEAVE
			? colors.text.primary
			: colors.text.light;
	};

	const getPressedBackgroundColor = () => {
		if (!isCurrentMonth) return colors.ui.gray[200];
		if (isToday) return colors.ui.blue[200];
		if (!type) return colors.ui.gray[200];
		if (type === WORK_STATUS.HOLIDAY) return colors.weekendPressed;
		if (type === WORK_STATUS.LEAVE) return colors.leavePressed;
		return WORK_STATUS_PRESSED_COLORS[type];
	};

	// Update background color when type changes
	useEffect(() => {
		backgroundColor.value = getBackgroundColor();
	}, [type, isCurrentMonth, isToday]);

	const animatedStyle = useAnimatedStyle(() => {
		return {
			transform: [{ scale: scale.value }],
			opacity: opacity.value,
			backgroundColor: backgroundColor.value,
			borderWidth: isToday ? 2 : 0,
			borderColor: colors.ui.blue[400],
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
		backgroundColor.value = withTiming(getPressedBackgroundColor(), {
			duration: 200,
		});
		shadowOpacity.value = withTiming(0.05, { duration: 100 });
	}, []);

	const handlePressOut = useCallback(() => {
		scale.value = withSpring(1, { damping: 12 });
		opacity.value = withTiming(1, { duration: 100 });
		backgroundColor.value = withTiming(getBackgroundColor(), {
			duration: 200,
		});
		shadowOpacity.value = withTiming(0.1, { duration: 100 });
	}, []);

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
			disabled={!isCurrentMonth}
		>
			<Animated.View style={dayStyle}>
				<Text style={[styles.dayTextStyle, { color: getTextColor() }]}>
					{day}
				</Text>
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
