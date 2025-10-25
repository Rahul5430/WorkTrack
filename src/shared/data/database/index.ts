// migrated to V2 structure
// WatermelonDB exports
export type { DatabaseMigrations, DatabaseSchema } from './watermelon';
export { database, database as watermelonDB } from './watermelon';
export { migrations as watermelonMigrations } from './watermelon/migrations';
export { schema as watermelonSchema } from './watermelon/schema';

// Firebase exports
export type {
	Analytics,
	Auth,
	FirebaseApp,
	Firestore,
	Performance,
} from './firebase';
export { analytics, app, auth, firestore, performance } from './firebase';
export { FirestoreClient, firestoreClient } from './firebase/FirestoreClient';
