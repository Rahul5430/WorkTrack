// migrated to V2 structure
import { Timestamp } from 'firebase/firestore';

// Mock Firebase Auth
export const mockAuth = {
	currentUser: {
		uid: 'test-user-id',
		email: 'test@example.com',
		displayName: 'Test User',
		photoURL: 'https://example.com/photo.jpg',
		emailVerified: true,
	},
	signInWithEmailAndPassword: jest.fn(),
	signInWithPopup: jest.fn(),
	signOut: jest.fn(),
	onAuthStateChanged: jest.fn(),
	sendPasswordResetEmail: jest.fn(),
	createUserWithEmailAndPassword: jest.fn(),
	updateProfile: jest.fn(),
};

// Mock Firestore
export const mockFirestore = {
	collection: jest.fn(),
	doc: jest.fn(),
	runTransaction: jest.fn(),
	batch: jest.fn(),
	enableNetwork: jest.fn(),
	disableNetwork: jest.fn(),
	clearPersistence: jest.fn(),
	terminate: jest.fn(),
	waitForPendingWrites: jest.fn(),
	onSnapshotsInSync: jest.fn(),
};

// Mock Firestore Document
export const mockDocumentSnapshot = {
	id: 'test-doc-id',
	exists: () => true,
	data: () => ({
		field1: 'value1',
		field2: 'value2',
		createdAt: Timestamp.fromDate(new Date('2024-01-01T00:00:00Z')),
		updatedAt: Timestamp.fromDate(new Date('2024-01-01T00:00:00Z')),
	}),
	ref: {
		id: 'test-doc-id',
		path: 'test-collection/test-doc-id',
	},
	metadata: {
		fromCache: false,
		hasPendingWrites: false,
	},
};

// Mock Firestore Query Snapshot
export const mockQuerySnapshot = {
	docs: [mockDocumentSnapshot],
	empty: false,
	size: 1,
	query: {},
	metadata: {
		fromCache: false,
		hasPendingWrites: false,
	},
	docChanges: jest.fn(),
	forEach: jest.fn(),
};

// Mock Firestore Document Reference
export const mockDocumentReference = {
	id: 'test-doc-id',
	path: 'test-collection/test-doc-id',
	parent: null,
	collection: jest.fn().mockReturnValue(null),
	get: jest.fn().mockResolvedValue(mockDocumentSnapshot),
	set: jest.fn().mockResolvedValue(undefined),
	update: jest.fn().mockResolvedValue(undefined),
	delete: jest.fn().mockResolvedValue(undefined),
	onSnapshot: jest.fn(),
	withConverter: jest.fn(),
};

// Mock Firestore Collection Reference
export const mockCollectionReference = {
	id: 'test-collection',
	path: 'test-collection',
	parent: null,
	doc: jest.fn().mockReturnValue(mockDocumentReference),
	add: jest.fn(),
	withConverter: jest.fn(),
};

// Mock Firestore Query
export const mockQuery = {
	where: jest.fn().mockReturnThis(),
	orderBy: jest.fn().mockReturnThis(),
	limit: jest.fn().mockReturnThis(),
	startAfter: jest.fn().mockReturnThis(),
	startAt: jest.fn().mockReturnThis(),
	endBefore: jest.fn().mockReturnThis(),
	endAt: jest.fn().mockReturnThis(),
	limitToLast: jest.fn().mockReturnThis(),
	get: jest.fn().mockResolvedValue(mockQuerySnapshot),
	onSnapshot: jest.fn(),
	withConverter: jest.fn(),
};

// Mock Firestore Write Batch
export const mockWriteBatch = {
	set: jest.fn().mockReturnThis(),
	update: jest.fn().mockReturnThis(),
	delete: jest.fn().mockReturnThis(),
	commit: jest.fn().mockResolvedValue(undefined),
};

