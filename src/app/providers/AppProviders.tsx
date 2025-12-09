// migrated to V2 structure
import * as React from 'react';
import { Provider as ReduxProvider } from 'react-redux';

import { store } from '../store/store';
import { DIProvider } from './DIProvider';
import { ThemeProvider } from './ThemeProvider';

interface AppProvidersProps {
	children?: React.ReactNode;
}

export function AppProviders({ children }: AppProvidersProps) {
	return (
		<ReduxProvider store={store}>
			<DIProvider>
				<ThemeProvider>{children}</ThemeProvider>
			</DIProvider>
		</ReduxProvider>
	);
}
