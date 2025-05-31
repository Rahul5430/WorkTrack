import { database } from '../db/watermelon';
import { setWorkTrackData } from '../store/reducers/workTrackSlice';
import { store } from '../store/store';

export const clearAppData = async () => {
	try {
		// Clear Redux store data first
		store.dispatch(setWorkTrackData([]));

		// Clear any other app data (localStorage, etc.)
		try {
			localStorage.clear();
			sessionStorage.clear();
		} catch (e) {
			console.warn('Error clearing storage:', e);
		}

		// Clear WatermelonDB data last
		await database.write(async () => {
			await database.unsafeResetDatabase();
		});

		return true;
	} catch (error) {
		console.error('Error clearing app data:', error);
		throw error;
	}
};
