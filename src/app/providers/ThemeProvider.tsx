// migrated to V2 structure
import * as React from 'react';

import { theme } from '@/shared/ui/theme';

const ThemeContext = React.createContext(theme);

interface ThemeProviderProps {
	children: React.ReactNode;
}

export function ThemeProvider({ children }: ThemeProviderProps) {
	return (
		<ThemeContext.Provider value={theme}>{children}</ThemeContext.Provider>
	);
}

export function useTheme() {
	return React.useContext(ThemeContext);
}
