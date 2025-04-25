import { ScrollView, StyleSheet, Text } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import CalendarComponent from '../../components/Calendar';
import Label from '../../components/Label';
import { useResponsiveLayout } from '../../hooks/useResponsive';
import { fonts } from '../../themes';

const HomeScreen: () => React.JSX.Element = () => {
	const { getResponsiveSize, RFValue } = useResponsiveLayout();

	return (
		<SafeAreaView
			style={[
				styles.screen,
				{
					paddingHorizontal: getResponsiveSize(5).width,
					paddingVertical: getResponsiveSize(5).width,
				},
			]}
		>
			<ScrollView>
				<Text style={[styles.headerText, { fontSize: RFValue(20) }]}>
					WorkTrack
				</Text>
				<CalendarComponent />
				<Label />
			</ScrollView>
		</SafeAreaView>
	);
};

const styles = StyleSheet.create({
	screen: {
		backgroundColor: 'white',
		flex: 1,
	},
	headerText: {
		color: '#111827',
		fontFamily: fonts.PoppinsSemiBold,
		marginBottom: 10,
	},
});

export default HomeScreen;
