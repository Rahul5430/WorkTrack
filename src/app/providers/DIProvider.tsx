// migrated to V2 structure
import * as React from 'react';

import { createContainer } from '@/di';

const DIContext = React.createContext<ReturnType<
	typeof createContainer
> | null>(null);

interface DIProviderProps {
	children: React.ReactNode;
}

export function DIProvider({ children }: DIProviderProps) {
	const container = createContainer();

	return (
		<DIContext.Provider value={container}>{children}</DIContext.Provider>
	);
}

export function useDI() {
	const container = React.useContext(DIContext);
	if (!container) {
		throw new Error('useDI must be used within a DIProvider');
	}
	return container;
}
