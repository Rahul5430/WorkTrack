// migrated to V2 structure
export type { Analytics, Auth, FirebaseApp, Firestore } from './Firebase';
export { analytics, app, auth, firestore, performance } from './Firebase';
export {
	firestoreClient as default,
	FirestoreClient,
	firestoreClient,
} from './FirestoreClient';
