// migrated to V2 structure
export type { Analytics, Auth, FirebaseApp, Firestore } from './Firebase';
export { analytics, app, auth, firestore, performance } from './Firebase';
export {
	firestoreClient as default,
	FirestoreClient,
	firestoreClient,
} from './FirestoreClient';
export type {
	BaseFirestoreDocument,
	DocumentData,
	FirestoreEntryDocument,
	FirestoreShareDocument,
	FirestoreTrackerDocument,
	FirestoreUserDocument,
	KnownFirestoreDocument,
} from './FirestoreDocumentTypes';
export type {
	FirestoreLimitConstraint,
	FirestoreOrderByConstraint,
	FirestoreQueryConstraint,
	FirestoreQueryValue,
	FirestoreStartAfterConstraint,
	FirestoreWhereConstraint,
} from './FirestoreQueryTypes';
