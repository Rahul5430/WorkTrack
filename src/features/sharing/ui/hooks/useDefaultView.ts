// migrated to V2 structure
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useCallback, useEffect, useState } from 'react';

const DEFAULT_VIEW_USER_ID_KEY = 'defaultViewUserId';

export const useDefaultView = () => {
	const [defaultViewUserId, setDefaultViewUserId] = useState<string | null>(
		null
	);

	const loadDefaultView = useCallback(async () => {
		try {
			const userId = await AsyncStorage.getItem(DEFAULT_VIEW_USER_ID_KEY);
			setDefaultViewUserId(userId);
		} catch {
			// Silently fail on load
		}
	}, []);

	const setDefaultView = useCallback(
		async (userId: string): Promise<void> => {
			try {
				const currentDefaultView = await AsyncStorage.getItem(
					DEFAULT_VIEW_USER_ID_KEY
				);
				const newDefaultView =
					currentDefaultView === userId ? null : userId;

				if (newDefaultView) {
					await AsyncStorage.setItem(
						DEFAULT_VIEW_USER_ID_KEY,
						newDefaultView
					);
				} else {
					await AsyncStorage.removeItem(DEFAULT_VIEW_USER_ID_KEY);
				}

				setDefaultViewUserId(newDefaultView);
			} catch (error) {
				// Re-throw error for caller to handle
				throw error;
			}
		},
		[]
	);

	const clearDefaultView = useCallback(async (): Promise<void> => {
		try {
			await AsyncStorage.removeItem(DEFAULT_VIEW_USER_ID_KEY);
			setDefaultViewUserId(null);
		} catch {
			// Silently fail on clear
		}
	}, []);

	useEffect(() => {
		loadDefaultView();
	}, [loadDefaultView]);

	return {
		defaultViewUserId,
		setDefaultView,
		clearDefaultView,
		loadDefaultView,
	};
};
