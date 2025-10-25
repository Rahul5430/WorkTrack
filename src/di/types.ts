// migrated to V2 structure

/**
 * Service identifier - can be a string, symbol, or class constructor
 */
export type ServiceIdentifier<T = unknown> =
	| string
	| symbol
	| (new (...args: unknown[]) => T);

/**
 * Factory function for creating service instances
 */
export type ServiceFactory<T = unknown> = (container: Container) => T;

/**
 * Service registration configuration
 */
export interface ServiceRegistration<T = unknown> {
	identifier: ServiceIdentifier<T>;
	factory: ServiceFactory<T>;
	scope: ServiceScope;
	singleton?: boolean;
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
	constructor(identifier: ServiceIdentifier, message: string) {
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
	constructor(identifier: ServiceIdentifier, message: string) {
		super(`Service resolution error for ${String(identifier)}: ${message}`);
		this.name = 'ServiceResolutionError';
	}
}
