// migrated to V2 structure
// React Native Firebase - reads config from google-services.json (Android) and GoogleService-Info.plist (iOS)
// Using modular API (v22+)
import { getApp } from '@react-native-firebase/app';
import { getAuth } from '@react-native-firebase/auth';
import { getFirestore } from '@react-native-firebase/firestore';

// React Native Firebase initializes automatically from native config files
// No need to initialize manually - just get the instances using modular API
const app = getApp();
const auth = getAuth();
const firestoreInstance = getFirestore(app);

// Analytics and Performance are not available in React Native Firebase
// Use native Firebase Analytics SDK if needed
const analytics = null;
const performance = null;

// Export Firebase services
export { analytics, app, auth, performance };
export { firestoreInstance as firestore };

// Export default app
export default app;

// Export types (using React Native Firebase types)
export type { FirebaseAuthTypes } from '@react-native-firebase/auth';
export type { FirebaseFirestoreTypes } from '@react-native-firebase/firestore';

// Type aliases for compatibility
export type Auth = ReturnType<typeof getAuth>;
export type Firestore = ReturnType<typeof getFirestore>;
export type Analytics = null;
export type FirebaseApp = ReturnType<typeof getApp>;
