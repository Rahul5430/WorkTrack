import React from 'react';
import { Pressable, StyleSheet, Text } from 'react-native';
import Animated, {
	useAnimatedStyle,
	useSharedValue,
	withSpring,
} from 'react-native-reanimated';

import { WORK_STATUS, WORK_STATUS_COLORS } from '../../constants/workStatus';
import { useResponsiveLayout } from '../../hooks/useResponsive';
import { fonts } from '../../themes';
import { MarkedDayStatus } from '../../types/calendar';

type CalendarDayProps = {
	day: number;
	dateString: string;
	onPress: (date: string) => void;
	type: MarkedDayStatus;
};

const CalendarDay: React.FC<CalendarDayProps> = ({
	day,
	dateString,
	onPress,
	type,
}) => {
	const { RFValue } = useResponsiveLayout();
	const scale = useSharedValue(1);

	const animatedStyle = useAnimatedStyle(() => ({
		transform: [{ scale: scale.value }],
	}));

	const handlePressIn = () => {
		scale.value = withSpring(0.95, { damping: 15 });
	};

	const handlePressOut = () => {
		scale.value = withSpring(1, { damping: 15 });
	};

	const handlePress = () => {
		onPress(dateString);
	};

	const getBackgroundColor = () => {
		switch (type) {
			case WORK_STATUS.OFFICE:
				return WORK_STATUS_COLORS[WORK_STATUS.OFFICE];
			case WORK_STATUS.WFH:
				return WORK_STATUS_COLORS[WORK_STATUS.WFH];
			default:
				return '#F3F4F6';
		}
	};

	const getTextColor = () => {
		return type === WORK_STATUS.HOLIDAY ? '#000' : '#fff';
	};

	return (
		<Pressable
			onPressIn={handlePressIn}
			onPressOut={handlePressOut}
			onPress={handlePress}
			style={{ borderRadius: 8 }}
		>
			<Animated.View
				style={[
					styles.dayStyle,
					animatedStyle,
					{ backgroundColor: getBackgroundColor() },
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
	dayStyle: {
		backgroundColor: '#F3F4F6',
		borderRadius: 8,
		width: 43,
		height: 43,
		justifyContent: 'center',
		alignItems: 'center',
	},
	dayTextStyle: {
		fontFamily: fonts.PoppinsRegular,
	},
});

export default CalendarDay;
