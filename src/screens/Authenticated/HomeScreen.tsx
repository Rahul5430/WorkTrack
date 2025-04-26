import { ScrollView, StyleSheet, Text } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import CalendarComponent from '../../components/Calendar';
import Label from '../../components/Label';
import Summary from '../../components/Summary';
import { useResponsiveLayout } from '../../hooks/useResponsive';
import { fonts } from '../../themes';

const HomeScreen: () => React.JSX.Element = () => {
	const { RFValue, getResponsiveSize } = useResponsiveLayout();

	return (
		<SafeAreaView style={[styles.screen]}>
			<ScrollView>
				<Text
					style={[
						styles.headerText,
						{
							fontSize: RFValue(20),
							paddingHorizontal: getResponsiveSize(5).width,
						},
					]}
				>
					WorkTrack
				</Text>
				<CalendarComponent />
				<Label />
				<Summary />
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
