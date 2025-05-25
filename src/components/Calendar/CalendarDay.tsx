import React from 'react';
import { Pressable, StyleSheet, Text } from 'react-native';
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
	type: MarkedDayStatus;
	isToday?: boolean;
	isCurrentMonth?: boolean;
};

const CalendarDay: React.FC<CalendarDayProps> = ({
	day,
	dateString,
	onPress,
	type,
	isToday = false,
	isCurrentMonth = true,
}) => {
	const { RFValue } = useResponsiveLayout();

	const getBackgroundColor = () => {
		if (isToday) return colors.ui.blue[100];
		switch (type) {
			case WORK_STATUS.OFFICE:
				return WORK_STATUS_COLORS[WORK_STATUS.OFFICE];
			case WORK_STATUS.WFH:
				return WORK_STATUS_COLORS[WORK_STATUS.WFH];
			default:
				return colors.background.secondary;
		}
	};

	const getTextColor = () => {
		if (isToday) return colors.ui.blue[600];
		return type === WORK_STATUS.HOLIDAY
			? colors.text.primary
			: colors.text.light;
	};

	const getPressedBackgroundColor = () => {
		if (isToday) return colors.ui.blue[200];
		return WORK_STATUS_PRESSED_COLORS[type];
	};

	const scale = useSharedValue(1);
	const opacity = useSharedValue(1);
	const backgroundColor = useSharedValue(getBackgroundColor());

	const animatedStyle = useAnimatedStyle(() => ({
		transform: [{ scale: scale.value }],
		opacity: opacity.value,
		backgroundColor: backgroundColor.value,
		borderWidth: isToday ? 2 : 0,
		borderColor: colors.ui.blue[400],
	}));

	const handlePressIn = () => {
		scale.value = withSpring(0.92, { damping: 12 });
		opacity.value = withTiming(0.8, { duration: 150 });
		backgroundColor.value = withTiming(getPressedBackgroundColor(), {
			duration: 150,
		});
	};

	const handlePressOut = () => {
		scale.value = withSpring(1, { damping: 12 });
		opacity.value = withTiming(1, { duration: 150 });
		backgroundColor.value = withTiming(getBackgroundColor(), {
			duration: 150,
		});
	};

	const handlePress = () => {
		onPress(dateString);
	};

	return (
		<Pressable
			onPressIn={handlePressIn}
			onPressOut={handlePressOut}
			onPress={handlePress}
			style={styles.pressable}
		>
			<Animated.View
				style={[
					styles.dayStyle,
					animatedStyle,
					!isCurrentMonth && styles.otherMonthDay,
				]}
			>
				<Text
					style={[
						styles.dayTextStyle,
						{ color: getTextColor(), fontSize: RFValue(14) },
					]}
				>
					{day}
				</Text>
			</Animated.View>
		</Pressable>
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
		shadowColor: colors.text.primary,
		shadowOffset: {
			width: 0,
			height: 2,
		},
		shadowOpacity: 0.1,
		shadowRadius: 3,
		elevation: 2,
	},
	otherMonthDay: {
		shadowOpacity: 0,
		elevation: 0,
	},
	dayTextStyle: {
		fontFamily: fonts.PoppinsMedium,
	},
});

export default CalendarDay;
