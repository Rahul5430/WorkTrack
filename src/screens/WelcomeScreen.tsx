import { StyleSheet, Text, View } from 'react-native';

import { WelcomeStackScreenProps } from '../types/navigation';

const WelcomeScreen: React.FC<
	WelcomeStackScreenProps<'WelcomeScreen'>
> = () => {
	return (
		<View style={styles.screen}>
			<Text>Welcome Screen</Text>
		</View>
	);
};

const styles = StyleSheet.create({
	screen: {
		flex: 1,
	},
});

export default WelcomeScreen;
