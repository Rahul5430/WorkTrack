// Type definitions for Firestore query constraints
import type { FirebaseFirestoreTypes } from '@react-native-firebase/firestore';

/**
 * Valid value types that can be used in Firestore queries
 * Based on Firestore's supported value types
 *
 * Note: Arrays and objects can contain nested values, but we avoid
 * recursive types to prevent circular references. In practice, Firestore
 * values are typically shallow (primitives, dates, timestamps).
 */
export type FirestoreQueryValue =
	| string
	| number
	| boolean
	| null
	| Date
	| FirebaseFirestoreTypes.Timestamp
	| FirebaseFirestoreTypes.GeoPoint
	| FirebaseFirestoreTypes.FieldValue
	| Array<
			| string
			| number
			| boolean
			| null
			| Date
			| FirebaseFirestoreTypes.Timestamp
	  >
	| Record<
			string,
			| string
			| number
			| boolean
			| null
			| Date
			| FirebaseFirestoreTypes.Timestamp
			| FirebaseFirestoreTypes.FieldValue
	  >;

/**
 * Where clause constraint for Firestore queries
 */
export interface FirestoreWhereConstraint {
	type: 'where';
	field: string;
	operator: FirebaseFirestoreTypes.WhereFilterOp;
	value: FirestoreQueryValue;
}

/**
 * OrderBy clause constraint for Firestore queries
 */
export interface FirestoreOrderByConstraint {
	type: 'orderBy';
	field: string;
	direction?: 'asc' | 'desc';
}

/**
 * Limit clause constraint for Firestore queries
 */
export interface FirestoreLimitConstraint {
	type: 'limit';
	count: number;
}

/**
 * StartAfter clause constraint for Firestore queries (for pagination)
 */
export interface FirestoreStartAfterConstraint {
	type: 'startAfter';
	docSnapshot: FirebaseFirestoreTypes.QueryDocumentSnapshot;
}

/**
 * Union type for all Firestore query constraints
 */
export type FirestoreQueryConstraint =
	| FirestoreWhereConstraint
	| FirestoreOrderByConstraint
	| FirestoreLimitConstraint
	| FirestoreStartAfterConstraint;
