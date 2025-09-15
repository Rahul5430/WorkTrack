import { FIRESTORE_EMULATOR_HOST } from '@env';
import { getApp } from '@react-native-firebase/app';
import {
	connectFirestoreEmulator,
	FirebaseFirestoreTypes,
	getFirestore,
} from '@react-native-firebase/firestore';

import { logger } from '../logging';

let firestoreInstance: FirebaseFirestoreTypes.Module | null = null;

/**
 * Get Firestore instance with emulator connection in development
 * @returns Firestore instance
 */
export const getFirestoreInstance = (): FirebaseFirestoreTypes.Module => {
	if (firestoreInstance) {
		return firestoreInstance;
	}

	const app = getApp();
	const db = getFirestore(app);

	// Connect to Firestore emulator in development
	const hasEmulatorHost =
		typeof FIRESTORE_EMULATOR_HOST !== 'undefined' &&
		Boolean(FIRESTORE_EMULATOR_HOST);
	if (__DEV__ && hasEmulatorHost) {
		try {
			const [host, port] = (FIRESTORE_EMULATOR_HOST as string).split(':');
			connectFirestoreEmulator(db, host, Number(port));
			logger.debug(`Connected to Firestore emulator at ${host}:${port}`);
		} catch (error) {
			// Emulator might already be connected, ignore the error
			logger.warn('Firestore emulator connection warning:', error);
		}
	}

	firestoreInstance = db;
	return db;
};

/**
 * Get Firebase app instance
 * @returns Firebase app instance
 */
export const getFirebaseApp = () => {
	return getApp();
};
