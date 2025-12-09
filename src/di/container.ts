// migrated to V2 structure
import { logger } from '@/shared/utils/logging';

import {
	Container as IContainer,
	Disposable,
	ServiceFactory,
	ServiceIdentifier,
	ServiceRegistration,
	ServiceRegistrationError,
	ServiceResolutionError,
	ServiceScope,
} from './types';

/**
 * Type for stored service instances in the container
 * Services are stored as objects (or null), providing better type safety than unknown
 * while still allowing the container to store any service type
 */
type ServiceInstanceValue = object | null;

/**
 * Service instance wrapper for internal storage
 * Uses unknown to allow storing different service types in the same Map
 */
interface ServiceInstance<T = unknown> {
	instance?: T;
	factory: ServiceFactory<T>;
	scope: ServiceScope;
	disposable?: boolean;
}

/**
 * Dependency Injection Container implementation
 * Manages service lifecycle and dependency resolution
 *
 * TypeScript infers service types from factory functions during registration.
 * Type assertions are used at resolution sites, which is acceptable for a
 * controlled codebase where all services are known.
 */
export class Container implements IContainer {
	// Internal storage uses unknown to store different service types in Maps
	// This is necessary for runtime storage but doesn't affect type safety
	// at usage sites where type assertions are used
	private services = new Map<
		ServiceIdentifier<unknown>,
		ServiceInstance<unknown>
	>();
	private singletons = new Map<
		ServiceIdentifier<unknown>,
		ServiceInstanceValue
	>();
	private scopedInstances = new Map<
		ServiceIdentifier<unknown>,
		ServiceInstanceValue
	>();
	private disposed = false;
	private parent?: Container;

	constructor(parent?: Container) {
		this.parent = parent;
	}

	/**
	 * Register a service with the container
	 */
	register<T>(registration: ServiceRegistration<T>): void {
		if (this.disposed) {
			throw new ServiceRegistrationError(
				registration.identifier,
				'Cannot register services on a disposed container'
			);
		}

		if (this.services.has(registration.identifier)) {
			throw new ServiceRegistrationError(
				registration.identifier,
				'Service is already registered'
			);
		}

		// Store with unknown type for internal storage
		// Type safety is maintained at the public API level
		this.services.set(
			registration.identifier as ServiceIdentifier<unknown>,
			{
				factory: registration.factory as ServiceFactory<unknown>,
				scope: registration.scope,
				disposable: this.isDisposable(
					registration.factory as ServiceFactory<object | null>
				),
			}
		);

		logger.debug(`Registered service: ${String(registration.identifier)}`);
	}

	/**
	 * Register a singleton service
	 */
	registerSingleton<T>(
		identifier: ServiceIdentifier<T>,
		factory: ServiceFactory<T>
	): void {
		this.register({
			identifier,
			factory,
			scope: ServiceScope.SINGLETON,
		});
	}

	/**
	 * Register a transient service
	 */
	registerTransient<T>(
		identifier: ServiceIdentifier<T>,
		factory: ServiceFactory<T>
	): void {
		this.register({
			identifier,
			factory,
			scope: ServiceScope.TRANSIENT,
		});
	}

	/**
	 * Register a scoped service
	 */
	registerScoped<T>(
		identifier: ServiceIdentifier<T>,
		factory: ServiceFactory<T>
	): void {
		this.register({
			identifier,
			factory,
			scope: ServiceScope.SCOPED,
		});
	}

	/**
	 * Resolve a service from the container
	 */
	resolve<T>(identifier: ServiceIdentifier<T>): T {
		if (this.disposed) {
			throw new ServiceResolutionError(
				identifier,
				'Cannot resolve services from a disposed container'
			);
		}

		// Check if service is registered in this container
		// Type assertion is safe because we verify the identifier matches
		const registration = this.services.get(
			identifier as ServiceIdentifier<unknown>
		);
		if (registration) {
			return this.createInstance(
				identifier,
				registration as ServiceInstance<T>
			);
		}

		// Check parent container
		if (this.parent) {
			return this.parent.resolve(identifier);
		}

		throw new ServiceResolutionError(
			identifier,
			'Service is not registered'
		);
	}

	/**
	 * Check if a service is registered
	 */
	isRegistered<T>(identifier: ServiceIdentifier<T>): boolean {
		if (this.services.has(identifier as ServiceIdentifier<unknown>)) {
			return true;
		}

		if (this.parent) {
			return this.parent.isRegistered(identifier);
		}

		return false;
	}

