import { NavigationContainer } from '@react-navigation/native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { Provider as PaperProvider } from 'react-native-paper';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { Provider as ReduxProvider } from 'react-redux';

import MainNavigator from './src/navigation/MainNavigator';
import { store } from './src/store/store';
import { theme } from './src/themes/theme';

export default function App() {
	return (
		<GestureHandlerRootView style={{ flex: 1 }}>
			<SafeAreaProvider>
				<ReduxProvider store={store}>
					<PaperProvider theme={theme}>
						<NavigationContainer>
							<MainNavigator />
						</NavigationContainer>
					</PaperProvider>
				</ReduxProvider>
			</SafeAreaProvider>
		</GestureHandlerRootView>
	);
}
