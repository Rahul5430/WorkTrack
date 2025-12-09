import { BottomSheetModalProvider } from '@gorhom/bottom-sheet';
import { useEffect } from 'react';
import { AppState, AppStateStatus, LogBox, StyleSheet } from 'react-native';
import BootSplash from 'react-native-bootsplash';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { Provider as PaperProvider } from 'react-native-paper';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { Provider as ReduxProvider } from 'react-redux';

import { RootNavigator } from '@/app/navigation';
import { AppProviders } from '@/app/providers';
import { store } from '@/app/store';
import { GlobalToast } from '@/shared/ui/components/feedback';

// Ignore known dev warnings until migration is complete
if (__DEV__) {
	LogBox.ignoreLogs([
		'JSI SQLiteAdapter not available',
		'React Native Firebase namespaced API',
		'Please use getApp()',
		'Method called was `collection`',
		'Method called was `get`',
		'Method called was `onAuthStateChanged`',
		'This method is deprecated',
		'will be removed in the next major release',
		'migrating-to-v22',
	]);
}

export default function App() {
	useEffect(() => {
		const init = async () => {
			// Hide the splash screen when the app is ready
			await BootSplash.hide({ fade: true });
		};

		init();
	}, []);

	// Handle app state changes to prevent gesture handler issues when Metro disconnects
	useEffect(() => {
		const handleAppStateChange = (_nextAppState: AppStateStatus) => {
			// When app becomes inactive (Metro disconnects), we don't need to do anything special
			// The gesture handler will automatically handle this
			// Logging is handled by the individual components that need it
		};

		const subscription = AppState.addEventListener(
			'change',
			handleAppStateChange
		);
		return () => subscription?.remove();
	}, []);

	return (
		<GestureHandlerRootView style={styles.container}>
			<SafeAreaProvider>
				<ReduxProvider store={store}>
					<PaperProvider>
						<BottomSheetModalProvider>
							<AppProviders>
								<RootNavigator />
								<GlobalToast />
							</AppProviders>
						</BottomSheetModalProvider>
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
