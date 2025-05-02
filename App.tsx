import { NavigationContainer } from '@react-navigation/native';
import React from 'react';
import { PaperProvider } from 'react-native-paper';
import { Provider } from 'react-redux';

import MainNavigator from './src/navigation/MainNavigator';
import { store } from './src/store/store';

function App(): React.JSX.Element {
	return (
		<Provider store={store}>
			<NavigationContainer>
				<PaperProvider>
					<MainNavigator />
				</PaperProvider>
			</NavigationContainer>
		</Provider>
	);
}

export default App;
