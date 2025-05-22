import { NavigationContainer } from '@react-navigation/native';
import React from 'react';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { PaperProvider } from 'react-native-paper';
import { Provider } from 'react-redux';

import MainNavigator from './src/navigation/MainNavigator';
import { store } from './src/store/store';

function App(): React.JSX.Element {
	return (
		<Provider store={store}>
			<NavigationContainer>
				<PaperProvider>
					<GestureHandlerRootView style={{ flex: 1 }}>
						<MainNavigator />
					</GestureHandlerRootView>
				</PaperProvider>
			</NavigationContainer>
		</Provider>
	);
}

export default App;
