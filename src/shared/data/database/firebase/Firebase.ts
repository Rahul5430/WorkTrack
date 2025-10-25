// migrated to V2 structure
import { Analytics, getAnalytics } from 'firebase/analytics';
import { FirebaseApp, getApps, initializeApp } from 'firebase/app';
import { Auth, getAuth } from 'firebase/auth';
import {
	connectFirestoreEmulator,
	Firestore,
	getFirestore,
} from 'firebase/firestore';
import { getPerformance, Performance } from 'firebase/performance';

// Firebase configuration
const firebaseConfig = {
	apiKey: process.env.EXPO_PUBLIC_FIREBASE_API_KEY,
	authDomain: process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN,
	projectId: process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID,
	storageBucket: process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET,
	messagingSenderId: process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
	appId: process.env.EXPO_PUBLIC_FIREBASE_APP_ID,
	measurementId: process.env.EXPO_PUBLIC_FIREBASE_MEASUREMENT_ID,
};

// Initialize Firebase app (only if not already initialized)
const app: FirebaseApp =
	getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];

// Initialize Firebase services
const auth: Auth = getAuth(app);
const firestore: Firestore = getFirestore(app);
let analytics: Analytics | null = null;
let performance: Performance | null = null;

// Initialize analytics only in production and on web
if (typeof window !== 'undefined' && process.env.NODE_ENV === 'production') {
	try {
		analytics = getAnalytics(app);
		performance = getPerformance(app);
	} catch (error) {
		// console.warn(
		// 	'Failed to initialize Firebase analytics/performance:',
		// 	error
		// );
	}
}

// Connect to Firestore emulator if FIRESTORE_EMULATOR_HOST is set
if (process.env.FIRESTORE_EMULATOR_HOST) {
	const emulatorHost = process.env.FIRESTORE_EMULATOR_HOST;
	const emulatorPort = process.env.FIRESTORE_EMULATOR_PORT || '8080';

	try {
		connectFirestoreEmulator(
			firestore,
			emulatorHost,
			parseInt(emulatorPort, 10)
		);
		// console.log(
		// 	`Connected to Firestore emulator at ${emulatorHost}:${emulatorPort}`
		// );
	} catch (error) {
		// console.warn('Failed to connect to Firestore emulator:', error);
	}
}

// Export Firebase services
export { analytics, app, auth, firestore, performance };

// Export default app
export default app;

// Export types
export type { Analytics, Auth, FirebaseApp, Firestore, Performance };
