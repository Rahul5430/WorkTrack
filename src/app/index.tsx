// migrated to V2 structure
import * as React from 'react';

import { RootNavigator } from './navigation';
import { AppProviders } from './providers';

export default function App() {
	return (
		<AppProviders>
			<RootNavigator />
		</AppProviders>
	);
}
