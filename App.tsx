import { NavigationContainer } from '@react-navigation/native';
import React from 'react';
import { PaperProvider } from 'react-native-paper';

import MainNavigator from './src/navigation/MainNavigator';

function App(): React.JSX.Element {
	return (
		<NavigationContainer>
			<PaperProvider>
				<MainNavigator />
			</PaperProvider>
		</NavigationContainer>
	);
}

export default App;
