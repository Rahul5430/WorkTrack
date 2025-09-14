import { NavigationContainer } from '@react-navigation/native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { Provider as PaperProvider } from 'react-native-paper';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { Provider as ReduxProvider } from 'react-redux';

import { GlobalToast } from './src/components';
import MainNavigator from './src/navigation/MainNavigator';
import { store } from './src/store';

export default function App() {
	return (
		<GestureHandlerRootView style={{ flex: 1 }}>
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
