// Type definitions for Firestore documents
// Based on our Firestore schema and WatermelonDB models

export interface FirestoreUserDocument {
	id: string;
	email: string;
	name: string;
	photo_url?: string;
	is_active: boolean;
	created_at: number;
	updated_at: number;
}

export interface FirestoreTrackerDocument {
	id: string;
	name: string;
	description?: string;
	is_active: boolean;
	owner_id: string;
	created_at: number;
	updated_at: number;
}

export interface FirestoreEntryDocument {
	id: string;
	date: string;
	status: string;
	is_advisory: boolean;
	notes?: string;
	user_id: string;
	tracker_id: string;
	created_at: number;
	updated_at: number;
}

export interface FirestoreShareDocument {
	id: string;
	tracker_id: string;
	shared_with_user_id: string;
	permission: 'read' | 'write';
	is_active: boolean;
	created_by_user_id: string;
	created_at: number;
	updated_at: number;
}

// Union type for all known Firestore document types
export type KnownFirestoreDocument =
	| FirestoreUserDocument
	| FirestoreTrackerDocument
	| FirestoreEntryDocument
	| FirestoreShareDocument;

// Base document interface with id field
export interface BaseFirestoreDocument {
	id: string;
	[key: string]: string | number | boolean | undefined;
}

// DocumentData is an alias for BaseFirestoreDocument
// This is the default type used by FirestoreClient when no specific type is provided
export type DocumentData = BaseFirestoreDocument;