	/**
	 * Create a child container
	 */
	createChild(): Container {
		return new Container(this);
	}

	/**
	 * Dispose of the container and all its services
	 */
	dispose(): void {
		if (this.disposed) {
			return;
		}

		// Dispose all singleton instances
		for (const [identifier, instance] of this.singletons) {
			this.disposeInstance(identifier, instance);
		}

		// Dispose all scoped instances
		for (const [identifier, instance] of this.scopedInstances) {
			this.disposeInstance(identifier, instance);
		}

		// Clear all maps
		this.services.clear();
		this.singletons.clear();
		this.scopedInstances.clear();

		this.disposed = true;
		logger.info('Container disposed');
	}

	/**
	 * Create a service instance based on its scope
	 */
	private createInstance<T>(
		identifier: ServiceIdentifier<T>,
		registration: ServiceInstance<T>
	): T {
		switch (registration.scope) {
			case ServiceScope.SINGLETON:
				return this.createSingleton(identifier, registration);

			case ServiceScope.TRANSIENT:
				return this.createTransient(identifier, registration);

			case ServiceScope.SCOPED:
				return this.createScoped(identifier, registration);

			default:
				throw new ServiceResolutionError(
					identifier,
					`Unknown service scope: ${registration.scope}`
				);
		}
	}

	/**
	 * Create or return existing singleton instance
	 */
	private createSingleton<T>(
		identifier: ServiceIdentifier<T>,
		registration: ServiceInstance<T>
	): T {
		const storageKey = identifier as ServiceIdentifier<unknown>;
		if (this.singletons.has(storageKey)) {
			return this.singletons.get(storageKey) as T;
		}

		const instance = registration.factory(this);
		// Services in DI containers are typically objects, so we can safely cast
		// If a service is a primitive, it will be stored as an object wrapper
		this.singletons.set(storageKey, instance as ServiceInstanceValue);

		logger.debug(`Created singleton instance: ${String(identifier)}`);
		return instance;
	}

	/**
	 * Create a new transient instance
	 */
	private createTransient<T>(
		identifier: ServiceIdentifier<T>,
		registration: ServiceInstance<T>
	): T {
		const instance = registration.factory(this);
		logger.debug(`Created transient instance: ${String(identifier)}`);
		return instance;
	}

	/**
	 * Create or return existing scoped instance
	 */
	private createScoped<T>(
		identifier: ServiceIdentifier<T>,
		registration: ServiceInstance<T>
	): T {
		const storageKey = identifier as ServiceIdentifier<unknown>;
		if (this.scopedInstances.has(storageKey)) {
			return this.scopedInstances.get(storageKey) as T;
		}

		const instance = registration.factory(this);
		// Services in DI containers are typically objects, so we can safely cast
		// If a service is a primitive, it will be stored as an object wrapper
		this.scopedInstances.set(storageKey, instance as ServiceInstanceValue);

		logger.debug(`Created scoped instance: ${String(identifier)}`);
		return instance;
	}

	/**
	 * Check if a factory creates a disposable instance
	 * Accepts any factory type for runtime checking
	 */
	private isDisposable(factory: ServiceFactory<object | null>): boolean {
		// This is a simplified check - in a real implementation,
		// you might want to use reflection or metadata to determine this
		try {
			const testInstance = factory(this);
			return (
				typeof testInstance === 'object' &&
				testInstance !== null &&
				typeof (testInstance as Disposable).dispose === 'function'
			);
		} catch {
			return false;
		}
	}

	/**
	 * Dispose of a service instance if it's disposable
	 */
	private disposeInstance(
		identifier: ServiceIdentifier<unknown>,
		instance: ServiceInstanceValue
	): void {
		if (this.isDisposableInstance(instance)) {
			try {
				instance.dispose();
				logger.info(`Disposed instance: ${String(identifier)}`);
			} catch (error) {
				logger.error(
					`Error disposing instance ${String(identifier)}:`,
					error
				);
			}
		}
	}

	/**
	 * Check if an instance implements Disposable
	 * Using ServiceInstanceValue instead of unknown for better type safety
	 */
	private isDisposableInstance(
		instance: ServiceInstanceValue
	): instance is Disposable {
		return (
			typeof instance === 'object' &&
			instance !== null &&
			typeof (instance as Disposable).dispose === 'function'
		);
	}
}
