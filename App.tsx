import { NavigationContainer } from '@react-navigation/native';
import { useEffect } from 'react';
import { StyleSheet } from 'react-native';
import BootSplash from 'react-native-bootsplash';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { Provider as PaperProvider } from 'react-native-paper';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { Provider as ReduxProvider } from 'react-redux';

import { GlobalToast } from './src/components';
import MainNavigator from './src/navigation/MainNavigator';
import { store } from './src/store';

export default function App() {
	useEffect(() => {
		const init = async () => {
			// Hide the splash screen when the app is ready
			await BootSplash.hide({ fade: true });
		};

		init();
	}, []);

	return (
		<GestureHandlerRootView style={styles.container}>
			<SafeAreaProvider>
				<ReduxProvider store={store}>
					<PaperProvider>
						<NavigationContainer>
							<MainNavigator />
							<GlobalToast />
						</NavigationContainer>
					</PaperProvider>
				</ReduxProvider>
			</SafeAreaProvider>
		</GestureHandlerRootView>
	);
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
	},
});