// Mock Firestore functions
export const mockFirestoreFunctions = {
	collection: jest.fn().mockReturnValue(mockCollectionReference),
	doc: jest.fn().mockReturnValue(mockDocumentReference),
	query: jest.fn().mockReturnValue(mockQuery),
	where: jest.fn().mockReturnValue(mockQuery),
	orderBy: jest.fn().mockReturnValue(mockQuery),
	limit: jest.fn().mockReturnValue(mockQuery),
	startAfter: jest.fn().mockReturnValue(mockQuery),
	startAt: jest.fn().mockReturnValue(mockQuery),
	endBefore: jest.fn().mockReturnValue(mockQuery),
	endAt: jest.fn().mockReturnValue(mockQuery),
	limitToLast: jest.fn().mockReturnValue(mockQuery),
	getDoc: jest.fn().mockResolvedValue(mockDocumentSnapshot),
	getDocs: jest.fn().mockResolvedValue(mockQuerySnapshot),
	setDoc: jest.fn().mockResolvedValue(undefined),
	updateDoc: jest.fn().mockResolvedValue(undefined),
	deleteDoc: jest.fn().mockResolvedValue(undefined),
	onSnapshot: jest.fn(),
	writeBatch: jest.fn().mockReturnValue(mockWriteBatch),
	serverTimestamp: jest.fn().mockReturnValue(Timestamp.fromDate(new Date())),
	Timestamp: Timestamp,
};

// Mock Firebase App
export const mockFirebaseApp = {
	name: 'test-app',
	options: {
		apiKey: 'test-api-key',
		authDomain: 'test-project.firebaseapp.com',
		projectId: 'test-project',
		storageBucket: 'test-project.appspot.com',
		messagingSenderId: '123456789',
		appId: 'test-app-id',
	},
	automaticDataCollectionEnabled: false,
};

// Mock Analytics
export const mockAnalytics = {
	app: mockFirebaseApp,
	logEvent: jest.fn(),
	setCurrentScreen: jest.fn(),
	setUserId: jest.fn(),
	setUserProperties: jest.fn(),
	setDefaultEventParameters: jest.fn(),
};

// Mock Performance
export const mockPerformance = {
	app: mockFirebaseApp,
	trace: jest.fn().mockReturnValue({
		start: jest.fn(),
		stop: jest.fn(),
		incrementMetric: jest.fn(),
		putMetric: jest.fn(),
		getAttribute: jest.fn(),
		putAttribute: jest.fn(),
		removeAttribute: jest.fn(),
		getAttributes: jest.fn(),
	}),
};

// Mock FirestoreClient
export const mockFirestoreClient = {
	db: mockFirestore,
	getDocument: jest.fn().mockResolvedValue(mockDocumentSnapshot.data()),
	getCollection: jest.fn().mockResolvedValue([mockDocumentSnapshot.data()]),
	setDocument: jest.fn().mockResolvedValue(undefined),
	updateDocument: jest.fn().mockResolvedValue(undefined),
	deleteDocument: jest.fn().mockResolvedValue(undefined),
	subscribeToDocument: jest.fn().mockReturnValue(() => {}),
	subscribeToCollection: jest.fn().mockReturnValue(() => {}),
	createBatch: jest.fn().mockReturnValue(mockWriteBatch),
	executeBatch: jest.fn().mockResolvedValue(undefined),
};

// Setup default mocks
jest.mock('firebase/app', () => ({
	initializeApp: jest.fn().mockReturnValue(mockFirebaseApp),
	getApps: jest.fn().mockReturnValue([mockFirebaseApp]),
}));

jest.mock('firebase/auth', () => ({
	getAuth: jest.fn().mockReturnValue(mockAuth),
}));

jest.mock('firebase/firestore', () => ({
	...mockFirestoreFunctions,
	getFirestore: jest.fn().mockReturnValue(mockFirestore),
	connectFirestoreEmulator: jest.fn(),
}));

jest.mock('firebase/analytics', () => ({
	getAnalytics: jest.fn().mockReturnValue(mockAnalytics),
}));

jest.mock('firebase/performance', () => ({
	getPerformance: jest.fn().mockReturnValue(mockPerformance),
}));

export default {
	mockAuth,
	mockFirestore,
	mockFirebaseApp,
	mockAnalytics,
	mockPerformance,
	mockFirestoreClient,
};
