/**
 * Types for JSON serialization
 * Used for error contexts, toJSON() methods, and other serializable data
 */

/**
 * Primitive values that can be safely serialized to JSON
 */
type SerializablePrimitive = string | number | boolean | null | undefined;

/**
 * A record/dictionary with serializable values
 * Used for error contexts and other key-value structures that need to be serialized
 *
 * Note: Values are limited to primitives and arrays of primitives to avoid circular references.
 * In practice, error contexts are typically shallow structures with primitive values.
 */
export type SerializableRecord = Record<
	string,
	SerializablePrimitive | SerializablePrimitive[]
>;

/**
 * Values that can be safely serialized to JSON
 * Includes primitives, arrays of primitives, and plain objects
 */
export type SerializableValue =
	| SerializablePrimitive
	| SerializablePrimitive[]
	| SerializableRecord;

/**
 * JSON-serializable object
 * Used for toJSON() return types
 */
export type SerializableObject = SerializableRecord;
