// migrated to V2 structure

/**
 * Branded type for service identifiers that carry type information
 * This ensures type safety throughout the DI container
 */
export type TypedServiceIdentifier<T> = symbol & { __type: T };

/**
 * Service identifier - can be a string, symbol, or class constructor
 *
 * TypeScript infers the type from the factory function during registration,
 * so explicit type parameters are optional. Type assertions are used at
 * resolution sites, which is acceptable for a controlled codebase.
 */
export type ServiceIdentifier<T = unknown> =
	| TypedServiceIdentifier<T>
	| string
	| symbol
	| (new (...args: unknown[]) => T);

/**
 * Factory function for creating service instances
 *
 * TypeScript infers the return type from the factory implementation,
 * so explicit type parameters are optional.
 */
export type ServiceFactory<T = unknown> = (container: Container) => T;

/**
 * Service registration configuration
 *
 * TypeScript infers the service type from the factory function,
 * so explicit type parameters are optional.
 */
export interface ServiceRegistration<T = unknown> {
	identifier: ServiceIdentifier<T>;
	factory: ServiceFactory<T>;
	scope: ServiceScope;
	singleton?: boolean;
}

/**
 * Create a typed service identifier (optional helper)
 *
 * This is an OPTIONAL helper for type-safe resolution without assertions.
 * For most use cases, plain Symbols with type assertions at resolution
 * are sufficient and simpler for a controlled codebase.
 *
 * @example
 * // Optional: Use for type-safe resolution (no assertion needed)
 * const DB_ID = createServiceIdentifier<Database>('Database');
 * const db = container.resolve(DB_ID); // Type: Database
 *
 * // Standard: Use plain Symbols with assertions (simpler, recommended)
 * const DB_ID = Symbol('Database');
 * const db = container.resolve(DB_ID) as Database; // Type assertion
 */
export function createServiceIdentifier<T>(
	description: string
): TypedServiceIdentifier<T> {
	return Symbol(description) as TypedServiceIdentifier<T>;
}

/**
 * Service scope types
 */
export enum ServiceScope {
	SINGLETON = 'singleton',
	TRANSIENT = 'transient',
	SCOPED = 'scoped',
}

/**
 * Container interface for dependency injection
 */
export interface Container {
	/**
	 * Register a service with the container
	 */
	register<T>(registration: ServiceRegistration<T>): void;

	/**
	 * Register a singleton service
	 */
	registerSingleton<T>(
		identifier: ServiceIdentifier<T>,
		factory: ServiceFactory<T>
	): void;

	/**
	 * Register a transient service
	 */
	registerTransient<T>(
		identifier: ServiceIdentifier<T>,
		factory: ServiceFactory<T>
	): void;

	/**
	 * Register a scoped service
	 */
	registerScoped<T>(
		identifier: ServiceIdentifier<T>,
		factory: ServiceFactory<T>
	): void;

	/**
	 * Resolve a service from the container
	 */
	resolve<T>(identifier: ServiceIdentifier<T>): T;

	/**
	 * Check if a service is registered
	 */
	isRegistered<T>(identifier: ServiceIdentifier<T>): boolean;

	/**
	 * Create a child container
	 */
	createChild(): Container;

	/**
	 * Dispose of the container and all its services
	 */
	dispose(): void;
}

/**
 * Container builder interface
 */
export interface ContainerBuilder {
	/**
	 * Register a service
	 */
	register<T>(registration: ServiceRegistration<T>): ContainerBuilder;

	/**
	 * Register a singleton service
	 */
	registerSingleton<T>(
		identifier: ServiceIdentifier<T>,
		factory: ServiceFactory<T>
	): ContainerBuilder;

	/**
	 * Register a transient service
	 */
	registerTransient<T>(
		identifier: ServiceIdentifier<T>,
		factory: ServiceFactory<T>
	): ContainerBuilder;

	/**
	 * Register a scoped service
	 */
	registerScoped<T>(
		identifier: ServiceIdentifier<T>,
		factory: ServiceFactory<T>
	): ContainerBuilder;

	/**
	 * Build the container
	 */
	build(): Container;
}

/**
 * Disposable interface for services that need cleanup
 */
export interface Disposable {
	dispose(): void;
}

/**
 * Service registration error
 */
export class ServiceRegistrationError extends Error {
	constructor(identifier: ServiceIdentifier<unknown>, message: string) {
		super(
			`Service registration error for ${String(identifier)}: ${message}`
		);
		this.name = 'ServiceRegistrationError';
	}
}

/**
 * Service resolution error
 */
export class ServiceResolutionError extends Error {
	constructor(identifier: ServiceIdentifier<unknown>, message: string) {
		super(`Service resolution error for ${String(identifier)}: ${message}`);
		this.name = 'ServiceResolutionError';
	}
}
